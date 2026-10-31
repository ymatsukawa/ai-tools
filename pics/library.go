package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image"
	"os"
	"path/filepath"
	"runtime"
	"runtime/debug"
	"sort"
	"strings"
	"sync"

	// 対応フォーマットのデコーダー登録
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/bmp"
	"golang.org/x/image/draw"
	_ "golang.org/x/image/tiff"
	_ "golang.org/x/image/webp"
)

// maxTotalBytes はフォルダー内画像の合計サイズ上限 (8GiB)。
const maxTotalBytes int64 = 8 << 30

// thumbSize はサムネイルの長辺ピクセル数。
const thumbSize = 160

// prefetchRadius は表示中画像の前後で先にデコードしておく枚数。
const prefetchRadius = 2

// ErrTooLarge は合計サイズが上限を超えたときのエラー。
var ErrTooLarge = errors.New("合計ファイルサイズが 8GB を超えています。分割してください")

var supportedExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
	".bmp": true, ".webp": true, ".tif": true, ".tiff": true,
}

type fileInfo struct {
	name string
	path string
	size int64
}

// scanFolder は dir 直下の対応画像を名前順に列挙し、合計サイズを検査する。
// 上限超過時は ErrTooLarge を返し、ファイル本体は一切読まない。
func scanFolder(dir string) ([]fileInfo, error) {
	ents, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var files []fileInfo
	var total int64
	for _, e := range ents {
		if !e.Type().IsRegular() || !supportedExt[strings.ToLower(filepath.Ext(e.Name()))] {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		total += info.Size()
		files = append(files, fileInfo{name: e.Name(), path: filepath.Join(dir, e.Name()), size: info.Size()})
	}
	if total > maxTotalBytes {
		return nil, ErrTooLarge
	}
	sort.Slice(files, func(i, j int) bool { return strings.ToLower(files[i].name) < strings.ToLower(files[j].name) })
	return files, nil
}

type decodeJob struct {
	done chan struct{}
	img  image.Image
	err  error
}

// Library は 1 フォルダー分の画像をメモリー上に保持する。
//   - data:   全ファイルの生バイト (≤8GB)
//   - thumbs: サムネイル (バックグラウンド生成)
//   - jobs:   表示中画像 ±prefetchRadius のデコード結果
type Library struct {
	Dir   string
	files []fileInfo

	ctx    context.Context
	cancel context.CancelFunc
	wg     sync.WaitGroup

	mu     sync.Mutex
	data   [][]byte
	thumbs []image.Image
	jobs   map[int]*decodeJob
}

// LoadLibrary はファイル本体をすべてメモリーに読み込む。
// progress は (読込済み件数, 総件数) で呼ばれる (任意の goroutine から)。
func LoadLibrary(dir string, files []fileInfo, progress func(done, total int)) (*Library, error) {
	ctx, cancel := context.WithCancel(context.Background())
	lib := &Library{
		Dir:    dir,
		files:  files,
		ctx:    ctx,
		cancel: cancel,
		data:   make([][]byte, len(files)),
		thumbs: make([]image.Image, len(files)),
		jobs:   map[int]*decodeJob{},
	}

	idx := make(chan int)
	var (
		wg       sync.WaitGroup
		errOnce  sync.Once
		firstErr error
		doneMu   sync.Mutex
		done     int
	)
	for w := 0; w < min(8, max(1, len(files))); w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range idx {
				b, err := os.ReadFile(files[i].path)
				if err != nil {
					errOnce.Do(func() { firstErr = fmt.Errorf("%s の読み込みに失敗しました: %w", files[i].name, err) })
					continue
				}
				lib.data[i] = b
				doneMu.Lock()
				done++
				n := done
				doneMu.Unlock()
				if progress != nil {
					progress(n, len(files))
				}
			}
		}()
	}
	for i := range files {
		idx <- i
	}
	close(idx)
	wg.Wait()

	if firstErr != nil {
		lib.Close()
		return nil, firstErr
	}
	return lib, nil
}

func (l *Library) Len() int { return len(l.files) }

func (l *Library) Name(i int) string { return l.files[i].name }

// Thumb は生成済みサムネイルを返す (未生成なら nil)。
func (l *Library) Thumb(i int) image.Image {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.thumbs == nil {
		return nil
	}
	return l.thumbs[i]
}

// StartThumbnails はサムネイルをバックグラウンドで生成し、1 枚ごとに onReady(i) を呼ぶ。
func (l *Library) StartThumbnails(onReady func(i int)) {
	idx := make(chan int)
	workers := max(1, runtime.NumCPU()-1) // 1 コアは表示用デコードに残す

	l.wg.Add(1)
	go func() {
		defer l.wg.Done()
		defer close(idx)
		for i := range l.files {
			select {
			case idx <- i:
			case <-l.ctx.Done():
				return
			}
		}
	}()

	for w := 0; w < workers; w++ {
		l.wg.Add(1)
		go func() {
			defer l.wg.Done()
			for i := range idx {
				if l.ctx.Err() != nil {
					return
				}
				src, err := l.decodeRaw(i)
				if err != nil {
					continue
				}
				t := scaleToFit(src, thumbSize)
				l.mu.Lock()
				if l.thumbs != nil {
					l.thumbs[i] = t
				}
				l.mu.Unlock()
				onReady(i)
			}
		}()
	}
}

// Image は i 番目のデコード済み画像のジョブを返す。未着手ならデコードを開始する。
// あわせて前後 prefetchRadius 枚を先読みし、範囲外のデコード結果を破棄する。
func (l *Library) Image(i int) *decodeJob {
	l.mu.Lock()
	defer l.mu.Unlock()

	for k := range l.jobs {
		if k < i-prefetchRadius || k > i+prefetchRadius {
			delete(l.jobs, k)
		}
	}
	// 現在の画像を最優先で起動し、その後に近い順で先読み
	cur := l.startJobLocked(i)
	for d := 1; d <= prefetchRadius; d++ {
		l.startJobLocked(i + d)
		l.startJobLocked(i - d)
	}
	return cur
}

func (l *Library) startJobLocked(i int) *decodeJob {
	if i < 0 || i >= len(l.files) || l.jobs == nil {
		return nil
	}
	if j, ok := l.jobs[i]; ok {
		return j
	}
	j := &decodeJob{done: make(chan struct{})}
	l.jobs[i] = j
	l.wg.Add(1)
	go func() {
		defer l.wg.Done()
		defer close(j.done)
		if l.ctx.Err() != nil {
			j.err = l.ctx.Err()
			return
		}
		j.img, j.err = l.decodeRaw(i)
	}()
	return j
}

func (l *Library) decodeRaw(i int) (image.Image, error) {
	l.mu.Lock()
	var b []byte
	if l.data != nil {
		b = l.data[i]
	}
	l.mu.Unlock()
	if b == nil {
		return nil, errors.New("released")
	}
	img, _, err := image.Decode(bytes.NewReader(b))
	return img, err
}

// Close は進行中の処理を止め、保持しているメモリーをすべて解放する。
func (l *Library) Close() {
	l.cancel()
	l.wg.Wait()
	l.mu.Lock()
	l.data = nil
	l.thumbs = nil
	l.jobs = nil
	l.mu.Unlock()
	runtime.GC()
	debug.FreeOSMemory()
}

// scaleToFit は長辺が maxSide に収まるよう縮小する (拡大はしない)。
func scaleToFit(src image.Image, maxSide int) image.Image {
	b := src.Bounds()
	w, h := b.Dx(), b.Dy()
	if w <= maxSide && h <= maxSide {
		return src
	}
	if w >= h {
		h = max(1, h*maxSide/w)
		w = maxSide
	} else {
		w = max(1, w*maxSide/h)
		h = maxSide
	}
	dst := image.NewRGBA(image.Rect(0, 0, w, h))
	draw.BiLinear.Scale(dst, dst.Bounds(), src, b, draw.Src, nil)
	return dst
}

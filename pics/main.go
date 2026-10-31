package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

type viewer struct {
	win fyne.Window

	lib     *Library // メインスレッドからのみ触る
	cur     int
	loading bool

	sidebar *fyne.Container
	list    *widget.List
	view    *tapImage
	status  *widget.Label
	openBtn *widget.Button
	copyBtn *widget.Button
	nameRow *fyne.Container
}

// setStatus は名前表示を更新し、コピーボタンを文字列の直後へ再配置する。
func (v *viewer) setStatus(text string) {
	v.status.SetText(text)
	v.nameRow.Refresh()
}

var errDirNotFound = errors.New("ディレクトリが見つかりませんでした")

// startDir は起動引数 (args[1]) のディレクトリを絶対パスにして返す。
// 相対パスはカレントディレクトリ基準で解決する。
// 指定なしなら ("", nil)、存在しない・ディレクトリでなければ errDirNotFound。
func startDir(args []string) (string, error) {
	if len(args) < 2 || args[1] == "" {
		return "", nil
	}
	abs, err := filepath.Abs(args[1])
	if err != nil {
		return "", errDirNotFound
	}
	if fi, err := os.Stat(abs); err != nil || !fi.IsDir() {
		return "", errDirNotFound
	}
	return abs, nil
}

func main() {
	initialDir, initialErr := startDir(os.Args)

	// フォルダー選択ダイアログが Preferences (最後に開いたフォルダー等) を使うため ID が必要
	a := app.NewWithID("local.ymatsukawa.pics")
	w := a.NewWindow("Pics")
	v := &viewer{win: w}

	v.status = widget.NewLabel("")
	v.status.Truncation = fyne.TextTruncateEllipsis
	v.openBtn = widget.NewButtonWithIcon("フォルダーを開く", theme.FolderOpenIcon(), v.chooseFolder)
	v.copyBtn = widget.NewButtonWithIcon("", theme.ContentCopyIcon(), v.copyName)
	v.copyBtn.Disable()
	v.view = newTapImage(func() { v.navigate(1) }, func() { v.navigate(-1) })
	v.sidebar = container.NewStack(widget.NewLabel("フォルダーを開いてください"))

	prev := widget.NewButtonWithIcon("", theme.NavigateBackIcon(), func() { v.navigate(-1) })
	next := widget.NewButtonWithIcon("", theme.NavigateNextIcon(), func() { v.navigate(1) })

	v.nameRow = container.New(nameRowLayout{label: v.status}, v.status, v.copyBtn)
	top := container.NewBorder(nil, nil, v.openBtn, nil, v.nameRow)
	mainArea := container.NewBorder(nil, container.NewCenter(container.NewHBox(prev, next)), nil, nil, v.view)
	split := container.NewHSplit(v.sidebar, mainArea)
	split.Offset = 0 // サイドバーは最小幅から開始 (ドラッグで可変)

	w.SetContent(container.NewBorder(top, nil, nil, nil, split))
	w.Canvas().SetOnTypedKey(func(ev *fyne.KeyEvent) {
		switch ev.Name {
		case fyne.KeyRight:
			v.navigate(1)
		case fyne.KeyLeft:
			v.navigate(-1)
		}
	})

	// アプリケーション終了時に確保メモリーを破棄
	a.Lifecycle().SetOnStopped(v.release)
	// 起動後、画面の可視領域いっぱいまでウィンドウを広げ、
	// 起動引数のディレクトリがあれば開く (見つからなければエラー表示)
	a.Lifecycle().SetOnStarted(func() {
		go fyne.Do(func() {
			fitToScreen(w)
			switch {
			case initialErr != nil:
				dialog.ShowError(initialErr, w)
			case initialDir != "":
				v.loadFolder(initialDir)
			}
		})
	})

	w.Resize(fyne.NewSize(1280, 800))
	w.ShowAndRun()
}

func (v *viewer) chooseFolder() {
	if v.loading {
		return
	}
	dialog.ShowFolderOpen(func(uri fyne.ListableURI, err error) {
		if err != nil {
			dialog.ShowError(err, v.win)
			return
		}
		if uri == nil {
			return // キャンセル
		}
		v.loadFolder(uri.Path())
	}, v.win)
}

func (v *viewer) loadFolder(dir string) {
	files, err := scanFolder(dir)
	if errors.Is(err, ErrTooLarge) {
		dialog.ShowError(ErrTooLarge, v.win)
		return
	}
	if err != nil {
		dialog.ShowError(err, v.win)
		return
	}
	if len(files) == 0 {
		dialog.ShowInformation("画像なし", "対応する画像ファイルが見つかりません", v.win)
		return
	}

	v.loading = true
	v.openBtn.Disable()

	// 別フォルダーの読み込み前に、現在の確保メモリーを破棄する
	old := v.detach()

	bar := widget.NewProgressBar()
	bar.Max = float64(len(files))
	prog := dialog.NewCustomWithoutButtons("読み込み中", container.NewVBox(widget.NewLabel(dir), bar), v.win)
	prog.Show()

	go func() {
		if old != nil {
			old.Close()
		}
		lib, err := LoadLibrary(dir, files, func(done, _ int) {
			fyne.Do(func() { bar.SetValue(float64(done)) })
		})
		fyne.Do(func() {
			prog.Hide()
			v.loading = false
			v.openBtn.Enable()
			if err != nil {
				dialog.ShowError(err, v.win)
				return
			}
			v.attach(lib)
		})
	}()
}

// attach は読み込み済みライブラリーを UI に結びつける。
func (v *viewer) attach(lib *Library) {
	v.lib = lib
	v.cur = 0

	var list *widget.List
	list = widget.NewList(
		func() int { return lib.Len() },
		func() fyne.CanvasObject {
			img := &canvas.Image{FillMode: canvas.ImageFillContain, ScaleMode: canvas.ImageScaleSmooth}
			img.SetMinSize(fyne.NewSize(thumbSize, thumbSize*3/4))
			label := widget.NewLabel("")
			label.Truncation = fyne.TextTruncateEllipsis
			return container.NewBorder(nil, label, nil, nil, img)
		},
		func(id widget.ListItemID, o fyne.CanvasObject) {
			c := o.(*fyne.Container)
			c.Objects[1].(*widget.Label).SetText(lib.Name(id))
			img := c.Objects[0].(*canvas.Image)
			img.Image = lib.Thumb(id)
			img.Refresh()
		},
	)
	list.OnSelected = func(id widget.ListItemID) {
		v.show(id)
		// リストがフォーカスを持つと ←/→ がキャンバスに届かないため外す
		v.win.Canvas().Unfocus()
	}
	v.list = list
	v.sidebar.Objects = []fyne.CanvasObject{list}
	v.sidebar.Refresh()

	lib.StartThumbnails(func(i int) {
		fyne.Do(func() {
			if v.lib == lib {
				list.RefreshItem(i)
			}
		})
	})
	list.Select(0)
}

// detach は UI から現在のライブラリーを切り離し、参照をすべて外して返す。
func (v *viewer) detach() *Library {
	old := v.lib
	v.lib = nil
	v.list = nil
	v.view.SetImage(nil)
	v.setStatus("")
	v.copyBtn.Disable()
	v.sidebar.Objects = []fyne.CanvasObject{widget.NewLabel("読み込み中…")}
	v.sidebar.Refresh()
	return old
}

func (v *viewer) release() {
	if old := v.detach(); old != nil {
		old.Close()
	}
}

// copyName は表示中画像のファイル名をクリップボードへコピーし、
// ボタンのアイコンを一時的にチェックマークにして完了を示す。
func (v *viewer) copyName() {
	if v.lib == nil {
		return
	}
	fyne.CurrentApp().Clipboard().SetContent(v.lib.Name(v.cur))
	v.win.Canvas().Unfocus()

	v.copyBtn.SetIcon(theme.ConfirmIcon())
	time.AfterFunc(1200*time.Millisecond, func() {
		fyne.Do(func() { v.copyBtn.SetIcon(theme.ContentCopyIcon()) })
	})
}

func (v *viewer) navigate(delta int) {
	if v.lib == nil || v.list == nil {
		return
	}
	i := v.cur + delta
	if i < 0 || i >= v.lib.Len() {
		return
	}
	v.list.Select(i) // OnSelected 経由で show される
}

func (v *viewer) show(i int) {
	lib := v.lib
	if lib == nil || i < 0 || i >= lib.Len() {
		return
	}
	v.cur = i
	label := fmt.Sprintf("%d / %d   %s", i+1, lib.Len(), lib.Name(i))
	v.setStatus(label)
	v.copyBtn.Enable()

	job := lib.Image(i)
	apply := func() {
		if job.err != nil {
			v.view.SetImage(nil)
			v.setStatus(label + "   (表示できません: " + job.err.Error() + ")")
			return
		}
		v.view.SetImage(job.img)
	}

	select {
	case <-job.done: // 先読み済みなら即表示
		apply()
	default:
		v.view.SetImage(nil)
		go func() {
			<-job.done
			fyne.Do(func() {
				if v.lib == lib && v.cur == i {
					apply()
				}
			})
		}()
	}
}

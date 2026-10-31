package main

import (
	"errors"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"
)

func writePNG(t *testing.T, path string, w, h int) {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	img.Set(0, 0, color.White)
	f, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	if err := png.Encode(f, img); err != nil {
		t.Fatal(err)
	}
}

func TestScanFolderTooLarge(t *testing.T) {
	dir := t.TempDir()
	f, err := os.Create(filepath.Join(dir, "big.jpg"))
	if err != nil {
		t.Fatal(err)
	}
	// スパースファイルでディスクを消費せずに 8GiB+1 を作る
	if err := f.Truncate(maxTotalBytes + 1); err != nil {
		t.Fatal(err)
	}
	f.Close()

	if _, err := scanFolder(dir); !errors.Is(err, ErrTooLarge) {
		t.Fatalf("want ErrTooLarge, got %v", err)
	}
}

func TestLoadDecodeClose(t *testing.T) {
	dir := t.TempDir()
	writePNG(t, filepath.Join(dir, "b.png"), 400, 200)
	writePNG(t, filepath.Join(dir, "a.png"), 10, 10)
	os.WriteFile(filepath.Join(dir, "note.txt"), []byte("x"), 0o644)

	files, err := scanFolder(dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) != 2 || files[0].name != "a.png" {
		t.Fatalf("unexpected files: %+v", files)
	}

	lib, err := LoadLibrary(dir, files, nil)
	if err != nil {
		t.Fatal(err)
	}
	done := make(chan int, 2)
	lib.StartThumbnails(func(i int) { done <- i })
	<-done
	<-done
	if b := lib.Thumb(1).Bounds(); b.Dx() != thumbSize || b.Dy() != thumbSize/2 {
		t.Fatalf("thumb size %v", b)
	}

	job := lib.Image(1)
	<-job.done
	if job.err != nil || job.img.Bounds().Dx() != 400 {
		t.Fatalf("decode: %v", job.err)
	}

	lib.Close()
	if lib.data != nil || lib.thumbs != nil || lib.jobs != nil || lib.Thumb(0) != nil {
		t.Fatal("memory not released")
	}
}

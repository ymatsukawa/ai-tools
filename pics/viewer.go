package main

import (
	"image"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

// tapImage はクリック可能な画像表示ウィジェット (アスペクト比を保って全体表示)。
// 左クリックで onTap、右クリックで onSecondaryTap を呼ぶ。
type tapImage struct {
	widget.BaseWidget
	img            *canvas.Image
	onTap          func()
	onSecondaryTap func()
}

func newTapImage(onTap, onSecondaryTap func()) *tapImage {
	t := &tapImage{
		img:            &canvas.Image{FillMode: canvas.ImageFillContain, ScaleMode: canvas.ImageScaleSmooth},
		onTap:          onTap,
		onSecondaryTap: onSecondaryTap,
	}
	t.ExtendBaseWidget(t)
	return t
}

func (t *tapImage) CreateRenderer() fyne.WidgetRenderer {
	return widget.NewSimpleRenderer(t.img)
}

func (t *tapImage) Tapped(*fyne.PointEvent) {
	if t.onTap != nil {
		t.onTap()
	}
}

func (t *tapImage) TappedSecondary(*fyne.PointEvent) {
	if t.onSecondaryTap != nil {
		t.onSecondaryTap()
	}
}

func (t *tapImage) SetImage(im image.Image) {
	t.img.Image = im
	t.img.Refresh()
}

// nameRowLayout は [label, button] を左詰めで並べ、button を文字列のすぐ右に置く。
// 文字列が長く収まらない場合は label を縮め、省略表示 (…) させる。
// label の文字列を変えたら、このレイアウトを持つコンテナーを Refresh すること。
type nameRowLayout struct {
	label *widget.Label
}

func (l nameRowLayout) Layout(objs []fyne.CanvasObject, size fyne.Size) {
	btn := objs[1]
	bmin := btn.MinSize()

	textW := fyne.MeasureText(l.label.Text, theme.TextSize(), l.label.TextStyle).Width + 2*theme.InnerPadding()
	lw := max(0, min(textW, size.Width-bmin.Width))

	l.label.Move(fyne.NewPos(0, 0))
	l.label.Resize(fyne.NewSize(lw, size.Height))
	btn.Move(fyne.NewPos(lw, (size.Height-bmin.Height)/2))
	btn.Resize(bmin)
}

func (l nameRowLayout) MinSize(objs []fyne.CanvasObject) fyne.Size {
	lm, bm := objs[0].MinSize(), objs[1].MinSize()
	return fyne.NewSize(lm.Width+bm.Width, max(lm.Height, bm.Height))
}

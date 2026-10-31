//go:build !darwin

package main

import "fyne.io/fyne/v2"

// fitToScreen は macOS 以外では何もしない。
func fitToScreen(fyne.Window) {}

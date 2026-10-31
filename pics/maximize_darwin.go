//go:build darwin

package main

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa
#import <Cocoa/Cocoa.h>

// ウィンドウが載っている画面の可視領域 (メニューバー・Dock を除く) を取得し、
// タイトルバー込みのフレームをそこまで広げる。
static void fitWindowToScreen(uintptr_t handle) {
	NSWindow *win = (NSWindow *)handle;
	NSScreen *screen = [win screen] ?: [NSScreen mainScreen];
	if (screen == nil) return;
	[win setFrame:[screen visibleFrame] display:YES];
}
*/
import "C"

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/driver"
)

// fitToScreen はウィンドウを画面の可視領域いっぱいに広げる (擬似最大化)。
// メインスレッドから呼ぶこと。
func fitToScreen(w fyne.Window) {
	nw, ok := w.(driver.NativeWindow)
	if !ok {
		return
	}
	nw.RunNative(func(ctx any) {
		if mac, ok := ctx.(driver.MacWindowContext); ok && mac.NSWindow != 0 {
			C.fitWindowToScreen(C.uintptr_t(mac.NSWindow))
		}
	})
}

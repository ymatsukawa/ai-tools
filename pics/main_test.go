package main

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func TestStartDir(t *testing.T) {
	base := t.TempDir()
	sub := filepath.Join(base, "sub")
	if err := os.Mkdir(sub, 0o755); err != nil {
		t.Fatal(err)
	}
	file := filepath.Join(base, "a.png")
	if err := os.WriteFile(file, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	t.Chdir(base)

	tests := []struct {
		name    string
		args    []string
		want    string
		wantErr error
	}{
		{"指定なし", []string{"pics"}, "", nil},
		{"絶対パス", []string{"pics", sub}, sub, nil},
		{"相対パス", []string{"pics", "sub"}, sub, nil},
		{"相対パス ./", []string{"pics", "./sub/"}, sub, nil},
		{"存在しない", []string{"pics", "nope"}, "", errDirNotFound},
		{"ファイル", []string{"pics", file}, "", errDirNotFound},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := startDir(tt.args)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v, want %v", err, tt.wantErr)
			}
			// macOS の TempDir は /var → /private/var のシンボリックリンクなので実体で比較
			if tt.want != "" {
				g, _ := filepath.EvalSymlinks(got)
				w, _ := filepath.EvalSymlinks(tt.want)
				if g != w {
					t.Fatalf("got %q, want %q", got, tt.want)
				}
			} else if got != "" {
				t.Fatalf("got %q, want empty", got)
			}
		})
	}
}

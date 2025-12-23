package finder

import (
	"fmt"
	"path/filepath"
)

func FindDirs(absPath string) ([]Entry, error) {
	current, err := statEntry(absPath, ".")
	if err != nil {
		return nil, fmt.Errorf("read current dir: %w", err)
	}

	parent, err := statEntry(filepath.Dir(absPath), "..")
	if err != nil {
		return nil, fmt.Errorf("read parent dir: %w", err)
	}

	return []Entry{current, parent}, nil
}

package finder

import (
	"fmt"
	"os"
	"path/filepath"
)

func FindFiles(absPath string) ([]Entry, error) {
	dirEntries, err := os.ReadDir(absPath)
	if err != nil {
		return nil, fmt.Errorf("read dir %s: %w", absPath, err)
	}

	entries := make([]Entry, 0, len(dirEntries))
	for _, de := range dirEntries {
		entry, err := statEntry(filepath.Join(absPath, de.Name()), de.Name())
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	sortEntries(entries)
	return entries, nil
}

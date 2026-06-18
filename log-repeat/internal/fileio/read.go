package fileio

import (
	"fmt"
	"os"
)

func ReadFile(path string) ([]byte, error) {
	if err := IsFile(path); err != nil {
		return nil, err
	}
	return os.ReadFile(path)
}

func IsFile(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return fmt.Errorf("%s: does not exist", path)
	}
	return nil
}

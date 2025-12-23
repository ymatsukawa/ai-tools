package finder

import (
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"strconv"
	"syscall"
)

type Entry struct {
	Name    string
	Owner   string
	Group   string
	Mode    string
	Updated string
	IsDir   bool
}

func Find(path string) ([]Entry, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, fmt.Errorf("resolve path %s: %w", path, err)
	}

	dirs, err := FindDirs(absPath)
	if err != nil {
		return nil, err
	}

	files, err := FindFiles(absPath)
	if err != nil {
		return nil, err
	}

	return append(dirs, files...), nil
}

func statEntry(path, name string) (Entry, error) {
	info, err := os.Stat(path)
	if err != nil {
		return Entry{}, fmt.Errorf("stat %s: %w", path, err)
	}

	stat := info.Sys().(*syscall.Stat_t)

	return Entry{
		Name:    name,
		Owner:   lookupUser(stat.Uid),
		Group:   lookupGroup(stat.Gid),
		Mode:    info.Mode().String(),
		Updated: info.ModTime().Format("2006-01-02 15:04"),
		IsDir:   info.IsDir(),
	}, nil
}

func lookupUser(uid uint32) string {
	u, err := user.LookupId(strconv.Itoa(int(uid)))
	if err != nil {
		return strconv.Itoa(int(uid))
	}
	return u.Username
}

func lookupGroup(gid uint32) string {
	g, err := user.LookupGroupId(strconv.Itoa(int(gid)))
	if err != nil {
		return strconv.Itoa(int(gid))
	}
	return g.Name
}

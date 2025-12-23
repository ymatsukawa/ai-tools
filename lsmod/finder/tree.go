package finder

import (
	"fmt"
	"os"
	"path/filepath"
)

type TreeNode struct {
	Name     string
	IsDir    bool
	Children []TreeNode
}

func Tree(path string) (TreeNode, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return TreeNode{}, fmt.Errorf("resolve path %s: %w", path, err)
	}

	info, err := os.Stat(absPath)
	if err != nil {
		return TreeNode{}, fmt.Errorf("stat %s: %w", absPath, err)
	}

	return buildTree(absPath, info.Name(), info.IsDir())
}

func buildTree(path, name string, isDir bool) (TreeNode, error) {
	node := TreeNode{Name: name, IsDir: isDir}
	if !isDir {
		return node, nil
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		return TreeNode{}, fmt.Errorf("read dir %s: %w", path, err)
	}

	sortDirEntries(entries)
	children, err := buildChildren(path, entries)
	if err != nil {
		return TreeNode{}, err
	}

	node.Children = children
	return node, nil
}

func buildChildren(path string, entries []os.DirEntry) ([]TreeNode, error) {
	children := make([]TreeNode, 0, len(entries))
	for _, e := range entries {
		child, err := buildTree(filepath.Join(path, e.Name()), e.Name(), e.IsDir())
		if err != nil {
			return nil, err
		}
		children = append(children, child)
	}
	return children, nil
}

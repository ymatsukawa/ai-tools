package formatter

import (
	"fmt"
	"io"

	"github.com/ymatsukawa/lsmod/finder"
)

const (
	branchMid  = "├── "
	branchLast = "└── "
	branchPipe = "│   "
	branchNone = "    "
)

func PrintTree(w io.Writer, node finder.TreeNode) error {
	if _, err := fmt.Fprintln(w, Colorize(node.Name, node.IsDir)); err != nil {
		return fmt.Errorf("write root: %w", err)
	}
	return printChildren(w, node.Children, "")
}

func printChildren(w io.Writer, nodes []finder.TreeNode, prefix string) error {
	for i, node := range nodes {
		if err := printNode(w, node, prefix, i == len(nodes)-1); err != nil {
			return err
		}
	}
	return nil
}

func printNode(w io.Writer, node finder.TreeNode, prefix string, last bool) error {
	branch, next := branchMid, prefix+branchPipe
	if last {
		branch, next = branchLast, prefix+branchNone
	}

	name := Colorize(node.Name, node.IsDir)
	if _, err := fmt.Fprintf(w, "%s%s%s\n", prefix, branch, name); err != nil {
		return fmt.Errorf("write node %s: %w", node.Name, err)
	}

	return printChildren(w, node.Children, next)
}

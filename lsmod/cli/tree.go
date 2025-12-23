package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/ymatsukawa/lsmod/finder"
	"github.com/ymatsukawa/lsmod/formatter"
)

var treeCommand = &cobra.Command{
	Use:   "tree [path]",
	Short: "display directory tree",
	Long:  "display directory structure in tree format",
	Args:  cobra.MaximumNArgs(1),
	RunE:  runTree,
}

func runTree(cmd *cobra.Command, args []string) error {
	path := pathArg(args)

	node, err := finder.Tree(path)
	if err != nil {
		return fmt.Errorf("tree %s: %w", path, err)
	}

	return formatter.PrintTree(os.Stdout, node)
}

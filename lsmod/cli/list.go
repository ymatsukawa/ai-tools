package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/ymatsukawa/lsmod/finder"
	"github.com/ymatsukawa/lsmod/formatter"
)

var listCommand = &cobra.Command{
	Use:   "l [path]",
	Short: "list up",
	Long:  "list up files and directories like ls -al",
	Args:  cobra.MaximumNArgs(1),
	RunE:  runList,
}

func runList(cmd *cobra.Command, args []string) error {
	path := pathArg(args)

	entries, err := finder.Find(path)
	if err != nil {
		return fmt.Errorf("find %s: %w", path, err)
	}

	return formatter.Print(os.Stdout, entries)
}

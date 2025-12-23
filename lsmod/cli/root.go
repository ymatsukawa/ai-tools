package cli

import (
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "lsmod [path]",
	Short: "ls modified",
	Long:  `ls modified.`,
	Args:  cobra.MaximumNArgs(1),
	RunE:  runList,
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.AddCommand(listCommand)
	rootCmd.AddCommand(treeCommand)
}

package cmd

import (
	"github.com/spf13/cobra"
	"github.com/ymatsukawa/log-repeat/internal/screen"
	"github.com/ymatsukawa/log-repeat/internal/search"
)

var filterCmd = &cobra.Command{
	Use:   "f",
	Short: "filter by specific words",
	Long:  "filter by specific words ( ::: matches any value )",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		lines, err := readTargetLines()
		if err != nil {
			return err
		}
		groups, err := search.Filter(lines, args[0], caseInsensitive)
		if err != nil {
			return err
		}
		screen.PrintGroups(groups)
		return nil
	},
}

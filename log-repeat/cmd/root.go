package cmd

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ymatsukawa/log-repeat/internal/fileio"
	"github.com/ymatsukawa/log-repeat/internal/screen"
	"github.com/ymatsukawa/log-repeat/internal/search"
)

var (
	targetPath      string
	caseInsensitive bool
)

var rootCmd = &cobra.Command{
	Use:   "lr",
	Short: "log repeat detection tool",
	Long: `log repeat detection tool

Examples:
  lr -t log.txt
  lr -t log.txt f "SELECT * FROM examples WHERE id = 1"
  lr -t log.txt f -i "SELECT * FROM examples WHERE id = 1" # case insensitive
  lr -t log.txt f "SELECT * FROM examples WHERE id = :::"
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		lines, err := readTargetLines()
		if err != nil {
			return err
		}
		screen.PrintGroups(search.Sequential(lines))
		return nil
	},
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.AddCommand(filterCmd)
	rootCmd.PersistentFlags().StringVarP(&targetPath, "target", "t", "", "target file path")
	filterCmd.Flags().BoolVarP(&caseInsensitive, "ins", "i", false, "case insensitive on filter")
}

func readTargetLines() ([]string, error) {
	if targetPath == "" {
		return nil, fmt.Errorf("target file is required: use -t <file>")
	}

	data, err := fileio.ReadFile(targetPath)
	if err != nil {
		return nil, err
	}

	content := strings.TrimRight(string(data), "\n")
	if content == "" {
		return nil, nil
	}
	return strings.Split(content, "\n"), nil
}

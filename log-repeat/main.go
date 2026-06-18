package main

import (
	"os"

	"github.com/ymatsukawa/log-repeat/cmd"
)

func main() {
	// cobra already prints the error to stderr; just set a non-zero exit code.
	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
}

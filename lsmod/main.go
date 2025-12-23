package main

import (
	"os"

	"github.com/ymatsukawa/lsmod/cli"
)

func main() {
	if err := cli.Execute(); err != nil {
		os.Exit(1)
	}
}

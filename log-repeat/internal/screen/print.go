package screen

import "fmt"

func PrintGroups(groups [][]string) {
	for i, group := range groups {
		if i > 0 {
			fmt.Println()
		}
		fmt.Printf("=== Group-%d ===\n", i+1)
		for _, line := range group {
			fmt.Println(line)
		}
	}
}

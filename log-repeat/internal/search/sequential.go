package search

import "regexp"

const minGroupSize = 2

func Sequential(lines []string) [][]string {
	return groupRuns(lines, nil)
}

func groupRuns(lines []string, match func(string) bool) [][]string {
	var groups [][]string
	var current []string
	var prevKey string

	flush := func() {
		if len(current) >= minGroupSize {
			groups = append(groups, current)
		}
		current = nil
	}

	for _, line := range lines {
		if match != nil && !match(line) {
			flush()
			prevKey = ""
			continue
		}

		key := normalize(line)
		if len(current) > 0 && key == prevKey {
			current = append(current, line)
			continue
		}

		flush()
		current = []string{line}
		prevKey = key
	}
	flush()

	return groups
}

var (
	uuidPattern   = regexp.MustCompile(`[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`)
	emailPattern  = regexp.MustCompile(`[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`)
	numberPattern = regexp.MustCompile(`[0-9]+`)
)

func normalize(line string) string {
	line = uuidPattern.ReplaceAllString(line, "<uuid>")
	line = emailPattern.ReplaceAllString(line, "<email>")
	line = numberPattern.ReplaceAllString(line, "#")
	return line
}

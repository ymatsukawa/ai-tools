package search

import (
	"regexp"
	"strings"
)

const (
	wildcard = ":::"
	anyValue = ".+?"
)

func Filter(lines []string, pattern string, caseInsensitive bool) ([][]string, error) {
	re, err := buildFilterRegexp(pattern, caseInsensitive)
	if err != nil {
		return nil, err
	}

	return groupRuns(lines, re.MatchString), nil
}

func buildFilterRegexp(pattern string, caseInsensitive bool) (*regexp.Regexp, error) {
	parts := strings.Split(pattern, wildcard)
	for i, p := range parts {
		parts[i] = regexp.QuoteMeta(p)
	}
	expr := strings.Join(parts, anyValue)
	if caseInsensitive {
		expr = "(?i)" + expr
	}

	return regexp.Compile(expr)
}

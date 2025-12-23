package formatter

const (
	colorReset  = "\033[0m"
	colorYellow = "\033[33m"
)

func Colorize(text string, isDir bool) string {
	if isDir {
		return colorYellow + text + colorReset
	}
	return text
}

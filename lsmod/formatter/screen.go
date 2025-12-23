package formatter

import (
	"fmt"
	"io"

	"github.com/ymatsukawa/lsmod/finder"
)

func Print(w io.Writer, entries []finder.Entry) error {
	for _, e := range entries {
		name := Colorize(e.Name, e.IsDir)
		_, err := fmt.Fprintf(w, "%s %s:%s [%s] %s\n",
			e.Mode, e.Owner, e.Group, e.Updated, name)
		if err != nil {
			return fmt.Errorf("write entry %s: %w", e.Name, err)
		}
	}
	return nil
}

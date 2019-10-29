package domain

import (
	"testing"
	"time"
)

func TestETag(t *testing.T) {
	var testcases = []struct {
		sample   string
		expected string
	}{
		{`2003-01-19T11:45:00Z`, `"a9pcvqbi80"`},
		{`2019-10-23T06:55:05Z`, `"fh5t8wxgzk"`},
	}
	for _, tt := range testcases {
		updated, _ := time.Parse(time.RFC3339, tt.sample)
		var c Collection
		c.Updated = updated
		if c.ETag() != tt.expected {
			t.Errorf("Collection.ETag() got: %s, expected: %s",
				c.ETag(), tt.expected)
		}

		var d JobDefinition
		d.Updated = updated
		if d.ETag() != tt.expected {
			t.Errorf("JobDefinition.ETag() got: %s, expected: %s",
				d.ETag(), tt.expected)
		}

		var s JobStatus
		s.Updated = updated
		if s.ETag() != tt.expected {
			t.Errorf("JobStatus.ETag() got: %s, expected: %s",
				s.ETag(), tt.expected)
		}
	}
}

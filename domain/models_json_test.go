package domain

import (
	"testing"
	"time"
)

func TestDurationMarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   string
		expected string
	}{
		{`10s`, `"10s"`},
		{`1h45m3s`, `"1h45m3s"`},
	}
	for _, tt := range testcases {
		sample, _ := time.ParseDuration(tt.sample)
		d := Duration(sample)
		b, _ := d.MarshalJSON()
		s := string(b)
		if s != tt.expected {
			t.Errorf("Duration.MarshalJSON() got: %s, expected: %s",
				s, tt.expected)
		}
	}
}

func TestDurationUnmarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   string
		expected time.Duration
		err      string
	}{
		{`10`, 0, "invalid duration"},
		{`10s`, 0, "invalid character 's' after top-level value"},
		{`"X"`, 0, "time: invalid duration X"},
		{`"10s"`, 10 * time.Second, ""},
		{`"1h45m3s"`, 6303 * time.Second, ""},
	}
	for _, tt := range testcases {
		var d Duration
		err := d.UnmarshalJSON([]byte(tt.sample))
		if (err != nil && err.Error() != tt.err) || (err == nil && tt.err != "") {
			t.Errorf("Duration.UnmarshalJSON() got err: %s, expected: %s",
				err, tt.err)
		}
		expected := Duration(tt.expected)
		if d != expected {
			t.Errorf("Duration.UnmarshalJSON() got: %v, expected: %v", d, expected)
		}
	}
}

func TestCollectionStateMarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   CollectionState
		expected string
	}{
		{CollectionStateEnabled, `"enabled"`},
		{CollectionStateDisabled, `"disabled"`},
	}
	for _, tt := range testcases {
		b, _ := tt.sample.MarshalJSON()
		s := string(b)
		if s != tt.expected {
			t.Errorf("CollectionState.MarshalJSON() got: %s, expected: %s",
				s, tt.expected)
		}
	}
}

func TestCollectionStateUnmarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   string
		expected CollectionState
		err      string
	}{
		{`10`, CollectionState(0), "json: cannot unmarshal number into Go value of type string"},
		{`10s`, CollectionState(0), "invalid character 's' after top-level value"},
		{`"X"`, CollectionState(0), "state must be either 'enabled' or 'disabled'"},
		{`"enabled"`, CollectionStateEnabled, ""},
		{`"disabled"`, CollectionStateDisabled, ""},
	}
	for _, tt := range testcases {
		var s CollectionState
		err := s.UnmarshalJSON([]byte(tt.sample))
		if (err != nil && err.Error() != tt.err) || (err == nil && tt.err != "") {
			t.Errorf("CollectionState.UnmarshalJSON() got err: %s, expected: %s",
				err, tt.err)
		}
		if s != tt.expected {
			t.Errorf("CollectionState.UnmarshalJSON() got: %v, expected: %v", s, tt.expected)
		}
	}
}

func TestJobStateMarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   JobState
		expected string
	}{
		{JobStateEnabled, `"enabled"`},
		{JobStateDisabled, `"disabled"`},
	}
	for _, tt := range testcases {
		b, _ := tt.sample.MarshalJSON()
		s := string(b)
		if s != tt.expected {
			t.Errorf("JobState.MarshalJSON() got: %s, expected: %s", s, tt.expected)
		}
	}
}

func TestJobStateUnmarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   string
		expected JobState
		err      string
	}{
		{`10`, JobState(0), "json: cannot unmarshal number into Go value of type string"},
		{`10s`, JobState(0), "invalid character 's' after top-level value"},
		{`"X"`, JobState(0), "state must be either 'enabled' or 'disabled'"},
		{`"enabled"`, JobStateEnabled, ""},
		{`"disabled"`, JobStateDisabled, ""},
	}
	for _, tt := range testcases {
		var s JobState
		err := s.UnmarshalJSON([]byte(tt.sample))
		if (err != nil && err.Error() != tt.err) || (err == nil && tt.err != "") {
			t.Errorf("JobState.UnmarshalJSON() got err: %s, expected: %s",
				err, tt.err)
		}
		if s != tt.expected {
			t.Errorf("JobState.UnmarshalJSON() got: %v, expected: %v", s, tt.expected)
		}
	}
}

func TestJobHistoryStatusString(t *testing.T) {
	var testcases = []struct {
		sample   JobHistoryStatus
		expected string
	}{
		{JobHistoryStatusCompleted, `completed`},
		{JobHistoryStatusFailed, `failed`},
	}
	for _, tt := range testcases {
		s := tt.sample.String()
		if s != tt.expected {
			t.Errorf("JobHistoryStatus.String() got: %s, expected: %s", s, tt.expected)
		}
	}
}

func TestJobHistoryStatusMarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   JobHistoryStatus
		expected string
	}{
		{JobHistoryStatusCompleted, `"completed"`},
		{JobHistoryStatusFailed, `"failed"`},
	}
	for _, tt := range testcases {
		b, _ := tt.sample.MarshalJSON()
		s := string(b)
		if s != tt.expected {
			t.Errorf("JobHistoryStatus.MarshalJSON() got: %s, expected: %s", s, tt.expected)
		}
	}
}

func TestJobHistoryStatusUnmarshalJSON(t *testing.T) {
	var testcases = []struct {
		sample   string
		expected JobHistoryStatus
		err      string
	}{
		{`10`, JobHistoryStatus(0), "json: cannot unmarshal number into Go value of type string"},
		{`10s`, JobHistoryStatus(0), "invalid character 's' after top-level value"},
		{`"X"`, JobHistoryStatus(0), "status must be either 'completed' or 'failed'"},
		{`"completed"`, JobHistoryStatusCompleted, ""},
		{`"failed"`, JobHistoryStatusFailed, ""},
	}
	for _, tt := range testcases {
		var s JobHistoryStatus
		err := s.UnmarshalJSON([]byte(tt.sample))
		if (err != nil && err.Error() != tt.err) || (err == nil && tt.err != "") {
			t.Errorf("JobHistoryStatus.UnmarshalJSON() got err: %s, expected: %s",
				err, tt.err)
		}
		if s != tt.expected {
			t.Errorf("JobHistoryStatus.UnmarshalJSON() got: %v, expected: %v", s, tt.expected)
		}
	}
}

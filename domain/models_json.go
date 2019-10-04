package domain

import (
	"bytes"
	"encoding/json"
	"errors"
	"time"
)

const (
	CollectionStateEnabled CollectionState = iota + 1
	CollectionStateDisabled
)

const (
	JobStateEnabled JobState = iota + 1
	JobStateDisabled
)

const (
	JobHistoryStatusCompleted JobHistoryStatus = iota + 1
	JobHistoryStatusFailed
)

var (
	errInvalidState  = errors.New("state must be either 'enabled' or 'disabled'")
	errInvalidStatus = errors.New("status must be either 'completed' or 'failed'")

	collectionStateToString = map[CollectionState]string{
		CollectionStateEnabled:  "enabled",
		CollectionStateDisabled: "disabled",
	}

	collectionStateToID = map[string]CollectionState{
		"enabled":  CollectionStateEnabled,
		"disabled": CollectionStateDisabled,
	}

	jobStateToString = map[JobState]string{
		JobStateEnabled:  "enabled",
		JobStateDisabled: "disabled",
	}

	jobStateToID = map[string]JobState{
		"enabled":  JobStateEnabled,
		"disabled": JobStateDisabled,
	}

	jobHistoryStatusToString = map[JobHistoryStatus]string{
		JobHistoryStatusCompleted: "completed",
		JobHistoryStatusFailed:    "failed",
	}

	jobHistoryStatusToID = map[string]JobHistoryStatus{
		"completed": JobHistoryStatusCompleted,
		"failed":    JobHistoryStatusFailed,
	}
)

// MarshalJSON marshals the duration as a json string
func (d Duration) MarshalJSON() ([]byte, error) {
	return json.Marshal(time.Duration(d).String())
}

// UnmarshalJSON unmashals a json string to the duration value
func (d *Duration) UnmarshalJSON(b []byte) error {
	var v interface{}
	if err := json.Unmarshal(b, &v); err != nil {
		return err
	}
	switch value := v.(type) {
	case string:
		tmp, err := time.ParseDuration(value)
		if err != nil {
			return err
		}
		*d = Duration(tmp)
		return nil
	default:
		return errors.New("invalid duration")
	}
}

// MarshalJSON marshals the enum as a quoted json string
func (s CollectionState) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(collectionStateToString[s])
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

// UnmarshalJSON unmashals a quoted json string to the enum value
func (s *CollectionState) UnmarshalJSON(b []byte) error {
	var str string
	err := json.Unmarshal(b, &str)
	if err != nil {
		return err
	}
	id, ok := collectionStateToID[str]
	if !ok {
		return errInvalidState
	}
	*s = id
	return nil
}

// MarshalJSON marshals the enum as a quoted json string
func (s JobState) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(jobStateToString[s])
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

// UnmarshalJSON unmashals a quoted json string to the enum value
func (s *JobState) UnmarshalJSON(b []byte) error {
	var str string
	err := json.Unmarshal(b, &str)
	if err != nil {
		return err
	}
	id, ok := jobStateToID[str]
	if !ok {
		return errInvalidState
	}
	*s = id
	return nil
}

// Strings returns a human readable representation of status
func (s JobHistoryStatus) String() string {
	return jobHistoryStatusToString[s]
}

// MarshalJSON marshals the enum as a quoted json string
func (s JobHistoryStatus) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(jobHistoryStatusToString[s])
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

// UnmarshalJSON unmashals a quoted json string to the enum value
func (s *JobHistoryStatus) UnmarshalJSON(b []byte) error {
	var str string
	err := json.Unmarshal(b, &str)
	if err != nil {
		return err
	}
	id, ok := jobHistoryStatusToID[str]
	if !ok {
		return errInvalidStatus
	}
	*s = id
	return nil
}

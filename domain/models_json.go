package domain

import (
	"bytes"
	"encoding/json"
	"errors"
)

const (
	CollectionStateEnabled CollectionState = iota + 1
	CollectionStateDisabled
)

var (
	errInvalidState = errors.New("state must be either 'enabled' or 'disabled'")

	collectionStateToString = map[CollectionState]string{
		CollectionStateEnabled:  "enabled",
		CollectionStateDisabled: "disabled",
	}

	collectionStateToID = map[string]CollectionState{
		"enabled":  CollectionStateEnabled,
		"disabled": CollectionStateDisabled,
	}
)

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

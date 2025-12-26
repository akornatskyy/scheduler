package domain

import (
	"encoding/json"
	"reflect"
	"testing"
	"time"

	"github.com/akornatskyy/goext/errorstate"
	"github.com/akornatskyy/goext/iojson"
)

func TestParseBefore(t *testing.T) {
	expected := time.Now().Truncate(time.Second)
	sample := expected.Format(time.RFC3339)

	actual, _ := ParseBefore(sample)

	if actual.Format(time.RFC3339) != sample {
		t.Errorf("ParseBefore() got: %s, expected: %s", actual, expected)
	}
}

func TestParseBeforeFails(t *testing.T) {
	var testcases = []string{
		`x`, `123`,
	}
	for _, tt := range testcases {
		_, err := ParseBefore(tt)
		if err == nil {
			t.FailNow()
		}
	}
}

func TestValidateID(t *testing.T) {
	var testcases = []string{
		"", "Xx-", "X-X", "z_-", NewID(),
	}
	for _, tt := range testcases {
		err := ValidateID(tt)
		if err != nil {
			t.Fatalf("%s: %s", tt, err)
		}
	}
}

func TestValidateIDFails(t *testing.T) {
	var testcases = []string{
		"1234567890123456789012345678901234567", "12~22", "X",
		"<>+", "Я", "_A", "-x",
	}
	for _, tt := range testcases {
		err := ValidateID(tt)
		if err == nil {
			t.Fatalf("%s", tt)
		}
	}
}

func TestValidateCollection(t *testing.T) {
	var testcases = []string{
		`ok`, `invalid`,
	}
	for _, tt := range testcases {
		t.Run(tt, func(t *testing.T) {
			var in struct {
				C   *Collection            `json:"collection"`
				Err *errorstate.ErrorState `json:"err,omitempty"`
			}
			iojson.ReadFile("testdata/validation/collection/"+tt+".json", &in)

			err := ValidateCollection(in.C)
			if !sameError(err, in.Err) {
				t.FailNow()
			}
		})
	}
}

func TestValidateJobDefinition(t *testing.T) {
	var testcases = []string{
		`ok`, `invalid`, `request-null`, // `invalid-uri`, `uri-not-http`,
	}
	for _, tt := range testcases {
		t.Run(tt, func(t *testing.T) {
			var in struct {
				J   *JobDefinition         `json:"job"`
				Err *errorstate.ErrorState `json:"err,omitempty"`
			}
			iojson.ReadFile("testdata/validation/job/"+tt+".json", &in)

			err := ValidateJobDefinition(in.J)
			if !sameError(err, in.Err) {
				b, _ := json.Marshal(err)
				t.Errorf("ValidateJobDefinition() got err: %s", string(b))
			}
		})
	}
}

func sameError(actual error, expected *errorstate.ErrorState) bool {
	if actual == nil {
		return expected == nil
	}
	details := actual.(*errorstate.ErrorState).Errors
	return reflect.DeepEqual(details, expected.Errors)
}

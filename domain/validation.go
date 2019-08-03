package domain

import (
	"time"

	"github.com/akornatskyy/goext/errorstate"
	"github.com/akornatskyy/scheduler/shared/rule"
)

const (
	domain = "scheduler"
)

var ErrUnableCancelJob = errorstate.Single(&errorstate.Detail{
	Domain:   domain,
	Type:     "field",
	Location: "running",
	Reason:   "not implemented",
	Message:  "Unable to cancel the running job.",
})

func ParseBefore(s string) (time.Time, error) {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return t, errorstate.Single(&errorstate.Detail{
			Domain:   domain,
			Type:     "field",
			Location: "before",
			Reason:   "format",
			Message:  err.Error(),
		})
	}
	return t, nil
}

func ValidateId(s string) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}
	rule.Id.Validate(e, s)
	return e.OrNil()
}

func ValidateCollection(c *Collection) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}

	rule.Id.Validate(e, c.ID)
	rule.Name.Validate(e, c.Name)

	return e.OrNil()
}

func ValidateJobDefinition(c *JobDefinition) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}

	rule.Id.Validate(e, c.ID)
	rule.Name.Validate(e, c.Name)

	return e.OrNil()
}

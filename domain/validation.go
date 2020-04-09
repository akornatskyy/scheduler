package domain

import (
	"fmt"
	"net/url"
	"time"

	"github.com/akornatskyy/goext/errorstate"
	"github.com/akornatskyy/scheduler/shared/rule"
	"github.com/robfig/cron/v3"
)

const (
	domain            = "scheduler"
	msgRequiredObject = "Required object cannot be null."
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

func ValidateID(s string) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}
	rule.ID.Validate(e, s)
	return e.OrNil()
}

func ValidateURI(uri string) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}
	u, err := url.ParseRequestURI(uri)
	if err != nil {
		e.Add(&errorstate.Detail{
			Domain:   domain,
			Type:     "field",
			Location: "uri",
			Reason:   "pattern",
			Message:  fmt.Sprintf("Unrecognized format: %s.", err.Error()),
		})
	} else if u.Scheme != "http" && u.Scheme != "https" {
		e.Add(&errorstate.Detail{
			Domain:   domain,
			Type:     "field",
			Location: "uri",
			Reason:   "pattern",
			Message:  "Must begin with http or https.",
		})
	}
	return e.OrNil()
}

func ValidateCollection(c *Collection) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}

	rule.ID.Validate(e, c.ID)
	rule.Name.Validate(e, c.Name)

	return e.OrNil()
}

func ValidateVariable(v *Variable) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}

	rule.ID.Validate(e, v.ID)
	rule.Name.Validate(e, v.Name)
	rule.CollectionID.Validate(e, v.CollectionID)
	rule.VariableValue.Validate(e, v.Value)

	return e.OrNil()
}

var allowedFields = map[string]bool{
	"status": true,
}

func ValidateJobListFields(fields []string) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}
	for _, field := range fields {
		if !allowedFields[field] {
			e.Add(&errorstate.Detail{
				Domain:   domain,
				Type:     "field",
				Location: "fields",
				Reason:   "unknown",
				Message:  fmt.Sprintf("Unrecognized field: %s.", field),
			})
			break
		}
	}
	return e.OrNil()
}

func ValidateJobDefinition(j *JobDefinition) error {
	e := &errorstate.ErrorState{
		Domain: domain,
	}

	rule.ID.Validate(e, j.ID)
	rule.Name.Validate(e, j.Name)
	rule.CollectionID.Validate(e, j.CollectionID)
	if rule.Schedule.Validate(e, j.Schedule) {
		_, err := cron.ParseStandard(j.Schedule)
		if err != nil {
			e.Add(&errorstate.Detail{
				Domain:   domain,
				Type:     "field",
				Location: "schedule",
				Reason:   "pattern",
				Message:  fmt.Sprintf("Unrecognized format: %s.", err.Error()),
			})
		}
	}

	validateAction(e, j.Action)

	return e.OrNil()
}

func validateAction(e *errorstate.ErrorState, a *Action) {
	if a == nil {
		addRequiredObjectError(e, "action")
		return
	}

	rule.ActionType.Validate(e, a.Type)

	validateHTTPRequest(e, a.Request)
	validateRetryPolicy(e, a.RetryPolicy)
}

func validateHTTPRequest(e *errorstate.ErrorState, r *HttpRequest) {
	if r == nil {
		addRequiredObjectError(e, "request")
		return
	}

	rule.Method.Validate(e, r.Method)
	rule.URI.Validate(e, r.URI)
	rule.Body.Validate(e, r.Body)
	for _, p := range r.Headers {
		rule.HeaderName.Validate(e, p.Name)
		rule.HeaderValue.Validate(e, p.Value)
	}
}

func validateRetryPolicy(e *errorstate.ErrorState, r *RetryPolicy) {
	if r == nil {
		return
	}
	rule.RetryCount.Validate(e, r.RetryCount)
}

func addRequiredObjectError(e *errorstate.ErrorState, location string) {
	e.Add(&errorstate.Detail{
		Domain:   domain,
		Type:     "field",
		Location: location,
		Reason:   "required",
		Message:  msgRequiredObject,
	})
}

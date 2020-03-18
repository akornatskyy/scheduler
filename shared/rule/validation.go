package rule

import (
	"github.com/akornatskyy/goext/validator"
)

const (
	idPattern = "^[A-Za-z0-9][A-Za-z0-9_\\-]*$"
	idMessage = "Required to match URL safe characters only."
)

var (
	ID = validator.String("id").
		Min(3).Max(36).
		Pattern(idPattern, idMessage).Build()
	Name = validator.String("name").
		Required().Min(3).Max(64).Build()
	CollectionID = validator.String("collectionId").
			Required().Min(3).Max(36).
			Pattern(idPattern, idMessage).Build()
	Schedule = validator.String("schedule").
			Required().Min(9).Max(64).Build()
	ActionType = validator.String("type").
			Required().Exactly(4).Pattern("^HTTP$", "Must be 'HTTP' only.").Build()
	Method = validator.String("method").
		Min(3).Max(6).
		Pattern("^(HEAD|GET|POST|PUT|PATCH|DELETE)$", "Must be a valid HTTP verb.").
		Build()
	URI = validator.String("uri").
		Required().Min(8).Max(256).Build()
	HeaderName = validator.String("header.name").
			Required().Min(5).Max(32).Build()
	HeaderValue = validator.String("header.value").
			Required().Max(256).Build()
	Body = validator.String("body").
		Max(1024).Build()
	VariableValue = validator.String("value").
			Max(1024).Build()
	RetryCount = validator.Number("retryCount").
			Max(10).Build()
)

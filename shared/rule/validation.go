package rule

import (
	"github.com/akornatskyy/goext/validator"
)

var (
	ID   = validator.String("id").Exactly(36).UUID().Build()
	Name = validator.String("name").Required().Min(3).Max(64).Build()
)

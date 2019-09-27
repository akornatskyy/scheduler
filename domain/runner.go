package domain

import (
	"context"
)

type Runner interface {
	Run(ctx context.Context, a *Action) error
}

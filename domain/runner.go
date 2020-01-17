package domain

import (
	"context"
	"fmt"
)

type RunError struct {
	Code int
	Err  error
}

func (r *RunError) Error() string {
	return fmt.Sprintf("%d %s", r.Code, r.Err)
}

type Runner interface {
	Run(ctx context.Context, a *Action) error
}

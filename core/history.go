package core

import (
	"time"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) ListJobHistory(id string) ([]*domain.JobHistory, error) {
	if err := domain.ValidateId(id); err != nil {
		return nil, err
	}
	return s.Repository.ListJobHistory(id)
}

func (s *Service) DeleteJobHistory(id string, before time.Time) error {
	if err := domain.ValidateId(id); err != nil {
		return err
	}
	if before.IsZero() {
		before = time.Now().UTC()
	}
	return s.Repository.DeleteJobHistory(id, before)
}

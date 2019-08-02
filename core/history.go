package core

import (
	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) ListJobHistory(id string) ([]*domain.JobHistory, error) {
	if err := domain.ValidateId(id); err != nil {
		return nil, err
	}
	return s.Repository.ListJobHistory(id)
}

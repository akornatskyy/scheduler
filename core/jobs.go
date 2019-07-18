package core

import (
	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) ListJobs(collectionID string) ([]*domain.JobItem, error) {
	// TODO: search by state
	return s.Repository.ListJobs(collectionID)
}

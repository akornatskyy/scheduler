package core

import (
	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) ListCollections() ([]*domain.CollectionItem, error) {
	return s.Repository.ListCollections()
}

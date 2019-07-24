package core

import (
	"github.com/akornatskyy/scheduler/domain"
	"github.com/google/uuid"
)

func (s *Service) ListCollections() ([]*domain.CollectionItem, error) {
	return s.Repository.ListCollections()
}

func (s *Service) CreateCollection(c *domain.Collection) error {
	if err := domain.ValidateCollection(c); err != nil {
		return err
	}
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return s.Repository.CreateCollection(c)
}

func (s *Service) RetrieveCollection(id string) (*domain.Collection, error) {
	if err := domain.ValidateId(id); err != nil {
		return nil, err
	}
	return s.Repository.RetrieveCollection(id)
}

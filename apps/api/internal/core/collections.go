package core

import "github.com/akornatskyy/scheduler/internal/domain"

func (s *Service) ListCollections() ([]*domain.CollectionItem, error) {
	return s.Repository.ListCollections()
}

func (s *Service) CreateCollection(c *domain.Collection) error {
	if err := domain.ValidateCollection(c); err != nil {
		return err
	}
	if c.ID == "" {
		c.ID = domain.NewID()
	}
	return s.Repository.CreateCollection(c)
}

func (s *Service) RetrieveCollection(id string) (*domain.Collection, error) {
	if err := domain.ValidateID(id); err != nil {
		return nil, err
	}
	return s.Repository.RetrieveCollection(id)
}

func (s *Service) UpdateCollection(c *domain.Collection) error {
	if err := domain.ValidateCollection(c); err != nil {
		return err
	}
	return s.Repository.UpdateCollection(c)
}

func (s *Service) DeleteCollection(id string) error {
	if err := domain.ValidateID(id); err != nil {
		return err
	}
	return s.Repository.DeleteCollection(id)
}

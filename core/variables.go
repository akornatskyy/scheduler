package core

import (
	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) ListVariables(collectionID string) ([]*domain.VariableItem, error) {
	if err := domain.ValidateID(collectionID); err != nil {
		return nil, err
	}
	return s.Repository.ListVariables(collectionID)
}

func (s *Service) CreateVariable(Variable *domain.Variable) error {
	if err := domain.ValidateVariable(Variable); err != nil {
		return err
	}
	if Variable.ID == "" {
		Variable.ID = domain.NewID()
	}
	return s.Repository.CreateVariable(Variable)
}

func (s *Service) RetrieveVariable(id string) (*domain.Variable, error) {
	if err := domain.ValidateID(id); err != nil {
		return nil, err
	}
	return s.Repository.RetrieveVariable(id)
}

func (s *Service) UpdateVariable(Variable *domain.Variable) error {
	if err := domain.ValidateVariable(Variable); err != nil {
		return err
	}
	return s.Repository.UpdateVariable(Variable)
}

func (s *Service) DeleteVariable(id string) error {
	if err := domain.ValidateID(id); err != nil {
		return err
	}
	return s.Repository.DeleteVariable(id)
}

func (s *Service) mapVariables(collectionID string) (map[string]string, error) {
	variables, err := s.Repository.MapVariables(collectionID)
	if err != nil {
		return nil, err
	}
	for key, value := range s.variables {
		if _, ok := variables[key]; ok {
			continue
		}
		variables[key] = value
	}
	return variables, nil
}

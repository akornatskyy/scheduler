package core

import (
	"github.com/akornatskyy/scheduler/domain"
)

type Service struct {
	Repository domain.Repository
}

func (s *Service) Health() error {
	return s.Repository.Ping()
}

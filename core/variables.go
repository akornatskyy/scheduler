package core

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

package postgres

import (
	"database/sql"

	"github.com/akornatskyy/scheduler/internal/domain"
)

func (r *sqlRepository) ListVariables(collectionID string) ([]*domain.VariableItem, error) {
	items := make([]*domain.VariableItem, 0, 10)
	rows, err := r.selectVariables.Query(collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		v := &domain.VariableItem{}
		err := rows.Scan(&v.ID, &v.Name, &v.CollectionID, &v.Updated)
		if err != nil {
			return nil, err
		}
		items = append(items, v)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *sqlRepository) MapVariables(collectionID string) (map[string]string, error) {
	items := make(map[string]string)
	rows, err := r.selectVariablesNameValue.Query(collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var name, value string
		err := rows.Scan(&name, &value)
		if err != nil {
			return nil, err
		}
		items[name] = value
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *sqlRepository) CreateVariable(v *domain.Variable) error {
	return checkExec(r.insertVariable.Exec(
		v.ID, v.Name, v.CollectionID, v.Value,
	))
}

func (r *sqlRepository) RetrieveVariable(id string) (*domain.Variable, error) {
	v := &domain.Variable{}
	err := r.selectVariable.QueryRow(id).Scan(
		&v.ID, &v.Name, &v.Updated, &v.CollectionID, &v.Value,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return v, nil
}

func (r *sqlRepository) UpdateVariable(v *domain.Variable) error {
	return checkExec(r.updateVariable.Exec(
		v.ID, v.Updated, v.Name, v.CollectionID, v.Value,
	))
}

func (r *sqlRepository) DeleteVariable(id string) error {
	return checkExec(r.deleteVariable.Exec(id))
}

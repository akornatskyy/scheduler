package postgres

import (
	"github.com/akornatskyy/scheduler/domain"
)

func (r *sqlRepository) ListCollections() ([]*domain.CollectionItem, error) {
	items := make([]*domain.CollectionItem, 0, 10)
	rows, err := r.selectCollections.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		c := &domain.CollectionItem{}
		err := rows.Scan(&c.ID, &c.Name, &c.State)
		if err != nil {
			return nil, err
		}
		items = append(items, c)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

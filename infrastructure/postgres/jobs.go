package postgres

import (
	"github.com/akornatskyy/scheduler/domain"
)

func (r *sqlRepository) ListJobs(collectionID string) ([]*domain.JobItem, error) {
	items := make([]*domain.JobItem, 0, 10)
	rows, err := r.selectJobs.Query(collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		j := &domain.JobItem{}
		err := rows.Scan(&j.ID, &j.Name, &j.State, &j.Schedule)
		if err != nil {
			return nil, err
		}
		items = append(items, j)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

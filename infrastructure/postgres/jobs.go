package postgres

import (
	"encoding/json"

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

func (r *sqlRepository) CreateJob(j *domain.JobDefinition) error {
	action, err := json.Marshal(j.Action)
	if err != nil {
		return err
	}
	return checkExec(r.insertJob.Exec(
		j.ID, j.Name, j.CollectionID, j.State, j.Schedule, action,
	))
}

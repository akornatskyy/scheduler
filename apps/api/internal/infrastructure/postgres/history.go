package postgres

import (
	"time"

	"github.com/akornatskyy/scheduler/internal/domain"
)

func (r *sqlRepository) ListJobHistory(id string) ([]*domain.JobHistory, error) {
	items := make([]*domain.JobHistory, 0, 100)
	rows, err := r.selectJobHistory.Query(id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		j := &domain.JobHistory{}
		err := rows.Scan(
			&j.Action, &j.Started, &j.Finished, &j.Status,
			&j.RetryCount, &j.Message,
		)
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

func (r *sqlRepository) AddJobHistory(jh *domain.JobHistory) error {
	return checkExec(r.insertJobHistory.Exec(
		domain.NewID(), jh.JobID, jh.Action, jh.Started, jh.Finished,
		jh.Status, jh.RetryCount, jh.Message,
	))
}

func (r *sqlRepository) DeleteJobHistory(id string, before time.Time) error {
	_, err := r.deleteJobHistory.Exec(id, before)
	if err != nil {
		return err
	}
	return nil
}

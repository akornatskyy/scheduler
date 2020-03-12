package postgres

import (
	"database/sql"
	"encoding/json"
	"time"

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

func (r *sqlRepository) RetrieveJob(id string) (*domain.JobDefinition, error) {
	j := &domain.JobDefinition{}
	var s string
	err := r.selectJob.QueryRow(id).Scan(
		&j.ID, &j.Name, &j.Updated, &j.CollectionID, &j.State, &j.Schedule, &s,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	j.Action = &domain.Action{}
	if err := json.Unmarshal([]byte(s), j.Action); err != nil {
		return nil, err
	}
	return j, nil
}

func (r *sqlRepository) UpdateJob(j *domain.JobDefinition) error {
	action, err := json.Marshal(j.Action)
	if err != nil {
		return err
	}
	return checkExec(r.updateJob.Exec(
		j.ID, j.Updated, j.Name, j.CollectionID, j.State, j.Schedule, action,
	))
}

func (r *sqlRepository) DeleteJob(id string) error {
	return checkExec(r.deleteJob.Exec(id))
}

func (r *sqlRepository) RetrieveJobStatus(id string) (*domain.JobStatus, error) {
	j := &domain.JobStatus{}
	err := r.selectJobStatus.QueryRow(id).Scan(
		&j.Updated, &j.Running, &j.RunCount, &j.ErrorCount, &j.LastRun,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return j, nil
}
func (r *sqlRepository) ListLeftOverJobs() ([]string, error) {
	items := make([]string, 0, 10)
	rows, err := r.selectLeftOverJobs.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		err := rows.Scan(&id)
		if err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *sqlRepository) ResetJobStatus(id string) error {
	return checkExec(r.resetJobStatus.Exec(id, domain.NewID()))
}

func (r *sqlRepository) AcquireJob(id string, deadline time.Duration) error {
	return checkExec(r.updateJobStatus.Exec(id, deadline.String()))
}

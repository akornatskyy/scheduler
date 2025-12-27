package postgres

import (
	"database/sql"
	"log"

	"github.com/akornatskyy/scheduler/internal/domain"
)

func (r *sqlRepository) ListCollections() ([]*domain.CollectionItem, error) {
	items := make([]*domain.CollectionItem, 0, 10)
	rows, err := r.selectCollections.Query()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			log.Printf("WARN: failed to close rows: %v", err)
		}
	}()
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

func (r *sqlRepository) CreateCollection(c *domain.Collection) error {
	return checkExec(r.insertCollection.Exec(
		c.ID, c.Name, c.State,
	))
}

func (r *sqlRepository) RetrieveCollection(id string) (*domain.Collection, error) {
	c := &domain.Collection{}
	err := r.selectCollection.QueryRow(id).Scan(
		&c.ID, &c.Name, &c.Updated, &c.State,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return c, nil
}

func (r *sqlRepository) UpdateCollection(c *domain.Collection) error {
	return checkExec(r.updateCollection.Exec(
		c.ID, c.Updated, c.Name, c.State,
	))
}

func (r *sqlRepository) DeleteCollection(id string) error {
	return checkExec(r.deleteCollection.Exec(id))
}

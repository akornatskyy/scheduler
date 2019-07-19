package postgres

import (
	"database/sql"

	"github.com/akornatskyy/scheduler/domain"
	"github.com/lib/pq"
)

const (
	errDuplicateKey = "23505"
	errForeignKey   = "23503"
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

func (r *sqlRepository) CreateCollection(c *domain.Collection) error {
	return checkExec(r.insertCollection.Exec(
		c.ID, c.Name, c.State,
	))
}

func checkExec(res sql.Result, err error) error {
	if err != nil {
		if err, ok := err.(*pq.Error); ok {
			switch err.Code {
			case errDuplicateKey:
				return domain.ErrConflict
			case errForeignKey:
				return domain.ErrConflict
			}
		}
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n != 1 {
		return domain.ErrNotFound
	}
	return nil
}

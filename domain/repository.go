package domain

type Repository interface {
	Ping() error
	Close() error

	ListCollections() ([]*CollectionItem, error)

	ListJobs(collectionID string) ([]*JobItem, error)
}

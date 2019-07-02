package domain

type Repository interface {
	Ping() error
	Close() error

	ListCollections() ([]*CollectionItem, error)
}

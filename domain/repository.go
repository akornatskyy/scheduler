package domain

type Repository interface {
	Ping() error
	Close() error

	ListCollections() ([]*CollectionItem, error)
	CreateCollection(c *Collection) error
	RetrieveCollection(id string) (*Collection, error)
	UpdateCollection(c *Collection) error
	DeleteCollection(id string) error

	ListJobs(collectionID string) ([]*JobItem, error)
	CreateJob(j *JobDefinition) error
	RetrieveJob(id string) (*JobDefinition, error)
	UpdateJob(j *JobDefinition) error
	DeleteJob(id string) error

	RetrieveJobStatus(id string) (*JobStatus, error)
}

package domain

type (
	CollectionState int
	JobState        int

	CollectionItem struct {
		ID    string          `json:"id"`
		Name  string          `json:"name"`
		State CollectionState `json:"state"`
	}

	JobItem struct {
		ID       string   `json:"id"`
		Name     string   `json:"name"`
		State    JobState `json:"state"`
		Schedule string   `json:"schedule"`
	}
)

package domain

type (
	CollectionState int

	CollectionItem struct {
		ID    string          `json:"id"`
		Name  string          `json:"name"`
		State CollectionState `json:"state"`
	}
)

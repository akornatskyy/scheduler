package domain

import (
	"strconv"
	"time"
)

func (c *Collection) ETag() string {
	return etag(c.Updated)
}

func (c *Variable) ETag() string {
	return etag(c.Updated)
}

func (j *JobDefinition) ETag() string {
	return etag(j.Updated)
}

func (j *JobStatus) ETag() string {
	if j.NextRun == nil {
		return etag(j.Updated)
	}

	return "\"" + strconv.FormatInt(
		j.Updated.UnixMicro()+j.NextRun.UnixMicro(), 36) + "\""
}

func etag(t time.Time) string {
	return "\"" + strconv.FormatInt(t.UnixMicro(), 36) + "\""
}

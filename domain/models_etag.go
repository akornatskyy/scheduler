package domain

import (
	"strconv"
	"time"
)

func (c *Collection) ETag() string {
	return etag(c.Updated)
}

func (j *JobDefinition) ETag() string {
	return etag(j.Updated)
}

func (j *JobStatus) ETag() string {
	return etag(j.Updated)
}

func etag(t time.Time) string {
	return "\"" + strconv.FormatInt(t.UnixNano()/int64(time.Microsecond), 36) + "\""
}

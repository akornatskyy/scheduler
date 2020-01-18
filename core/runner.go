package core

import (
	"context"
	"log"
	"time"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) OnRunJob(j *domain.JobDefinition) {
	log.Printf("attempting to run job %s", j.ID)
	a := j.Action
	runner := s.Runners[a.Type]
	if runner == nil {
		log.Printf("unsupported action type: %s", a.Type)
		return
	}

	p := a.RetryPolicy
	if p == nil {
		p = domain.DefaultRetryPolicy
	}

	err := s.Repository.AcquireJob(j.ID, time.Duration(p.Deadline))
	if err != nil {
		log.Printf("WARN: acquire job %s: %s", j.ID, err)
		return
	}

	jh := &domain.JobHistory{
		JobID:   j.ID,
		Action:  a.Type,
		Started: time.Now().UTC(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(p.Deadline))
	defer cancel()

	attempt := 0
loop:
	for {
		err = runner.Run(ctx, a)
		if err == nil {
			break
		}
		if re, ok := err.(*domain.RunError); ok {
			switch re.Code {
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#Client_error_responses
				// TODO: add all client error responses (4XX) as unrecoverable?
			case 400, 401, 403, 404, 422:
				break loop
			}
		}
		select {
		case <-ctx.Done():
			err = ctx.Err()
			if err != nil {
				break loop
			}
		case <-time.After(time.Duration(p.RetryInterval)):
		}
		if attempt == p.RetryCount {
			break
		}
		attempt++
	}

	jh.Finished = time.Now().UTC()
	jh.RetryCount = attempt
	if err != nil {
		jh.Status = domain.JobHistoryStatusFailed
		msg := err.Error()
		jh.Message = &msg
	} else {
		jh.Status = domain.JobHistoryStatusCompleted
	}

	log.Printf("job %s: %s", j.ID, jh.Status)
	if err = s.Repository.AddJobHistory(jh); err != nil {
		log.Printf("ERR: job %s: %s", j.ID, err)
	}
}

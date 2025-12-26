package core

import (
	"context"
	"log"
	"time"

	"github.com/akornatskyy/scheduler/internal/domain"
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

	attempt := 0

	a, err = s.transposeAction(j)
	if err == nil {
		ctx, cancel := context.WithTimeout(s.ctx, time.Duration(p.Deadline))
		defer cancel()

	loop:
		for {
			err = runner.Run(ctx, a)
			if err == nil || attempt == p.RetryCount {
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
			attempt++
		}
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

func (s *Service) transposeAction(j *domain.JobDefinition) (*domain.Action, error) {
	variables, err := s.mapVariables(j.CollectionID)
	if err != nil {
		return nil, err
	}
	variables["CollectionID"] = j.CollectionID
	variables["JobID"] = j.ID
	a := j.Action
	req, err := a.Request.Transpose(variables)
	if err != nil {
		return nil, err
	}
	return &domain.Action{
		Type:        a.Type,
		Request:     req,
		RetryPolicy: a.RetryPolicy,
	}, nil
}

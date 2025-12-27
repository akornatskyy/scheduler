package domain

import (
	"html/template"
	"strings"

	"github.com/akornatskyy/goext/errorstate"
)

func (req *HTTPRequest) Transpose(variables map[string]string) (*HTTPRequest, error) {
	e := &errorstate.ErrorState{
		Domain: domain,
	}
	uri, err := renderTemplate("uri", req.URI, variables)
	if err != nil {
		e.Add(&errorstate.Detail{
			Domain:   domain,
			Type:     "field",
			Location: "uri",
			Reason:   "template",
			Message:  err.Error(),
		})
	}
	headers := make([]*NameValuePair, 0, len(req.Headers))
	for _, pair := range req.Headers {
		value, err := renderTemplate("header value", pair.Value, variables)
		if err != nil {
			e.Add(&errorstate.Detail{
				Domain:   domain,
				Type:     "field",
				Location: "__ERROR__",
				Reason:   "template",
				Message:  err.Error(),
			})
			break
		}
		headers = append(headers, &NameValuePair{
			Name:  pair.Name,
			Value: value,
		})
	}
	body, err := renderTemplate("body", req.Body, variables)
	if err != nil {
		e.Add(&errorstate.Detail{
			Domain:   domain,
			Type:     "field",
			Location: "body",
			Reason:   "template",
			Message:  err.Error(),
		})
	}
	if e.Errors != nil {
		return nil, e
	}
	return &HTTPRequest{
		Method:  req.Method,
		URI:     uri,
		Headers: headers,
		Body:    body,
	}, nil
}

func renderTemplate(name string, text string, variables map[string]string) (string, error) {
	t, err := template.New(name).Parse(text)
	if err != nil {
		return "", err
	}
	var b strings.Builder
	if err := t.Execute(&b, variables); err != nil {
		return "", err
	}
	return b.String(), nil
}

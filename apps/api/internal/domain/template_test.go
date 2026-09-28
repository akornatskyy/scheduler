package domain

import (
	"reflect"
	"testing"
)

func TestTranspose(t *testing.T) {
	var testcases = []struct {
		name      string
		template  string
		variables map[string]string
		expected  string
	}{
		{
			name:      "query string",
			template:  "{{.value}}",
			variables: map[string]string{"value": "https://example.com/run?first=1&second=2"},
			expected:  "https://example.com/run?first=1&second=2",
		},
		{
			name:      "header token",
			template:  "Bearer {{.value}}",
			variables: map[string]string{"value": "token+with&characters='<>\""},
			expected:  "Bearer token+with&characters='<>\"",
		},
		{
			name:      "JSON body",
			template:  "{{.value}}",
			variables: map[string]string{"value": `{"message":"A&B < C"}`},
			expected:  `{"message":"A&B < C"}`,
		},
		{
			name:      "explicit query escaping",
			template:  "https://example.com/run?q={{urlquery .value}}",
			variables: map[string]string{"value": "A&B C"},
			expected:  "https://example.com/run?q=A%26B+C",
		},
		{
			name:      "explicit HTML escaping",
			template:  "{{html .value}}",
			variables: map[string]string{"value": "A&B < C"},
			expected:  "A&amp;B &lt; C",
		},
		{
			name:     "missing variable",
			template: "before{{.missing}}after",
			expected: "beforeafter",
		},
	}
	for _, tt := range testcases {
		t.Run(tt.name, func(t *testing.T) {
			req := &HTTPRequest{
				Method:  "POST",
				URI:     tt.template,
				Headers: []*NameValuePair{{Name: "X-Value", Value: tt.template}},
				Body:    tt.template,
			}
			got, err := req.Transpose(tt.variables)
			if err != nil {
				t.Fatal(err)
			}
			want := &HTTPRequest{
				Method:  "POST",
				URI:     tt.expected,
				Headers: []*NameValuePair{{Name: "X-Value", Value: tt.expected}},
				Body:    tt.expected,
			}
			if !reflect.DeepEqual(got, want) {
				t.Errorf("Transpose() got: %#v, expected: %#v", got, want)
			}
		})
	}
}

func TestTransposeErrors(t *testing.T) {
	for _, value := range []string{"{{", "{{call .value}}"} {
		for name, req := range map[string]*HTTPRequest{
			"uri":    {URI: value},
			"header": {Headers: []*NameValuePair{{Name: "X-Value", Value: value}}},
			"body":   {Body: value},
		} {
			t.Run(name+"/"+value, func(t *testing.T) {
				got, err := req.Transpose(map[string]string{"value": "not a function"})
				if err == nil || got != nil {
					t.Errorf("Transpose() got: %v, %v, expected: nil request and an error", got, err)
				}
			})
		}
	}
}

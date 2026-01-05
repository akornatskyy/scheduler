import {DomainError, ValidationError} from '$shared/errors';
import {createErrorFromResponse} from './errors';

describe('createErrorFromResponse', () => {
  it('maps text/plain body to DomainError message', async () => {
    const response = mockResponse('Internal server error', {
      status: 400,
      headers: {'content-type': 'text/plain'},
    });

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(DomainError);
    expect(err.name).toBe('DomainError');
    expect(err.message).toBe('Internal server error');
  });

  it('maps to DomainError if no content type', async () => {
    const response = mockResponse('Internal server error', {
      status: 503,
      headers: {'content-type': ''},
    });

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(DomainError);
    expect(err.name).toBe('DomainError');
    expect(err.message).toMatch(/overloaded/);
  });

  it('maps domain error JSON {message} to DomainError message', async () => {
    const response = mockResponse(
      JSON.stringify({message: 'Internal server error'}),
      {
        status: 403,
        headers: {'content-type': 'application/json'},
      },
    );

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(DomainError);
    expect(err.name).toBe('DomainError');
    expect(err.message).toBe('Internal server error');
  });

  it('maps validation error JSON {errors:[{type,location,message}]} to ValidationError', async () => {
    const response = mockResponse(
      JSON.stringify({
        errors: [
          {type: 'field', location: 'title', message: 'Required'},
          {type: 'field', location: 'count', message: 'Invalid'},
        ],
      }),
      {status: 422, headers: {'content-type': 'application/json'}},
    );

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(ValidationError);
    expect(err.name).toBe('ValidationError');
    expect(err).toMatchObject({
      details: {title: 'Required', count: 'Invalid'},
    });
  });

  it('maps non field violation to DomainError', async () => {
    const response = mockResponse(
      JSON.stringify({
        errors: [
          {
            type: 'reader',
            location: 'HTTP request body',
            message: 'limited to 1024 bytes',
          },
        ],
      }),
      {status: 422, headers: {'content-type': 'application/json'}},
    );

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(DomainError);
    expect(err.name).toBe('DomainError');
    expect(err.message).toBe('limited to 1024 bytes');
  });

  it('falls back to default http message map when no body', async () => {
    const response = mockResponse('', {
      status: 404,
      headers: {'content-type': 'text/plain'},
    });

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(DomainError);
    expect(err.name).toBe('DomainError');
    expect(err.message).toBe(
      'The requested resource could not be found on the server.',
    );
  });

  it('falls back to http status text when no status map', async () => {
    const response = mockResponse('', {
      status: 403,
      statusText: 'Forbidden',
    });

    const err = await createErrorFromResponse(response);

    expect(err).toBeInstanceOf(DomainError);
    expect(err.name).toBe('DomainError');
    expect(err.message).toBe('Forbidden');
  });
});

function mockResponse(
  body: string,
  init: {status: number; statusText?: string; headers?: Record<string, string>},
): Response {
  return {
    status: init.status ?? 0,
    statusText: init.statusText ?? '',
    headers: {get: (key: string) => init?.headers?.[key]},
    async text() {
      return body;
    },
  } as Response;
}

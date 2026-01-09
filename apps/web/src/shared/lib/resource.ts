export type ApiResourceOptions = {
  baseURL: string;
  // headers?: Record<string, string>;
  fetcher?: typeof fetch;
  createErrorFromResponse: (response: Response) => Promise<Error>;
};

export class ApiResource {
  constructor(private readonly options: ApiResourceOptions) {}

  async list<T>(path: string): Promise<ListResourceResponse<T>> {
    const response = await this.fetch(path);
    return await response.json();
  }

  async get<T>(path: string): Promise<GetResourceResponse<T>> {
    const response = await this.fetch(path);
    const etag = response.headers.get('etag') ?? undefined;
    const item: T = await response.json();
    return [item, etag];
  }

  async post<T = string>(path: string, item: unknown): Promise<T> {
    const response = await this.fetch(path, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(item),
    });
    return response.json();
  }

  async patch(path: string, data: unknown, etag?: string): Promise<void> {
    const headers: HeadersInit = {'content-type': 'application/json'};
    if (etag) headers['if-match'] = etag;
    await this.fetch(path, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  async delete(path: string, etag?: string): Promise<void> {
    const options: FetchOptions = {method: 'DELETE'};
    if (etag) options.headers = {'if-match': etag};
    await this.fetch(path, options);
  }

  private async fetch(
    path: string,
    options: FetchOptions = {},
  ): Promise<Response> {
    const url = new URL(path, this.options.baseURL);
    const execute = this.options.fetcher ?? fetch;
    const response = await execute(url, options);
    if (!response.ok) {
      const error = await this.options.createErrorFromResponse(response);
      throw error;
    }

    return response;
  }
}

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: BodyInit;
};

export type ListResourceResponse<T> = {
  items: T[];
};

export type GetResourceResponse<T> = [data: T, etag?: string];

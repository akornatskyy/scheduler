import {useJob} from '$features/jobs';
import {useSignal} from '$shared/hooks';
import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router, useParams} from 'react-router';
import {JobPage} from './JobPage';

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useParams: jest.fn()};
});

jest.mock('$shared/hooks', () => ({
  useSignal: jest.fn(),
}));

jest.mock('$features/jobs', () => {
  const actual = jest.requireActual('$features/jobs');
  return {...actual, useJob: jest.fn()};
});

describe('JobPage', () => {
  const base: ReturnType<typeof useJob> = {
    collections: [],
    item: {
      name: '',
      state: 'enabled',
      schedule: '',
      collectionId: '',
      action: {
        type: 'HTTP',
        request: {method: 'GET', uri: '', headers: [], body: ''},
        retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m'},
      },
    },
    errors: {},
    mutate: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useParams).mockReturnValue({});
    jest.mocked(useSignal).mockReturnValue(false);
    jest.mocked(useJob).mockReturnValue(base);
  });

  it('passes route id into hook', () => {
    jest.mocked(useParams).mockReturnValue({id: '7ce1f17e'});

    render(
      <Router>
        <JobPage />
      </Router>,
    );

    expect(useJob).toHaveBeenCalledTimes(1);
    expect(useJob).toHaveBeenCalledWith('7ce1f17e');
    expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
    expect(screen.getByRole('button', {name: 'Delete'})).toBeVisible();
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useJob).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'unexpected'},
    });

    render(
      <Router initialEntries={['/jobs/add']}>
        <JobPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /unexpected/})).toBeVisible();
  });

  it('renders title from item name', () => {
    jest.mocked(useJob).mockReturnValue({
      ...base,
      item: {...base.item, name: 'Test #1'},
    });

    render(
      <Router initialEntries={['/jobs/add']}>
        <JobPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: 'Job Test #1'})).toBeVisible();
  });

  it('passes pending state to form', () => {
    jest.mocked(useSignal).mockReturnValue(true);

    render(
      <Router>
        <JobPage />
      </Router>,
    );

    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
  });
});

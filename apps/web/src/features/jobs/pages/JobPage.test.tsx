import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useJob} from '../hooks/useJob';
import {JobPage} from './JobPage';

jest.mock('../hooks/useJob');

const mockUseParams = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useParams: () => mockUseParams()};
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
    pending: false,
    errors: {},
    mutate: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    jest.mocked(useJob).mockReturnValue(base);
  });

  it('passes route id into hook', () => {
    mockUseParams.mockReturnValue({id: '7ce1f17e'});

    render(
      <Router>
        <JobPage />
      </Router>,
    );

    expect(useJob).toHaveBeenCalledTimes(1);
    expect(useJob).toHaveBeenCalledWith('7ce1f17e');
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
});

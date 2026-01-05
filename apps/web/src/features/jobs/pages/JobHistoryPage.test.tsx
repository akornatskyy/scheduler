import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useJobHistory} from '../hooks/useJobHistory';
import {JobHistory} from '../types';
import {JobHistoryPage} from './JobHistoryPage';

jest.mock('../hooks/useJobHistory');

const mockUseParams = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useParams: () => mockUseParams()};
});

describe('JobHistoryPage', () => {
  const base: ReturnType<typeof useJobHistory> = {
    job: {name: ''},
    status: {runCount: 0, errorCount: 0},
    items: [],
    errors: {},
    back: jest.fn(),
    run: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useJobHistory).mockReturnValue(base);
  });

  it('passes route id into hook', () => {
    mockUseParams.mockReturnValue({id: '7ce1f17e'});
    render(
      <Router>
        <JobHistoryPage />
      </Router>,
    );

    expect(useJobHistory).toHaveBeenCalledTimes(1);
    expect(useJobHistory).toHaveBeenCalledWith('7ce1f17e');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useJobHistory).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'unexpected'},
    });

    render(
      <Router initialEntries={['/jobs/j1/history']}>
        <JobHistoryPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /unexpected/})).toBeVisible();
  });

  it('renders items from hook', () => {
    jest.mocked(useJobHistory).mockReturnValue({
      ...base,
      job: {name: 'Job #1'},
      items: [{action: 'HTTP'} as JobHistory],
    });

    render(
      <Router initialEntries={['/jobs/j1/history']}>
        <JobHistoryPage />
      </Router>,
    );

    expect(screen.getByText(/Job History Job #1/)).toBeVisible();
  });
});

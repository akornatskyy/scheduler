import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useJobs} from '../hooks/useJobs';
import {JobsPage} from './JobsPage';

jest.mock('../hooks/useJobs');

describe('jobs page', () => {
  const base: ReturnType<typeof useJobs> = {
    collections: [],
    jobs: [],
    errors: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useJobs).mockReturnValue(base);
  });

  it('passes collectionId query param into hook', () => {
    render(
      <Router initialEntries={['/jobs?collectionId=65ada2f9']}>
        <JobsPage />
      </Router>,
    );

    expect(useJobs).toHaveBeenCalledTimes(1);
    expect(useJobs).toHaveBeenCalledWith('65ada2f9');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useJobs).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'Unexpected'},
    });

    render(
      <Router>
        <JobsPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('renders collections/jobs from hook', () => {
    jest.mocked(useJobs).mockReturnValue({
      ...base,
      collections: [{id: 'c1', name: 'Collection #1', state: 'enabled'}],
      jobs: [
        {
          id: 'j1',
          name: 'Job #1',
          collectionId: 'c1',
          state: 'enabled',
          schedule: '@every 5m',
          status: 'running',
        },
      ],
    });

    render(
      <Router>
        <JobsPage />
      </Router>,
    );

    expect(screen.getByText('Collection #1')).toBeVisible();
    expect(screen.getByText('Job #1')).toBeVisible();
  });
});

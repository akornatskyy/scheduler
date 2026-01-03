import {render, screen} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import {useJobHistory} from '../hooks/useJobHistory';
import {JobHistory} from '../types';
import {JobHistoryPage} from './JobHistoryPage';

jest.mock('../hooks/useJobHistory');

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
    render(
      <Router initialEntries={['/jobs/j1/history']}>
        <Routes>
          <Route path="/jobs/:id/history" element={<JobHistoryPage />} />
        </Routes>
      </Router>,
    );

    expect(useJobHistory).toHaveBeenCalledTimes(1);
    expect(useJobHistory).toHaveBeenCalledWith('j1');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useJobHistory).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'unexpected'},
    });

    render(
      <Router initialEntries={['/jobs/j1/history']}>
        <Routes>
          <Route path="/jobs/:id/history" element={<JobHistoryPage />} />
        </Routes>
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
        <Routes>
          <Route path="/jobs/:id/history" element={<JobHistoryPage />} />
        </Routes>
      </Router>,
    );

    expect(screen.getByText(/Job History Job #1/)).toBeVisible();
  });
});

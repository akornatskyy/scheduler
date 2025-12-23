import {render, screen} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import {useJob} from '../hooks/useJob';
import {JobPage} from './JobPage';

jest.mock('../hooks/useJob');

describe('job page', () => {
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
    updateItem: jest.fn(),
    updateAction: jest.fn(),
    updateRequest: jest.fn(),
    updatePolicy: jest.fn(),
    updateHeader: jest.fn(),
    addHeader: jest.fn(),
    removeHeader: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useJob).mockReturnValue(base);
  });

  it('passes route id into hook', () => {
    render(
      <Router initialEntries={['/jobs/7ce1f17e']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobPage />} />
        </Routes>
      </Router>,
    );

    expect(useJob).toHaveBeenCalledTimes(1);
    expect(useJob).toHaveBeenCalledWith('7ce1f17e');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useJob).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'Unexpected'},
    });

    render(
      <Router initialEntries={['/jobs/add']}>
        <Routes>
          <Route path="/jobs/add" element={<JobPage />} />
        </Routes>
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('renders delete button when item has id', () => {
    jest.mocked(useJob).mockReturnValue({
      ...base,
      item: {...base.item, id: 'j1'},
    });

    render(
      <Router initialEntries={['/jobs/j1']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobPage />} />
        </Routes>
      </Router>,
    );

    expect(screen.getByRole('button', {name: 'Delete'})).toBeVisible();
  });
});

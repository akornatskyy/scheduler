import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen, waitFor} from '@testing-library/react';

import * as api from './jobs-api';
import Jobs from './jobs';

jest.mock('./jobs-api');

describe('jobs', () => {
  const props = {
    location: {}
  };

  beforeEach(() => jest.clearAllMocks());

  it('handles list collections error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);
    api.listJobs.mockResolvedValue({items: []});

    render(<Router><Jobs {...props} /></Router>);

    await waitFor(() => expect(api.listCollections).toBeCalledWith());
    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledWith(null);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles list jobs error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockResolvedValue({items: []});
    api.listJobs.mockRejectedValue(errors);

    render(<Router><Jobs {...props} /></Router>);

    await waitFor(() => expect(api.listCollections).toBeCalledWith());
    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledWith(null);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    api.listCollections.mockResolvedValue({
      items: [{id: '65ada2f9'}]
    });
    api.listJobs.mockResolvedValue({
      items: [{
        id: '845ab32f',
        collectionId: '65ada2f9'
      }]
    });

    render(
        <Router>
          <Jobs {...props} location={{search: '?collectionId=65ada2f9'}} />
        </Router>
    );

    await waitFor(() => expect(api.listCollections).toBeCalledWith());
    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledWith('65ada2f9');
  });

  it('refreshes on timer', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    api.listCollections.mockResolvedValue({items: []});
    api.listJobs.mockResolvedValue({items: []});

    render(<Router><Jobs {...props} /></Router>);
    jest.runOnlyPendingTimers();

    await waitFor(() => expect(api.listCollections).toBeCalledTimes(2));
    expect(api.listJobs).toBeCalledTimes(2);
    expect(setInterval).toBeCalledTimes(1);
  });

  it('clears timer on unmount', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
    api.listCollections.mockResolvedValue({items: []});
    api.listJobs.mockResolvedValue({items: []});
    const {unmount} = render(<Router><Jobs {...props} /></Router>);
    await waitFor(() => expect(api.listCollections).toBeCalledTimes(1));
    expect(api.listJobs).toBeCalledTimes(1);
    expect(setInterval).toBeCalledTimes(1);
    expect(setInterval).toBeCalledWith(expect.anything(), 10000);

    unmount();

    expect(clearInterval).toBeCalledTimes(1);
  });
});

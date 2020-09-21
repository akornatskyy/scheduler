import React from 'react';
import {shallow} from 'enzyme';

import * as api from './jobs-api';
import Jobs from './jobs';

jest.mock('./jobs-api');

describe('jobs', () => {
  const props = {
    location: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list collections error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<Jobs {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.listJobs).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledWith(null);
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles list jobs error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listJobs.mockImplementation(rejectPromise(errors));

    const w = shallow(<Jobs {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.listJobs).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledWith(null);
    expect(w.state('errors')).toEqual(errors);
  });

  it('updates state with fetched items', () => {
    const collections = [{
      id: '65ada2f9'
    }];
    api.listCollections.mockImplementation(resolvePromise({
      items: collections
    }));
    const jobs = [{
      collectionId: '65ada2f9'
    }];
    api.listJobs.mockImplementation(resolvePromise({
      items: jobs
    }));

    const w = shallow(
        <Jobs {...props} location={{search: '?collectionId=65ada2f9'}} />
    );

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.listJobs).toBeCalledTimes(1);
    expect(api.listJobs).toBeCalledWith('65ada2f9');
    expect(w.state()).toEqual({
      collections,
      jobs,
      errors: {}
    });
  });

  it('refreshes on timer', () => {
    jest.useFakeTimers();
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    shallow(<Jobs {...props} />);
    jest.runOnlyPendingTimers();

    expect(api.listCollections).toBeCalledTimes(2);
    expect(api.listJobs).toBeCalledTimes(2);
  });

  it('clears timer on unmount', () => {
    jest.useFakeTimers();
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<Jobs {...props} />);
    w.unmount();

    expect(setInterval).toBeCalledTimes(1);
    expect(setInterval).toBeCalledWith(expect.anything(), 10000);
    expect(clearInterval).toBeCalledTimes(1);
  });
});

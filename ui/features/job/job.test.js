import React from 'react';
import {shallow} from 'enzyme';

import * as api from './job-api';
import Job from './job';

jest.mock('./job-api');

describe('job', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {id: '7ce1f17e'}},
      history: {
        goBack: jest.fn()
      }
    };
    api.listCollections.mockImplementation(resolvePromise({
      items: [
        {
          id: '65ada2f9',
          name: 'My App #1',
          state: 'enabled'
        }
      ]
    }));
    jest.clearAllMocks();
  });

  it('renders add item if no id specified', () => {
    props.match.params.id = null;
    const w = shallow(<Job {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(w.state()).toEqual({
      item: {
        name: '',
        state: 'enabled',
        schedule: '',
        collectionId: '65ada2f9',
        action: {
          type: 'HTTP',
          request: {
            method: 'GET',
            uri: '',
            headers: [],
            body: ''
          },
          retryPolicy: {
            retryCount: 3,
            retryInterval: '10s',
            deadline: '1m'
          }
        }
      },
      collections: [{
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      }],
      pending: false,
      errors: {}
    });
  });

  it('renders edit item', () => {
    api.retrieveJob.mockImplementation(resolvePromise({
      id: '7ce1f17e',
      name: 'My Job #1',
      state: 'disabled',
      schedule: 'every 5m',
      collectionId: '65ada2f9',
      action: {
        type: 'HTTP',
        request: {
          method: 'POST',
          uri: 'http://localhost:8080',
          headers: [{name: '', value: ''}],
          body: '{}'
        },
        retryPolicy: {
          retryCount: 2,
          retryInterval: '30s',
          deadline: '2m'
        }
      }
    }));

    const w = shallow(<Job {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(w.state()).toEqual({
      item: {
        id: '7ce1f17e',
        name: 'My Job #1',
        state: 'disabled',
        schedule: 'every 5m',
        collectionId: '65ada2f9',
        action: {
          type: 'HTTP',
          request: {
            method: 'POST',
            uri: 'http://localhost:8080',
            headers: [{name: '', value: ''}],
            body: '{}'
          },
          retryPolicy: {
            retryCount: 2,
            retryInterval: '30s',
            deadline: '2m'
          }
        }
      },
      collections: [{
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      }],
      pending: false,
      errors: {}
    });
  });

  it('shows field error when collections list is empty', () => {
    props.match.params.id = null;
    api.listCollections.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<Job {...props} />);

    expect(w.state('pending')).toEqual(false);
    expect(w.state('errors')).toEqual({
      collectionId: 'There is no collection available.'
    });
  });

  it('selects a first item from collections list', () => {
    props.match.params.id = null;
    api.listCollections.mockImplementation(resolvePromise({items: [
      {
        id: '84432333',
        name: 'My App',
        state: 'enabled'
      },
      {
        id: '65ada2f9',
        name: 'My Other App',
        state: 'enabled'
      }
    ]}));

    const w = shallow(<Job {...props} />);

    expect(w.state('item').collectionId).toEqual('84432333');
  });

  it('list collections fails', () => {
    props.match.params.id = null;
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));

    const w = shallow(<Job {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles retrieve job error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(rejectPromise(errors));

    const w = shallow(<Job {...props} />);

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles item change', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');

    f.simulate('itemChange', 'collectionId', '123de331');
    f.simulate('itemChange', 'name', 'My Other Task');
    f.simulate('itemChange', 'state', 'disabled');
    f.simulate('itemChange', 'schedule', '@every 15s');

    expect(w.state('item')).toMatchObject({
      collectionId: '123de331',
      name: 'My Other Task',
      state: 'disabled',
      schedule: '@every 15s'
    });
  });

  it('handles action change', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');

    f.simulate('actionChange', 'type', 'HTTP');

    expect(w.state('item').action).toMatchObject({
      type: 'HTTP'
    });
  });

  it('handles request change', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');

    f.simulate('requestChange', 'method', 'POST');
    f.simulate('requestChange', 'uri', 'https://localhost');
    f.simulate('requestChange', 'body', '{}');

    expect(w.state('item').action.request).toEqual({
      method: 'POST',
      uri: 'https://localhost',
      headers: [],
      body: '{}'
    });
  });

  it('handles policy change', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');

    f.simulate('policyChange', 'retryCount', 7);
    f.simulate('policyChange', 'retryInterval', '45s');
    f.simulate('policyChange', 'deadline', '3m');

    expect(w.state('item').action.retryPolicy).toEqual({
      retryCount: 7,
      retryInterval: '45s',
      deadline: '3m'
    });
  });

  it('handles add header', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');

    f.simulate('addHeader');

    expect(w.state('item').action.request.headers).toEqual([{
      name: '', value: ''
    }]);
  });

  it('handles delete header', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');
    f.simulate('addHeader');

    f.simulate('deleteHeader', 0);

    expect(w.state('item').action.request.headers).toEqual([]);
  });

  it('handles header change', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');
    f.simulate('addHeader');

    f.simulate('headerChange', 'X-Requested-With', 'XMLHttpRequest', 0);

    expect(w.state('item').action.request.headers).toEqual([{
      name: 'X-Requested-With', value: 'XMLHttpRequest'
    }]);
  });

  it('handles header mutiple changes', () => {
    const w = shallow(<Job {...props} />);
    const f = w.find('JobForm');

    for (let i = 0; i < 8; i++) {
      f.simulate('addHeader');
      f.simulate('headerChange', `Name-${i}`, `Value-${i}`, i);
    }
    for (let i = 6; i > 1; i--) {
      f.simulate('deleteHeader', i);
    }

    expect(w.state('item').action.request.headers).toEqual([
      {name: 'Name-0', value: 'Value-0'},
      {name: 'Name-1', value: 'Value-1'},
      {name: 'Name-7', value: 'Value-7'}
    ]);
  });

  it('saves item', () => {
    props.match.params.id = null;
    api.saveJob.mockImplementation(resolvePromise());
    const w = shallow(<Job {...props} />);

    w.find('JobForm').simulate('save');

    expect(api.saveJob).toBeCalledWith({
      name: '',
      state: 'enabled',
      collectionId: '65ada2f9',
      schedule: '',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: '',
          headers: [],
          body: ''
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m'
        }
      }
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handles save errors', () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.'
    };
    api.saveJob.mockImplementation(rejectPromise(errors));
    const w = shallow(<Job {...props} />);

    w.find('JobForm').simulate('save');

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(w.state('errors')).toEqual(errors);
  });

  it('deletes item', () => {
    api.retrieveJob.mockImplementation(resolvePromise({
      id: '65ada2f9',
      etag: '"2hhaswzbz72p8"',
      action: {request: {headers: []}, retryPolicy: {}}
    }));
    api.deleteJob.mockImplementation(resolvePromise());
    const w = shallow(<Job {...props} />);

    w.find('JobForm').simulate('delete');

    expect(api.deleteJob).toBeCalledWith('65ada2f9', '"2hhaswzbz72p8"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(w.state('errors')).toEqual({});
  });

  it('handles delete errors', () => {
    api.retrieveJob.mockImplementation(resolvePromise({
      id: '65ada2f9',
      etag: '"2hhaswzbz72p8"',
      action: {request: {headers: []}, retryPolicy: {}}
    }));
    const errors = {__ERROR__: 'The error text.'};
    api.deleteJob.mockImplementation(rejectPromise(errors));
    const w = shallow(<Job {...props} />);

    w.find('JobForm').simulate('delete');

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(w.state('errors')).toEqual(errors);
  });
});

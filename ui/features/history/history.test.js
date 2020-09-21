import React from 'react';
import {shallow} from 'enzyme';

import * as api from './history-api';
import JobHistory from './history';

jest.mock('./history-api');


describe('job history', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {id: '65ada2f9'}},
      history: {
        goBack: jest.fn()
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles retrieve job error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(rejectPromise(errors));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<JobHistory {...props} />);

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles retrieve job status error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(rejectPromise(errors));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<JobHistory {...props} />);

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles list job history error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(rejectPromise(errors));

    const w = shallow(<JobHistory {...props} />);

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(w.state('errors')).toEqual(errors);
  });

  it('updates state with fetched items', () => {
    const job = {name: 'My Task'};
    const status = {running: true};
    const items = [];
    api.retrieveJob.mockImplementation(resolvePromise(job));
    api.retrieveJobStatus.mockImplementation(resolvePromise(status));
    api.listJobHistory.mockImplementation(resolvePromise({items}));

    const w = shallow(<JobHistory {...props} />);

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(w.state()).toEqual({
      job,
      status,
      items,
      errors: {}
    });
  });

  it('handles on back', () => {
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    const w = shallow(<JobHistory {...props} />);

    w.find('JobHistoryList').simulate('back');

    expect(props.history.goBack).toBeCalledTimes(1);
  });

  it('handles on run', () => {
    const status = {etag: '"1n9er1hz749r"'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise(status));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.patchJobStatus.mockImplementation(resolvePromise());
    const w = shallow(<JobHistory {...props} />);

    w.find('JobHistoryList').simulate('run');

    expect(api.patchJobStatus).toBeCalledTimes(1);
    expect(api.patchJobStatus).toBeCalledWith(
        '65ada2f9', {running: true, etag: '"1n9er1hz749r"'});
    expect(api.retrieveJobStatus).toBeCalledTimes(2);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
  });

  it('handles on run patch job status error', () => {
    const status = {etag: '"1n9er1hz749r"'};
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise(status));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.patchJobStatus.mockImplementation(rejectPromise(errors));
    const w = shallow(<JobHistory {...props} />);

    w.find('JobHistoryList').simulate('run');

    expect(api.patchJobStatus).toBeCalledTimes(1);
    expect(api.patchJobStatus).toBeCalledWith(
        '65ada2f9', {running: true, etag: '"1n9er1hz749r"'});
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles on run retrieve job status error', () => {
    const status = {etag: '"1n9er1hz749r"'};
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementationOnce(resolvePromise(status));
    api.retrieveJobStatus.mockImplementationOnce(rejectPromise(errors));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.patchJobStatus.mockImplementation(resolvePromise());
    const w = shallow(<JobHistory {...props} />);

    w.find('JobHistoryList').simulate('run');

    expect(api.patchJobStatus).toBeCalledTimes(1);
    expect(api.patchJobStatus).toBeCalledWith(
        '65ada2f9', {running: true, etag: '"1n9er1hz749r"'});
    expect(api.retrieveJobStatus).toBeCalledTimes(2);
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles on delete', () => {
    const status = {etag: '"1n9er1hz749r"'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise(status));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.deleteJobHistory.mockImplementation(resolvePromise());
    const w = shallow(<JobHistory {...props} />);

    w.find('JobHistoryList').simulate('delete');

    expect(api.deleteJobHistory).toBeCalledTimes(1);
    expect(api.deleteJobHistory).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
  });

  it('handles on delete error', () => {
    const status = {etag: '"1n9er1hz749r"'};
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise(status));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.deleteJobHistory.mockImplementation(rejectPromise(errors));
    const w = shallow(<JobHistory {...props} />);

    w.find('JobHistoryList').simulate('delete');

    expect(api.deleteJobHistory).toBeCalledTimes(1);
    expect(api.deleteJobHistory).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(w.state('errors')).toEqual(errors);
  });
});

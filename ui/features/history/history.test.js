import React from 'react';
import {shallow} from 'enzyme';

import * as api from './history-api';
import JobHistory from './history';
import {formatRunning, formatDate} from './history';

jest.mock('./history-api');

describe('job history status', () => {
  it.each([
    [null, ''],
    [undefined, ''],
    [false, 'Scheduled'],
    [true, 'Running']
  ])('format running %o to %o', (running, expected) => {
    expect(formatRunning(running)).toEqual(expected);
  });

  it.each([
    [null, 'N/A'],
    [undefined, 'N/A'],
    ['', 'N/A']
  ])('format date %o to %o', (s, expected) => {
    expect(formatDate(s)).toEqual(expected);
  });
});

it('formats UTC date as local locale', () => {
  expect(
      formatDate('2019-08-29T13:29:36.976Z')
  ).toEqual(
      new Date('2019-08-29T13:29:36Z').toLocaleString()
  );
});

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

  it('renders items', () => {
    api.retrieveJob.mockImplementation(resolvePromise({
      name: 'My Task #1'
    }));
    api.retrieveJobStatus.mockImplementation(resolvePromise({
      running: false,
      runCount: 17,
      errorCount: 5,
      lastRun: '2019-08-29T13:29:36.976Z'
    }));
    api.listJobHistory.mockImplementation(resolvePromise({
      items: [
        {
          action: 'HTTP',
          started: '2019-09-18T06:26:13Z',
          finished: '2019-09-18T06:27:02Z',
          status: 'failed',
          retryCount: 3,
          message: '404 Not Found'
        },
        {
          action: 'HTTP',
          started: '2019-09-18T06:25:56Z',
          finished: '2019-09-18T06:25:56Z',
          status: 'completed'
        }
      ]
    }));

    const p = new Page(shallow(<JobHistory {...props} />));

    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(p.data()).toEqual({
      title: 'Job History My Task #1',
      status: {
        running: 'Scheduled',
        runCount: '17 / 5',
        lastRun: new Date('2019-08-29T13:29:36.976Z').toLocaleString(),
        nextRun: 'N/A'
      },
      items: [
        {
          action: 'HTTP',
          started: new Date('2019-09-18T06:26:13Z').toLocaleString(),
          finished: new Date('2019-09-18T06:27:02Z').toLocaleString(),
          status: 'failed',
          retries: '3',
          message: '404 Not Found'
        },
        {
          action: 'HTTP',
          started: new Date('2019-09-18T06:25:56Z').toLocaleString(),
          finished: new Date('2019-09-18T06:25:56Z').toLocaleString(),
          status: 'completed',
          retries: '',
          message: ''
        }
      ]
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false},
      delete: {}
    });
  });

  describe('render buttons', () => {
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({
      running: true
    }));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<JobHistory match = {{params: {id: '65ada2f9'}}} />);

    expect(w.exists('tbody tr')).toBe(false);

    it('disables run button if already running', () => {
      expect(w.find('Button[variant="outline-secondary"]').props().disabled)
          .toBe(true);
    });

    it('hides delete button if no history items', () => {
      expect(w.exists('Button[variant="danger"]')).toBe(false);
    });
  });

  it('retrieve job fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(rejectPromise(errors));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<JobHistory {...props} />));

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false}
    });
  });

  it('retrieve job status fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(rejectPromise(errors));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<JobHistory {...props} />));

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false}
    });
  });

  it('list job history fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<JobHistory {...props} />));

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false}
    });
  });


  it('handle back', () => {
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<JobHistory {...props} />));
    p.back();

    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handle run', () => {
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({
      etag: '"2hhaswzbz72p8"'
    }));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.patchJobStatus.mockImplementation(resolvePromise());

    const p = new Page(shallow(<JobHistory {...props} />));
    p.run();

    expect(api.patchJobStatus).toBeCalledWith(
        '65ada2f9', {running: true, etag: '"2hhaswzbz72p8"'});
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false}
    });
  });

  it('handle run fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.patchJobStatus.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<JobHistory {...props} />));
    p.run();

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false}
    });
  });

  it('handle run retrieve status fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus
        .mockReturnValueOnce(resolvePromise({})())
        .mockReturnValueOnce(rejectPromise(errors)());
    api.listJobHistory.mockImplementation(resolvePromise({items: []}));
    api.patchJobStatus.mockImplementation(resolvePromise());

    const p = new Page(shallow(<JobHistory {...props} />));
    p.run();

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false}
    });
  });

  it('handle delete', () => {
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({
      etag: '"2hhaswzbz72p8"'
    }));
    api.listJobHistory.mockImplementation(resolvePromise({items: [
      {}
    ]}));
    api.deleteJobHistory.mockImplementation(resolvePromise());

    const p = new Page(shallow(<JobHistory {...props} />));
    p.delete();

    expect(api.deleteJobHistory).toBeCalledWith('65ada2f9', '"2hhaswzbz72p8"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false},
      delete: {}
    });
  });

  it('handle delete fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(resolvePromise({}));
    api.retrieveJobStatus.mockImplementation(resolvePromise({}));
    api.listJobHistory.mockImplementation(resolvePromise({items: [
      {}
    ]}));
    api.deleteJobHistory.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<JobHistory {...props} />));
    p.delete();

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      back: {},
      run: {disabled: false},
      delete: {}
    });
  });
});


class Page {
  constructor(w) {
    this.w = w;
  }

  data() {
    const cols = this.w.find('Col');
    return {
      title: this.w.find('Layout').props().title,
      status: {
        running: cols.at(1).text(),
        runCount: cols.at(3).text(),
        lastRun: cols.at(5).text(),
        nextRun: cols.at(7).text()
      },
      items: this.w.find('tbody tr').map((r) => {
        const c = r.find('td');
        return {
          action: c.at(0).text(),
          started: c.at(1).text(),
          finished: c.at(2).text(),
          status: c.at(3).text(),
          retries: c.at(4).text(),
          message: c.at(5).text()
        };
      })
    };
  }

  errors() {
    const errors = {};
    const c = this.w.find('Layout').dive()
        .find('ErrorSummary').dive().find('h4');
    if (c.exists()) {
      errors.__ERROR__ = c.text();
    }
    return errors;
  }

  controls() {
    const controls = {
      back: {},
      run: {
        disabled: this.w.find('Button[variant="outline-secondary"]')
            .props().disabled
      }
    };
    const b = this.w.find('Button[variant="danger"]');
    if (b.exists()) {
      controls.delete = {};
    }
    return controls;
  }

  back() {
    this.w.find('Button').first().simulate('click');
  }

  run() {
    this.w.find('Button[variant="outline-secondary"]').simulate('click');
  }

  delete() {
    this.w.find('Button[variant="danger"]').simulate('click');
  }
}

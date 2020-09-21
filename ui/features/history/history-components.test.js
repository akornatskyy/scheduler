import React from 'react';
import {shallow} from 'enzyme';

import {JobHistoryList, formatRunning, formatDate} from './history-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

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

describe('job history component', () => {
  const props = {status: {}, items: []};

  it('renders empty list', () => {
    const p = new Page(shallow(
        <JobHistoryList {...props} />
    ));

    expect(p.data()).toEqual({
      status: {
        lastRun: 'N/A',
        nextRun: 'N/A',
        runCount: ' / ',
        running: '',
      },
      items: []
    });
    expect(p.controls()).toEqual({run: {disabled: false}});
  });

  it('renders items', () => {
    const status = {
      running: false,
      runCount: 17,
      errorCount: 5,
      lastRun: '2019-08-29T13:29:36.976Z'
    };
    const items = [
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
    ];

    const p = new Page(shallow(
        <JobHistoryList status={status} items={items} />
    ));

    expect(p.data()).toEqual({
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
    expect(p.controls()).toEqual({run: {disabled: false}, delete: {}});
  });

  it('calls on back callback', () => {
    const handler = jest.fn();

    const p = new Page(shallow(
        <JobHistoryList {...props} onBack={handler} />
    ));
    p.back();

    expect(handler).toBeCalledWith();
  });

  it('calls on run callback', () => {
    const handler = jest.fn();

    const p = new Page(shallow(
        <JobHistoryList {...props} onRun={handler} />
    ));
    p.run();

    expect(handler).toBeCalledWith();
  });

  it('calls on delete callback', () => {
    const handler = jest.fn();

    const p = new Page(shallow(
        <JobHistoryList {...props} items={[{}]} onDelete={handler} />
    ));
    p.delete();

    expect(handler).toBeCalledWith();
  });

  it('handles undefined callbacks', () => {
    const p = new Page(shallow(
        <JobHistoryList {...props} items={[{}]} />
    ));

    p.back();
    p.run();
    p.delete();
  });
});


class Page {
  /**
   * @param {ShallowWrapper} w
   */
  constructor(w) {
    this.w = w;
  }

  data() {
    const cols = this.w.find('Col');
    return {
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

  controls() {
    const controls = {
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

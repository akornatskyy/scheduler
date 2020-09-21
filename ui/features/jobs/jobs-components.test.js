import React from 'react';
import {shallow} from 'enzyme';

import {JobList, JobStatus} from './jobs-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('jobs list component', () => {
  it('renders empty list', () => {
    const collections = [];
    const jobs = [];

    const p = new Page(shallow(
        <JobList collections={collections} jobs={jobs} />
    ));

    expect(p.data()).toEqual({items: []});
  });

  it('renders items', () => {
    const collections = [{
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled'
    }, {
      id: '340de3dd',
      name: 'My App #2',
      state: 'disabled'
    }, {
      id: '4502ad33',
      name: 'My App #3',
      state: 'enabled'
    }
    ];
    const jobs = [{
      id: '7ce1f17e',
      collectionId: '65ada2f9',
      name: 'My Task #1',
      schedule: '@every 15s',
      state: 'disabled',
      status: 'passing',
      errorRate: 0.2
    }, {
      id: '8d9302ad',
      collectionId: '340de3dd',
      name: 'My Task #2',
      schedule: '@every 30m',
      state: 'enabled',
      status: 'failing',
      errorRate: 0.5
    }
    ];

    const p = new Page(shallow(
        <JobList collections={collections} jobs={jobs} />
    ));

    expect(p.data()).toEqual({
      items: [
        {
          to: 'jobs/7ce1f17e',
          name: 'My Task #1',
          schedule: '@every 15s',
          state: 'disabled',
          status: '80% passing'
        },
        {
          to: 'jobs/8d9302ad',
          name: 'My Task #2',
          schedule: '@every 30m',
          state: 'enabled',
          status: '50% failing'
        }
      ]
    });
  });
});

describe('job status component', () => {
  it.each(
      ['disabled', 'enabled']
          .map((state) => ['ready', 'passing', 'failing', 'running']
              .map((status) => [state, status]))
          .flatMap((e) => e)
  )('renders %s and %s', (state, status) => {
    const job = {state, status};

    const w = shallow(<JobStatus job={job} />);

    expect(w.find('span.badge').text())
        .toEqual(expect.stringContaining(status));
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
    return {
      items: this.w.find('tbody tr')
          .filterWhere((r) => r.exists('td ~ td'))
          .map((r) => {
            const link = r.find('Link').first();
            return {
              to: link.props().to,
              name: link.text(),
              schedule: r.find('td ~ td').first().text(),
              state: r.find('td ~ td').first().props().title,
              status: r.find('td ~ td ~ td > JobStatus')
                  .dive().find('span').text()
            };
          }),
    };
  }
}

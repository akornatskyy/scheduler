import React from 'react';
import {shallow} from 'enzyme';

import api from './api';
import Jobs, {JobStatus} from './jobs';

jest.mock('./api');

describe('jobs renders', () => {
  const props = {
    match: {url: '/jobs'},
    location: {}
  };

  it('empty list', () => {
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(api.listJobs).toBeCalledWith(null);
    expect(p.data()).toEqual({
      title: 'Jobs',
      items: []
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/jobs/add'}
    });
  });

  it('does not show summary error when list collections fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(p.errors()).toEqual({});
  });

  it('shows summary error when list jobs fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listJobs.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(p.errors()).toEqual(errors);
  });

  it('items', () => {
    api.listCollections.mockImplementation(resolvePromise({
      items: [{
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled'
      }, {
        id: '340de3dd',
        name: 'My App #2',
        state: 'disabled'
      }]
    }));
    api.listJobs.mockImplementation(resolvePromise({
      items: [{
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
      }]
    }));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(api.listJobs).toBeCalledWith(null);
    expect(p.data()).toEqual({
      title: 'Jobs',
      items: [
        {
          to: '/jobs/7ce1f17e',
          name: 'My Task #1',
          schedule: '@every 15s',
          state: 'disabled',
          status: '80% passing'
        },
        {
          to: '/jobs/8d9302ad',
          name: 'My Task #2',
          schedule: '@every 30m',
          state: 'enabled',
          status: '50% failing'
        }
      ]
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/jobs/add'}
    });
  });

  it('clears timer on unmount', () => {
    jest.useFakeTimers();
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<Jobs {...props} />);
    w.unmount();

    expect(setInterval).toHaveBeenCalled();
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });
});

describe('job status', () => {
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
  constructor(w) {
    this.w = w;
  }

  data() {
    return {
      title: this.w.find('Layout').props().title,
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
    return {
      add: {
        to: this.w.find('Button').props().to
      }
    };
  }
}

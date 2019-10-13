import React from 'react';
import {shallow} from 'enzyme';

import api from './api';
import Jobs from './jobs';

jest.mock('./api');

describe('jobs renders', () => {
  const props = {
    match: {url: '/jobs'},
  };

  it('empty list', () => {
    api.listJobs.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(api.listJobs).toBeCalledWith();
    expect(p.data()).toEqual({
      title: 'Jobs',
      items: []
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/jobs/add'}
    });
  });

  it('summary error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listJobs.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(p.data()).toEqual({
      title: 'Jobs',
      items: []
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      add: {to: '/jobs/add'}
    });
  });

  it('items', () => {
    api.listJobs.mockImplementation(resolvePromise({
      items: [{
        id: '7ce1f17e',
        name: 'My Task #1',
        schedule: '@every 15s',
        state: 'disabled'
      }]
    }));

    const p = new Page(shallow(<Jobs {...props} />));

    expect(api.listJobs).toBeCalledWith();
    expect(p.data()).toEqual({
      title: 'Jobs',
      items: [
        {
          to: '/jobs/7ce1f17e',
          name: 'My Task #1',
          schedule: '@every 15s',
          state: 'disabled'
        }
      ]
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/jobs/add'}
    });
  });
});

class Page {
  constructor(w) {
    this.w = w;
  }

  data() {
    return {
      title: this.w.find('Layout').props().title,
      items: this.w.find('tbody tr').map((r) => {
        const link = r.find('Link');
        return {
          to: link.props().to,
          name: link.text(),
          schedule: r.find('td ~ td').first().text(),
          state: r.find('td ~ td ~ td').text()
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

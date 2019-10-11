import React from 'react';
import {shallow} from 'enzyme';

import api from './api';
import Collections from './collections';

jest.mock('./api');

describe('collections renders', () => {
  const props = {
    match: {url: '/collections'},
  };

  it('empty list', () => {
    api.listCollections.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Collections {...props} />));

    expect(api.listCollections).toBeCalledWith();
    expect(p.data()).toEqual({
      title: 'Collections',
      items: []
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/collections/add'}
    });
  });

  it('summary error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Collections {...props} />));

    expect(p.data()).toEqual({
      title: 'Collections',
      items: []
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      add: {to: '/collections/add'}
    });
  });

  it('items', () => {
    api.listCollections.mockImplementation(resolvePromise({
      items: [{
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled'
      }]
    }));

    const p = new Page(shallow(<Collections {...props} />));

    expect(api.listCollections).toBeCalledWith();
    expect(p.data()).toEqual({
      title: 'Collections',
      items: [
        {
          to: '/collections/65ada2f9',
          name: 'My App #1',
          state: 'enabled'
        }
      ]
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/collections/add'}
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
          state: r.find('td ~ td').text()
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

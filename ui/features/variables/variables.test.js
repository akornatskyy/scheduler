import React from 'react';
import {shallow} from 'enzyme';

import * as api from './variables-api';
import Variables from './variables';

jest.mock('./variables-api');

describe('variables renders', () => {
  const props = {
    match: {url: '/variables'},
    location: {search: '?collectionId=123'}
  };

  it('empty list', () => {
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listVariables.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Variables {...props} />));

    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledWith('123');
    expect(p.data()).toEqual({
      title: 'Variables',
      items: []
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/variables/add'}
    });
  });

  it('does not show summary error when list collections fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));
    api.listVariables.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Variables {...props} />));

    expect(p.errors()).toEqual({});
  });

  it('shows summary error when list variables fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listVariables.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Variables {...props} />));

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
    api.listVariables.mockImplementation(resolvePromise({
      items: [{
        id: 'ce3457aa',
        collectionId: '65ada2f9',
        name: 'My Var #1'
      }, {
        id: '562da233',
        collectionId: '340de3dd',
        name: 'My Var #2'
      }]
    }));

    const p = new Page(shallow(<Variables {...props} />));

    expect(api.listVariables).toBeCalledWith('123');
    expect(p.data()).toEqual({
      title: 'Variables',
      items: [
        {
          to: '/variables/ce3457aa',
          name: 'My Var #1'
        },
        {
          to: '/variables/562da233',
          name: 'My Var #2'
        }
      ]
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      add: {to: '/variables/add'}
    });
  });
});

class Page {
  constructor(w) {
    this.w = w;
    w.debug();
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
              name: link.text()
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

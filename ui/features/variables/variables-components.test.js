import React from 'react';
import {shallow} from 'enzyme';

import {VariableList, GroupRow, ItemRow} from './variables-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('variables list component', () => {
  it('renders empty list', () => {
    const collections = [];
    const variables = [];

    const p = new Page(shallow(
        <VariableList collections={collections} variables={variables} />
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
    }];
    const variables = [{
      id: 'ce3457aa',
      collectionId: '65ada2f9',
      name: 'My Var #1'
    }, {
      id: '562da233',
      collectionId: '340de3dd',
      name: 'My Var #2'
    }];

    const p = new Page(shallow(
        <VariableList collections={collections} variables={variables} />
    ));

    expect(p.data()).toEqual({
      items: [
        {
          to: 'variables/ce3457aa',
          name: 'My Var #1'
        },
        {
          to: 'variables/562da233',
          name: 'My Var #2'
        }
      ]
    });
  });
});

describe('variables group row component', () => {
  it('renders collection name', () => {
    const c = {name: 'My App #1'};

    const w = shallow(<GroupRow collection={c} />);

    expect(w.find('Link').first().text()).toEqual('My App #1');
  });
});

describe('variables item row component', () => {
  it('renders variable name', () => {
    const v = {name: 'My Var'};

    const w = shallow(<ItemRow variable={v} />);

    expect(w.find('Link').text()).toEqual('My Var');
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
      items: this.w.find('GroupByList').dive().find('ItemRow').map((r) => {
        const link = r.dive().find('Link').first();
        return {
          to: link.props().to,
          name: link.text()
        };
      }),
    };
  }
}

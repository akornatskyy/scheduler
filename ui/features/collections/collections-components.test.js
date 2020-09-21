import React from 'react';
import {shallow} from 'enzyme';

import {CollectionList} from './collections-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('collections list component ', () => {
  it('renders empty list', () => {
    const items = [];

    const p = new Page(shallow(<CollectionList items={items} />));

    expect(p.data()).toEqual({items});
  });

  it('renders items', () => {
    const items = [{
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled'
    }];

    const p = new Page(shallow(<CollectionList items={items} />));

    expect(p.data()).toEqual({
      items: [
        {
          to: 'collections/65ada2f9',
          name: 'My App #1',
          state: 'enabled'
        }
      ]
    });
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
      items: this.w.find('tbody tr').map((r) => {
        const link = r.find('Link').first();
        return {
          to: link.props().to,
          name: link.text(),
          state: r.find('td ~ td').text()
        };
      }),
    };
  }
}

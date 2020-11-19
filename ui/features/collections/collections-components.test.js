import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen} from '@testing-library/react';

import {CollectionList} from './collections-components';

describe('collections list component ', () => {
  it('renders empty list', () => {
    const items = [];

    const {container} = render(<CollectionList items={items} />);

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const items = [{
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled'
    }];

    render(<Router><CollectionList items={items} /></Router>);

    expect(screen.getByText('My App #1')).toBeVisible();
    expect(screen.getByText('enabled')).toBeVisible();
  });
});

import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import type {CollectionItem} from '../types';
import {CollectionTable} from './CollectionTable';

describe('CollectionTable', () => {
  it('renders empty list', () => {
    const items: CollectionItem[] = [];

    const {container} = render(<CollectionTable items={items} />);

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const items: CollectionItem[] = [
      {
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      },
    ];

    render(
      <Router>
        <CollectionTable items={items} />
      </Router>,
    );

    expect(screen.getByText('My App #1')).toBeVisible();
    expect(screen.getByText('enabled')).toBeVisible();
  });
});

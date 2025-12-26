import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useCollections} from '../hooks/useCollections';
import {CollectionsPage} from './CollectionsPage';

jest.mock('../hooks/useCollections');

describe('collections page', () => {
  const base: ReturnType<typeof useCollections> = {
    items: [],
    errors: undefined,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCollections).mockReturnValue(base);
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useCollections).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'Unexpected'},
    });

    render(
      <Router>
        <CollectionsPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('renders items from hook', () => {
    jest.mocked(useCollections).mockReturnValue({
      ...base,
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    render(
      <Router>
        <CollectionsPage />
      </Router>,
    );

    expect(screen.getByText('My App #1')).toBeVisible();
  });

  it('renders add link', () => {
    render(
      <Router>
        <CollectionsPage />
      </Router>,
    );

    expect(screen.getByRole('link', {name: 'Add'})).toHaveAttribute(
      'href',
      '/collections/add',
    );
  });
});

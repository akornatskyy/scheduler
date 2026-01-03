import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useVariables} from '../hooks/useVariables';
import {VariablesPage} from './VariablesPage';

jest.mock('../hooks/useVariables');

describe('VariablesPage', () => {
  const base: ReturnType<typeof useVariables> = {
    collections: [],
    variables: [],
    errors: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useVariables).mockReturnValue(base);
  });

  it('passes collectionId query param into hook', () => {
    render(
      <Router initialEntries={['/variables?collectionId=65ada2f9']}>
        <VariablesPage />
      </Router>,
    );

    expect(useVariables).toHaveBeenCalledTimes(1);
    expect(useVariables).toHaveBeenCalledWith('65ada2f9');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useVariables).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'unexpected'},
    });

    render(
      <Router>
        <VariablesPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /unexpected/})).toBeVisible();
  });

  it('renders items from hook', () => {
    jest.mocked(useVariables).mockReturnValue({
      ...base,
      collections: [{id: '65ada2f9', name: 'My App', state: 'enabled'}],
      variables: [
        {
          id: 'c23abe44',
          collectionId: '65ada2f9',
          name: 'My Var',
          updated: '2025-12-30T07:38:17.830',
        },
      ],
    });

    render(
      <Router>
        <VariablesPage />
      </Router>,
    );

    expect(screen.getByText('My App')).toBeVisible();
    expect(screen.getByText('My Var')).toBeVisible();
  });

  it('renders add link', () => {
    render(
      <Router>
        <VariablesPage />
      </Router>,
    );

    expect(screen.getByRole('link', {name: 'Add'})).toHaveAttribute(
      'href',
      '/variables/add',
    );
  });
});

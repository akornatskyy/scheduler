import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useVariable} from '../hooks/useVariable';
import {VariablePage} from './VariablePage';

jest.mock('../hooks/useVariable');

const mockUseParams = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useParams: () => mockUseParams()};
});

describe('variable page', () => {
  const base: ReturnType<typeof useVariable> = {
    collections: [],
    item: {name: '', collectionId: '', value: ''},
    pending: false,
    errors: {},
    mutate: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    jest.mocked(useVariable).mockReturnValue(base);
  });

  it('passes id from route params into hook', () => {
    mockUseParams.mockReturnValue({id: '123de331'});

    render(
      <Router>
        <VariablePage />
      </Router>,
    );

    expect(useVariable).toHaveBeenCalledTimes(1);
    expect(useVariable).toHaveBeenCalledWith('123de331');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useVariable).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'Unexpected'},
    });

    render(
      <Router>
        <VariablePage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('renders title from item name', () => {
    jest.mocked(useVariable).mockReturnValue({
      ...base,
      item: {name: 'My Var #1', collectionId: '65ada2f9', value: ''},
    });

    render(
      <Router>
        <VariablePage />
      </Router>,
    );

    expect(
      screen.getByRole('heading', {name: 'Variable My Var #1'}),
    ).toBeVisible();
  });
});

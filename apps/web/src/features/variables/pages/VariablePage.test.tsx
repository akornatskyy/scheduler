import {useSignal} from '$shared/hooks';
import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router, useParams} from 'react-router';
import {useVariable} from '../hooks/useVariable';
import {VariablePage} from './VariablePage';

jest.mock('../hooks/useVariable');

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useParams: jest.fn()};
});

jest.mock('$shared/hooks', () => ({
  useSignal: jest.fn(),
}));

describe('VariablePage', () => {
  const base: ReturnType<typeof useVariable> = {
    collections: [],
    item: {name: '', collectionId: '', value: ''},
    errors: {},
    mutate: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useParams).mockReturnValue({});
    jest.mocked(useSignal).mockReturnValue(false);
    jest.mocked(useVariable).mockReturnValue(base);
  });

  it('passes id from route params into hook', () => {
    jest.mocked(useParams).mockReturnValue({id: '123de331'});

    render(
      <Router>
        <VariablePage />
      </Router>,
    );

    expect(useVariable).toHaveBeenCalledTimes(1);
    expect(useVariable).toHaveBeenCalledWith('123de331');
    expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
    expect(screen.getByRole('button', {name: 'Delete'})).toBeVisible();
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useVariable).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'unexpected'},
    });

    render(
      <Router>
        <VariablePage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /unexpected/})).toBeVisible();
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

  it('passes pending state to form', () => {
    jest.mocked(useSignal).mockReturnValue(true);

    render(
      <Router>
        <VariablePage />
      </Router>,
    );

    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
  });
});

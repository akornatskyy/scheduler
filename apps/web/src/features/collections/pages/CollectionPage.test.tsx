import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {useCollection} from '../hooks/useCollection';
import {CollectionPage} from './CollectionPage';

jest.mock('../hooks/useCollection');

const mockUseParams = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useParams: () => mockUseParams()};
});

describe('CollectionPage', () => {
  const base: ReturnType<typeof useCollection> = {
    item: {name: '', state: 'enabled'},
    pending: false,
    errors: {},
    mutate: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    jest.mocked(useCollection).mockReturnValue(base);
  });

  it('passes id from route params into hook', () => {
    mockUseParams.mockReturnValue({id: '65ada2f9'});

    render(
      <Router>
        <CollectionPage />
      </Router>,
    );

    expect(useCollection).toHaveBeenCalledTimes(1);
    expect(useCollection).toHaveBeenCalledWith('65ada2f9');
  });

  it('wires hook errors into layout', () => {
    jest.mocked(useCollection).mockReturnValue({
      ...base,
      errors: {__ERROR__: 'unexpected'},
    });

    render(
      <Router initialEntries={['/collections/65ada2f9']}>
        <CollectionPage />
      </Router>,
    );

    expect(screen.getByRole('heading', {name: /unexpected/})).toBeVisible();
  });

  it('renders title from item name', () => {
    jest.mocked(useCollection).mockReturnValue({
      ...base,
      item: {name: 'My App #1', state: 'enabled'},
    });

    render(
      <Router initialEntries={['/collections/add']}>
        <CollectionPage />
      </Router>,
    );

    expect(
      screen.getByRole('heading', {name: 'Collection My App #1'}),
    ).toBeVisible();
  });
});

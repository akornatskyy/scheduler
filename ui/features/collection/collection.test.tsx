import {act, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router-dom';

import CollectionContainer from './collection';
import * as api from './collection-api';

jest.mock('./collection-api');

describe('collection', () => {
  type Props = ConstructorParameters<typeof CollectionContainer>[0];
  let props: Props;

  beforeEach(() => {
    props = {
      match: {params: {}},
      history: {
        goBack: jest.fn(),
      },
    } as unknown as Props;
    jest.clearAllMocks();
  });

  it('renders add item if no id specified', () => {
    render(<CollectionContainer {...props} />);

    expect(api.retrieveCollection).toHaveBeenCalledTimes(0);
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      state: 'enabled',
    });
  });

  it('renders edit item', async () => {
    props.match.params.id = '65ada2f9';
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      name: 'My Other App',
      state: 'disabled',
    });

    await act(async () => {
      render(<CollectionContainer {...props} />);
    });

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other App',
      state: 'disabled',
    });
  });

  it('handles retrieve error', async () => {
    props.match.params.id = '65ada2f9';
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveCollection).mockRejectedValue(errors);

    await act(async () => {
      render(<CollectionContainer {...props} />);
    });

    expect(api.retrieveCollection).toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles change', () => {
    render(<CollectionContainer {...props} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other App',
      },
    });
    fireEvent.click(screen.getByLabelText('Disabled'));

    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other App',
      state: 'disabled',
    });
  });

  it('saves item', async () => {
    jest.mocked(api.saveCollection).mockResolvedValue();
    await act(async () => {
      render(<CollectionContainer {...props} />);
    });

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(api.saveCollection).toHaveBeenCalledWith({
      name: '',
      state: 'enabled',
    });
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest.mocked(api.saveCollection).mockRejectedValue(errors);
    await act(async () => {
      render(<CollectionContainer {...props} />);
    });

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(props.history.goBack).not.toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
    expect(screen.getByText(errors.name)).toBeVisible();
  });

  it('deletes item', async () => {
    props.match.params.id = '65ada2f9';
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: '',
      state: 'enabled',
      etag: '"1n9er1hz749r"',
    });
    jest.mocked(api.deleteCollection).mockResolvedValue();
    const {container} = await act(async () =>
      render(
        <Router>
          <CollectionContainer {...props} />
        </Router>,
      ),
    );
    expect(api.retrieveCollection).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('handles delete error', async () => {
    props.match.params.id = '65ada2f9';
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: '',
      state: 'disabled',
      etag: '"1n9er1hz749r"',
    });
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.deleteCollection).mockRejectedValue(errors);
    const {container} = await act(async () =>
      render(
        <Router>
          <CollectionContainer {...props} />
        </Router>,
      ),
    );
    expect(api.retrieveCollection).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(props.history.goBack).not.toHaveBeenCalled();
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });
});

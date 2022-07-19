import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';

import Collection from './collection';
import * as api from './collection-api';

jest.mock('./collection-api');

describe('collection', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {}},
      history: {
        goBack: jest.fn(),
      },
    };
    jest.clearAllMocks();
  });

  it('renders add item if no id specified', () => {
    render(<Collection {...props} />);

    expect(api.retrieveCollection).toBeCalledTimes(0);
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      state: 'enabled',
    });
  });

  it('renders edit item', async () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockResolvedValue({
      name: 'My Other App',
      state: 'disabled',
    });

    await act(async () => {
      render(<Collection {...props} />);
    });

    expect(api.retrieveCollection).toBeCalledWith('65ada2f9');
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other App',
      state: 'disabled',
    });
  });

  it('handles retrieve error', async () => {
    props.match.params.id = '65ada2f9';
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveCollection.mockRejectedValue(errors);

    await act(async () => {
      render(<Collection {...props} />);
    });

    expect(api.retrieveCollection).toBeCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles change', () => {
    render(<Collection {...props} />);

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
    api.saveCollection.mockResolvedValue();
    await act(async () => {
      render(<Collection {...props} />);
    });

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toBeCalledTimes(1);
    expect(api.saveCollection).toBeCalledWith({
      name: '',
      state: 'enabled',
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    api.saveCollection.mockRejectedValue(errors);
    await act(async () => {
      render(<Collection {...props} />);
    });

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toBeCalledTimes(1);
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
    expect(screen.getByText(errors.name)).toBeVisible();
  });

  it('deletes item', async () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockResolvedValue({
      id: '65ada2f9',
      name: '',
      etag: '"1n9er1hz749r"',
    });
    api.deleteCollection.mockResolvedValue();
    const {container} = await act(async () =>
      render(
          <Router>
            <Collection {...props} />
          </Router>,
      ),
    );
    expect(api.retrieveCollection).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('handles delete error', async () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockResolvedValue({
      id: '65ada2f9',
      name: '',
      etag: '"1n9er1hz749r"',
    });
    const errors = {__ERROR__: 'The error text.'};
    api.deleteCollection.mockRejectedValue(errors);
    const {container} = await act(async () =>
      render(
          <Router>
            <Collection {...props} />
          </Router>,
      ),
    );
    expect(api.retrieveCollection).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });
});

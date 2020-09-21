import React from 'react';
import {shallow} from 'enzyme';

import * as api from './collection-api';
import Collection from './collection';

jest.mock('./collection-api');

describe('collection', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {}},
      history: {
        goBack: jest.fn()
      }
    };
    jest.clearAllMocks();
  });

  it('renders add item if no id specified', () => {
    const w = shallow(<Collection {...props} />);

    expect(api.retrieveCollection).toBeCalledTimes(0);
    expect(w.state()).toEqual({
      item: {name: '', state: 'enabled'},
      pending: false,
      errors: {},
    });
  });

  it('renders edit item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockImplementation(resolvePromise({
      name: 'My Other App',
      state: 'disabled'
    }));

    const w = shallow(<Collection {...props} />);

    expect(api.retrieveCollection).toBeCalledWith('65ada2f9');
    expect(w.state()).toEqual({
      item: {name: 'My Other App', state: 'disabled'},
      pending: false,
      errors: {},
    });
  });

  it('handles retrieve error', () => {
    props.match.params.id = '65ada2f9';
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveCollection.mockImplementation(rejectPromise(errors));

    const w = shallow(<Collection {...props} />);

    expect(w.state('errors')).toEqual(errors);
  });

  it('handles change', () => {
    const w = shallow(<Collection {...props} />);
    const f = w.find('CollectionForm');

    f.simulate('change', 'name', 'My Other App');
    f.simulate('change', 'state', 'disabled');

    expect(w.state('item')).toEqual({
      name: 'My Other App',
      state: 'disabled'
    });
  });

  it('saves item', () => {
    api.saveCollection.mockImplementation(resolvePromise());
    const w = shallow(<Collection {...props} />);

    w.find('CollectionForm').simulate('save');

    expect(api.saveCollection).toBeCalledWith({name: '', state: 'enabled'});
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(w.state('errors')).toEqual({});
  });

  it('handles save errors', () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.'
    };
    api.saveCollection.mockImplementation(rejectPromise(errors));
    const w = shallow(<Collection {...props} />);

    w.find('CollectionForm').simulate('save');

    expect(api.saveCollection).toBeCalledTimes(1);
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(w.state('errors')).toEqual(errors);
  });

  it('deletes item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockImplementation(resolvePromise({
      id: '65ada2f9',
      etag: '"1n9er1hz749r"'
    }));
    api.deleteCollection.mockImplementation(resolvePromise());
    const w = shallow(<Collection {...props} />);

    w.find('CollectionForm').simulate('delete');

    expect(api.deleteCollection).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(w.state('errors')).toEqual({});
  });

  it('handles delete error', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockImplementation(resolvePromise({
      id: '65ada2f9',
      etag: '"1n9er1hz749r"'
    }));
    const errors = {__ERROR__: 'The error text.'};
    api.deleteCollection.mockImplementation(rejectPromise(errors));
    const w = shallow(<Collection {...props} />);

    w.find('CollectionForm').simulate('delete');

    expect(api.deleteCollection).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(w.state('errors')).toEqual(errors);
  });
});

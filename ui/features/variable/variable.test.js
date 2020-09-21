import React from 'react';
import {shallow} from 'enzyme';

import * as api from './variable-api';
import Variable from './variable';

jest.mock('./variable-api');

describe('variable', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {id: '123de331'}},
      history: {
        goBack: jest.fn()
      }
    };
    api.listCollections.mockImplementation(resolvePromise({items: [
      {
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled'
      }
    ]}));
    jest.clearAllMocks();
  });

  it('renders add item if no id specified', () => {
    props.match.params.id = null;
    const w = shallow(<Variable {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(w.state()).toEqual({
      item: {
        collectionId: '65ada2f9',
        name: '',
        value: ''
      },
      collections: [{
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      }],
      pending: false,
      errors: {}
    });
  });

  it('renders edit item', () => {
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '123de331',
      name: 'My Var #1',
      value: 'Some Value'
    }));

    const w = shallow(<Variable {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.retrieveVariable).toBeCalledTimes(1);
    expect(api.retrieveVariable).toBeCalledWith('123de331');
    expect(w.state()).toEqual({
      item: {
        collectionId: '65ada2f9',
        id: '123de331',
        name: 'My Var #1',
        value: 'Some Value'
      },
      collections: [{
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      }],
      pending: false,
      errors: {}
    });
  });

  it('shows field error when collections list is empty', () => {
    api.listCollections.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<Variable {...props} />);

    expect(w.state('pending')).toEqual(false);
    expect(w.state('errors')).toEqual({
      collectionId: 'There is no collection available.'
    });
  });

  it('selects a first item from collections list', () => {
    props.match.params.id = null;
    api.listCollections.mockImplementation(resolvePromise({items: [
      {
        id: '84432333',
        name: 'My App',
        state: 'enabled'
      },
      {
        id: '65ada2f9',
        name: 'My Other App',
        state: 'enabled'
      }
    ]}));

    const w = shallow(<Variable {...props} />);

    expect(w.state('item')).toEqual({
      collectionId: '84432333',
      name: '',
      value: ''
    });
  });

  it('selects collection list', () => {
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value'
    }));
    api.listCollections.mockImplementation(resolvePromise({items: [
      {
        id: '84432333',
        name: 'My App',
        state: 'enabled'
      },
      {
        id: '65ada2f9',
        name: 'My Other App',
        state: 'enabled'
      }
    ]}));

    const w = shallow(<Variable {...props} />);

    expect(w.state('item')).toEqual({
      collectionId: '65ada2f9',
      id: '123de331',
      name: 'My Var #1',
      value: 'Some Value'
    });
  });

  it('shows summary error when list collections fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));

    const w = shallow(<Variable {...props} />);

    expect(w.state('errors')).toEqual(errors);
  });

  it('retrieve error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveVariable.mockImplementation(rejectPromise(errors));

    const w = shallow(<Variable {...props} />);

    expect(w.state('errors')).toEqual(errors);
  });

  it('handles change', () => {
    const w = shallow(<Variable {...props} />);
    const f = w.find('VariableForm');

    f.simulate('change', 'collectionId', '123de331');
    f.simulate('change', 'name', 'My Other Var');
    f.simulate('change', 'value', 'Hello');

    expect(w.state('item')).toEqual({
      collectionId: '123de331',
      name: 'My Other Var',
      value: 'Hello'
    });
  });

  it('saves item', () => {
    props.match.params.id = null;
    api.saveVariable.mockImplementation(resolvePromise());
    const w = shallow(<Variable {...props} />);

    w.find('VariableForm').simulate('save');

    expect(api.saveVariable).toBeCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(w.state('errors')).toEqual({});
  });

  it('handles save errors', () => {
    props.match.params.id = null;
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.'
    };
    api.saveVariable.mockImplementation(rejectPromise(errors));
    const w = shallow(<Variable {...props} />);

    w.find('VariableForm').simulate('save');

    expect(api.saveVariable).toBeCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(w.state('errors')).toEqual(errors);
  });

  it('deletes item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      etag: '"1n9er1hz749r"'
    }));
    api.deleteVariable.mockImplementation(resolvePromise());
    const w = shallow(<Variable {...props} />);

    w.find('VariableForm').simulate('delete');

    expect(api.deleteVariable).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(w.state('errors')).toEqual({});
  });

  it('handles delete error', () => {
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '123de331',
      name: 'My Var #1',
      value: 'Some Value',
    }));
    const errors = {__ERROR__: 'The error text.'};
    api.deleteVariable.mockImplementation(rejectPromise(errors));
    const w = shallow(<Variable {...props} />);

    w.find('VariableForm').simulate('delete');

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(w.state('errors')).toEqual(errors);
  });
});

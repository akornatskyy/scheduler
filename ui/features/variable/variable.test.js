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
  });

  it('renders add item', () => {
    props.match.params.id = null;
    const p = new Page(shallow(<Variable {...props} />));

    expect(p.data()).toEqual({
      title: 'Variable ',
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('renders edit item', () => {
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '123de331',
      name: 'My Var #1',
      value: 'Some Value'
    }));

    const p = new Page(shallow(<Variable {...props} />));

    expect(api.retrieveVariable).toBeCalledWith('123de331');
    expect(p.data()).toEqual({
      title: 'Variable My Var #1',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value'
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toMatchObject({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('shows field error when collections list is empty', () => {
    api.listCollections.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Variable {...props} />));

    expect(p.errors()).toEqual({
      collectionId: 'There is no collection available.'
    });
  });

  it('selects a first items from collections list', () => {
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

    const p = new Page(shallow(<Variable {...props} />));

    expect(p.errors()).toEqual({});
    expect(p.data()).toEqual({
      title: 'Variable ',
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

    const p = new Page(shallow(<Variable {...props} />));

    expect(p.errors()).toEqual({});
    expect(p.data()).toEqual({
      title: 'Variable My Var #1',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value'
    });
  });

  it('shows summary error when list collections fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Variable {...props} />));

    expect(p.errors()).toEqual(errors);
  });

  it('retrieve error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveVariable.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Variable {...props} />));

    expect(p.data()).toEqual({
      title: 'Variable ',
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toMatchObject({
      save: {disabled: false}
    });
  });

  it('handle change', () => {
    const w = shallow(<Variable {...props} />);
    w.find('FormControl[name="name"]').simulate('change', {
      target: {
        name: 'name',
        value: 'My Other Var'
      }
    });
    w.find('FormControl[name="value"]').simulate('change', {
      target: {
        name: 'value',
        value: 'Hello'
      }
    });

    expect(w.state('item')).toEqual({
      collectionId: '65ada2f9',
      name: 'My Other Var',
      value: 'Hello'
    });
  });

  it('save item', () => {
    props.match.params.id = null;
    api.saveVariable.mockImplementation(resolvePromise());

    const p = new Page(shallow(<Variable {...props} />));
    p.save();

    expect(api.saveVariable).toBeCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.data()).toEqual({
      title: 'Variable ',
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toMatchObject({
      save: {disabled: true}
    });
  });

  it('save returns errors', () => {
    props.match.params.id = null;
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.'
    };
    api.saveVariable.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Variable {...props} />));
    p.save();

    expect(api.saveVariable).toBeCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.data()).toEqual({
      title: 'Variable ',
      collectionId: '65ada2f9',
      name: '',
      value: ''
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('delete item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      etag: '"1n9er1hz749r"'
    }));
    api.deleteVariable.mockImplementation(resolvePromise());

    const p = new Page(shallow(<Variable {...props} />));
    p.delete();

    expect(api.deleteVariable).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.data()).toEqual({
      title: 'Variable My Var #1',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value'
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: true},
      delete: {disabled: true}
    });
  });

  it('delete returns an error', () => {
    api.retrieveVariable.mockImplementation(resolvePromise({
      id: '123de331',
      name: 'My Var #1',
      value: 'Some Value',
    }));
    const errors = {__ERROR__: 'The error text.'};
    api.deleteVariable.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Variable {...props} />));
    p.delete();

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.data()).toEqual({
      title: 'Variable My Var #1',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('renders no errors', () => {
    const p = new Page(shallow(<Variable {...props} />));

    expect(p.errors()).toEqual({});
  });

  it('renders all errors', () => {
    const w = shallow(<Variable {...props} />);
    const p = new Page(w);

    const errors = {
      __ERROR__: 'The summary error text.',
      collectionId: 'An error related to collection id.',
      name: 'An error related to name.',
      value: 'An error related to value.'
    };
    w.setState({errors: errors});

    expect(p.errors()).toEqual(errors);
  });
});

class Page {
  fields = ['name', 'collectionId', 'value'];

  constructor(w) {
    this.w = w;
  }

  data() {
    return {
      title: this.w.find('Layout').props().title,
      collectionId: this.w.find(
          'FormControl[name="collectionId"]'
      ).props().value,
      name: this.w.find('FormControl[name="name"]').props().value,
      value: this.w.find('FormControl[name="value"]').props().value,
    };
  }

  errors() {
    const errors = {};
    const c = this.w.find('Layout').dive()
        .find('ErrorSummary').dive().find('h4');
    if (c.exists()) {
      errors.__ERROR__ = c.text();
    }
    this.w.find('FieldError').forEach((n, i) => {
      const m = n.props().message;
      if (m) {
        errors[this.fields[i]] = m;
      }
    });
    return errors;
  }

  controls() {
    const controls = {
      save: {
        disabled: this.w.find('Button[type="submit"]').props().disabled
      }
    };
    const b = this.w.find('Button[variant="danger"]');
    if (b.exists()) {
      controls.delete = {
        disabled: b.props().disabled
      };
    }
    return controls;
  }

  save() {
    this.w.find('Form').simulate('submit', {preventDefault: () => {}});
  }

  delete() {
    this.w.find('Button[variant="danger"]').simulate('click');
  }
}

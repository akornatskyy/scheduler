import React from 'react';
import {shallow} from 'enzyme';

import api from '../../api';
import Collection from './collection';

jest.mock('../../api');

describe('collection', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {}},
      history: {
        goBack: jest.fn()
      }
    };
  });

  it('renders add item', () => {
    const p = new Page(shallow(<Collection {...props} />));

    expect(p.data()).toEqual({
      title: 'Collection ',
      name: '',
      state: 'enabled'
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('renders edit item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockImplementation(resolvePromise({
      id: '65ada2f9',
      name: 'My Other App',
      state: 'disabled'
    }));

    const p = new Page(shallow(<Collection {...props} />));

    expect(api.retrieveCollection).toBeCalledWith('65ada2f9');
    expect(p.data()).toEqual({
      title: 'Collection My Other App',
      name: 'My Other App',
      state: 'disabled'
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toMatchObject({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('retrieve error', () => {
    props.match.params.id = '65ada2f9';
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveCollection.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Collection {...props} />));

    expect(p.data()).toEqual({
      title: 'Collection ',
      name: '',
      state: ''
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toMatchObject({
      save: {disabled: false}
    });
  });

  it('handle change', () => {
    const w = shallow(<Collection {...props} />);
    w.find('FormControl[name="name"]').simulate('change', {
      target: {
        name: 'name',
        value: 'My Other App'
      }
    });
    w.find('#stateDisabled').simulate('change', {
      target: {
        name: 'state',
        value: 'disabled'
      }
    });

    expect(w.state('item')).toEqual({
      name: 'My Other App',
      state: 'disabled'
    });
  });

  it('save item', () => {
    api.saveCollection.mockImplementation(resolvePromise());

    const p = new Page(shallow(<Collection {...props} />));
    p.save();

    expect(api.saveCollection).toBeCalledWith({name: '', state: 'enabled'});
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.data()).toEqual({
      title: 'Collection ',
      name: '',
      state: 'enabled'
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toMatchObject({
      save: {disabled: true}
    });
  });

  it('save returns errors', () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.'
    };
    api.saveCollection.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Collection {...props} />));
    p.save();

    expect(api.saveCollection).toBeCalledWith({name: '', state: 'enabled'});
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.data()).toEqual({
      title: 'Collection ',
      name: '',
      state: 'enabled'
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('delete item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockImplementation(resolvePromise({
      id: '65ada2f9',
      name: 'My App #1',
      etag: '"1n9er1hz749r"'
    }));
    api.deleteCollection.mockImplementation(resolvePromise());

    const p = new Page(shallow(<Collection {...props} />));
    p.delete();

    expect(api.deleteCollection).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.data()).toEqual({
      title: 'Collection My App #1',
      name: 'My App #1',
      state: ''
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: true},
      delete: {disabled: true}
    });
  });

  it('delete returns an error', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveCollection.mockImplementation(resolvePromise({
      id: '65ada2f9',
      name: 'My App #1'
    }));
    const errors = {__ERROR__: 'The error text.'};
    api.deleteCollection.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Collection {...props} />));
    p.delete();

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.data()).toEqual({
      title: 'Collection My App #1',
      name: 'My App #1',
      state: ''
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('renders no errors', () => {
    const p = new Page(shallow(<Collection {...props} />));

    expect(p.errors()).toEqual({});
  });

  it('renders all errors', () => {
    const w = shallow(<Collection {...props} />);
    const p = new Page(w);

    const errors = {
      __ERROR__: 'The summary error text.',
      name: 'An error related to name.',
      state: 'An error related to state.'
    };
    w.setState({errors: errors});

    expect(p.errors()).toEqual(errors);
  });
});

class Page {
  fields = ['name', 'state'];

  constructor(w) {
    this.w = w;
  }

  data() {
    return {
      title: this.w.find('Layout').props().title,
      name: this.w.find('FormControl[name="name"]').props().value,
      state: this.w.find('#stateEnabled').props().checked ? 'enabled' :
             this.w.find('#stateDisabled').props().checked ? 'disabled' : ''
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

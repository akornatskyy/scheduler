import React from 'react';
import {shallow} from 'enzyme';

import {VariableForm} from './variable-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('variable', () => {
  let props = null;

  beforeEach(() => {
    props = {
      item: {
        collectionId: '65ada2f9',
        name: 'My Var #1',
        value: 'Some Value'
      },
      collections: [{id: '65ada2f9', name: 'My App #1'}],
      pending: false,
      errors: {}
    };
  });

  it('renders add item', () => {
    const p = new Page(shallow(<VariableForm {...props} />));

    expect(p.data()).toEqual({
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value'
    });
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('renders edit item', () => {
    const p = new Page(shallow(
        <VariableForm {...props} item={{...props.item, id: '123de331'}} />
    ));

    expect(p.data()).toEqual({
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value'
    });
    expect(p.controls()).toEqual({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('calls on change callback', () => {
    const handler = jest.fn();
    const p = new Page(shallow(
        <VariableForm {...props} onChange={handler} />
    ));

    p.change({
      collectionId: 'de1044cc',
      name: 'My Other Var',
      value: 'Hello'
    });

    expect(handler).toBeCalledTimes(3);
    expect(handler).nthCalledWith(1, 'collectionId', 'de1044cc');
    expect(handler).nthCalledWith(2, 'name', 'My Other Var');
    expect(handler).nthCalledWith(3, 'value', 'Hello');
  });

  it('calls on save callback', () => {
    const handler = jest.fn();

    const p = new Page(shallow(
        <VariableForm {...props} onSave={handler} />
    ));
    p.save();

    expect(handler).toBeCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.fn();

    const p = new Page(shallow(
        <VariableForm {...props} onDelete={handler} />
    ));
    p.delete();

    expect(handler).toBeCalledWith();
  });

  it('handles undefined callbacks', () => {
    props.item.id = '65ada2f9';

    const p = new Page(shallow(<VariableForm {...props} />));

    p.change({name: ''});
    p.save();
    p.delete();
  });

  it('renders no errors', () => {
    const p = new Page(shallow(<VariableForm {...props} />));

    expect(p.errors()).toEqual({});
  });

  it('renders all errors', () => {
    const errors = {
      collectionId: 'An error related to collection id.',
      name: 'An error related to name.',
      value: 'An error related to value.'
    };

    const p = new Page(shallow(<VariableForm {...props} errors={errors} />));

    expect(p.errors()).toEqual(errors);
  });
});

class Page {
  fields = ['name', 'collectionId', 'value'];
  selectors = {
    collectionId: 'FormControl[name="collectionId"]',
    name: 'FormControl[name="name"]',
    value: 'FormControl[name="value"]',
    save: 'Button[type="submit"]',
    delete: 'Button[variant="danger"]'
  };

  /**
   * @param {ShallowWrapper} w
   */
  constructor(w) {
    this.w = w;
  }

  data() {
    return {
      collectionId: this.w.find(
          'FormControl[name="collectionId"]'
      ).props().value,
      name: this.w.find('FormControl[name="name"]').props().value,
      value: this.w.find('FormControl[name="value"]').props().value,
    };
  }

  change(item) {
    this.changeControl(
        this.selectors.collectionId, 'collectionId', item.collectionId);
    this.changeControl(this.selectors.name, 'name', item.name);
    this.changeControl(this.selectors.value, 'value', item.value);
  }

  changeControl(selector, name, value) {
    if (value === undefined) {
      return;
    }
    this.w.find(selector).simulate('change', {
      target: {
        name,
        value
      }
    });
  }

  errors() {
    const errors = {};
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

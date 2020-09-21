import React from 'react';
import {shallow} from 'enzyme';

import {CollectionForm} from './collection-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('collection form component', () => {
  let props = null;

  beforeEach(() => {
    props = {
      item: {
        name: 'My App',
        state: 'disabled'
      },
      pending: false,
      errors: {}
    };
  });

  it('renders add item', () => {
    const p = new Page(shallow(<CollectionForm {...props} />));

    expect(p.data()).toEqual(props.item);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('renders edit item', () => {
    const p = new Page(shallow(
        <CollectionForm {...props} item={{...props.item, id: '65ada2f9'}} />
    ));

    expect(p.data()).toEqual(props.item);
    expect(p.controls()).toMatchObject({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('calls on change callback', () => {
    const onChange = jest.fn();
    const p = new Page(shallow(
        <CollectionForm {...props} onChange={onChange} />
    ));

    p.change({name: 'My Other App', state: 'disabled'});

    expect(onChange).toBeCalledTimes(2);
    expect(onChange).nthCalledWith(1, 'name', 'My Other App');
    expect(onChange).nthCalledWith(2, 'state', 'disabled');
  });

  it('calls on save callback', () => {
    const handler = jest.fn();
    const p = new Page(shallow(
        <CollectionForm {...props} onSave={handler} />
    ));

    p.save();

    expect(handler).toBeCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.fn();

    const p = new Page(shallow(
        <CollectionForm {...props} onDelete={handler} />
    ));
    p.delete();

    expect(handler).toBeCalledWith();
  });

  it('handles undefined callbacks', () => {
    props.item.id = '65ada2f9';
    const p = new Page(shallow(<CollectionForm {...props} />));

    p.change({name: ''});
    p.save();
    p.delete();
  });

  it('renders no errors', () => {
    const p = new Page(shallow(<CollectionForm {...props} />));

    expect(p.errors()).toEqual({});
  });

  it('renders all errors', () => {
    const errors = {
      name: 'An error related to name.',
      state: 'An error related to state.'
    };

    const p = new Page(shallow(
        <CollectionForm {...props} errors={errors} />
    ));

    expect(p.errors()).toEqual(errors);
  });
});

class Page {
  fields = ['name', 'state']; // Must be listed in the same order as in form.
  selectors = {
    name: 'FormControl[name="name"]',
    stateEnabled: '#stateEnabled',
    stateDisabled: '#stateDisabled',
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
      name: this.w.find(this.selectors.name).props().value,
      state: this.w.find(
          this.selectors.stateEnabled
      ).props().checked ?
        'enabled' :
        this.w.find(this.selectors.stateDisabled).props().checked ?
          'disabled' : ''
    };
  }

  change(item) {
    this.changeControl(this.selectors.name, 'name', item.name);
    this.changeControl(this.selectors.stateEnabled, 'state', item.state);
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
        disabled: this.w.find(this.selectors.save).props().disabled
      }
    };
    const b = this.w.find(this.selectors.delete);
    if (b.exists()) {
      controls.delete = {
        disabled: b.props().disabled
      };
    }
    return controls;
  }

  save() {
    this.w.find('Form').simulate('submit', {preventDefault: () => { }});
  }

  delete() {
    this.w.find(this.selectors.delete).simulate('click');
  }
}

import React from 'react';
import {shallow} from 'enzyme';

import {JobForm} from './job-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('job', () => {
  const collections = [
    {id: '65ada2f9', name: 'My App #1'},
    {id: '7d76cb30', name: 'My Other App'}
  ];
  let props = null;

  beforeEach(() => {
    props = {
      item: {
        action: {
          request: {
            headers: []
          },
          retryPolicy: {}
        }
      },
      collections,
      errors: {}
    };
  });

  it('renders add item', () => {
    const p = new Page(shallow(<JobForm {...props} />));

    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('renders edit item', () => {
    const p = new Page(shallow(
        <JobForm {...props} item={{...props.item, id: '123de331'}} />
    ));

    expect(p.controls()).toEqual({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('calls on item change callback', () => {
    const handler = jest.fn();
    const p = new Page(shallow(
        <JobForm {...props} onItemChange={handler} />
    ));

    p.change({
      collectionId: 'de1044cc',
      name: 'My Job',
      state: 'enabled',
      schedule: '@every 5m'
    });

    expect(handler).toBeCalledTimes(4);
    expect(handler).nthCalledWith(1, 'collectionId', 'de1044cc');
    expect(handler).nthCalledWith(2, 'name', 'My Job');
    expect(handler).nthCalledWith(3, 'state', 'enabled');
    expect(handler).nthCalledWith(4, 'schedule', '@every 5m');
  });

  it('handle action change', () => {
    const handler = jest.fn();
    const p = new Page(shallow(
        <JobForm {...props} onActionChange={handler} />
    ));

    p.change({
      action: {type: 'HTTP'}
    });

    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'type', 'HTTP');
  });

  it('handle request change', () => {
    props.item.action.request.method = 'POST';
    const handler = jest.fn();
    const p = new Page(shallow(
        <JobForm {...props} onRequestChange={handler} />
    ));

    p.change({
      action: {
        request: {
          method: 'PUT',
          uri: 'https://localhost',
          body: '{}'
        }
      }
    });

    expect(handler).toBeCalledTimes(3);
    expect(handler).nthCalledWith(1, 'method', 'PUT');
    expect(handler).nthCalledWith(2, 'uri', 'https://localhost');
    expect(handler).nthCalledWith(3, 'body', '{}');
  });

  it('handle policy change', () => {
    const handler = jest.fn();
    const p = new Page(shallow(
        <JobForm {...props} onPolicyChange={handler} />
    ));

    p.change({
      action: {
        retryPolicy: {
          retryCount: 7,
          retryInterval: '45s',
          deadline: '3m'
        }
      }
    });

    expect(handler).toBeCalledTimes(3);
    expect(handler).nthCalledWith(1, 'retryCount', 7);
    expect(handler).nthCalledWith(2, 'retryInterval', '45s');
    expect(handler).nthCalledWith(3, 'deadline', '3m');
  });

  it('add header', () => {
    const handler = jest.fn();
    const w = shallow(
        <JobForm {...props} onAddHeader={handler} />
    );

    w.find('button[className="btn"]').simulate('click');

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith();
  });

  it('delete header', () => {
    props.item.action.request.headers = [
      {
        name: 'X-Requested-With',
        value: 'XMLHttpRequest'
      }
    ];
    const handler = jest.fn();
    const w = shallow(
        <JobForm {...props} onDeleteHeader={handler} />
    );

    w.find('Header').dive().find('button').simulate('click');

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(0);
  });

  it('handle header change', () => {
    props.item.action.request.headers = [
      {
        name: '',
        value: ''
      }
    ];
    const handler = jest.fn();
    const w = shallow(
        <JobForm {...props} onHeaderChange={handler} />
    );

    const h = w.find('Header').dive();
    h.find('FormControl[name="name"]').simulate('change', {
      target: {
        name: 'name',
        value: 'X-Requested-With'
      }
    });
    h.find('FormControl[name="value"]').simulate('change', {
      target: {
        name: 'value',
        value: 'XMLHttpRequest'
      }
    });

    expect(handler).toBeCalledTimes(2);
    expect(handler).nthCalledWith(1, 'name', 'X-Requested-With', 0);
    expect(handler).nthCalledWith(2, 'value', 'XMLHttpRequest', 0);
  });

  it('renders edit item', () => {
    props.item = {
      id: '7ce1f17e',
      name: 'My Task #1',
      state: 'disabled',
      collectionId: '7d76cb30',
      schedule: '@every 1h',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: 'http://example.com',
          headers: [
            {
              name: 'X-Requested-With',
              value: 'XMLHttpRequest'
            }
          ]
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m'
        }
      }
    };

    const p = new Page(shallow(<JobForm {...props} />));

    expect(p.data()).toEqual({
      name: 'My Task #1',
      state: 'disabled',
      collectionId: '7d76cb30',
      schedule: '@every 1h',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: 'http://example.com',
          headers: [
            {
              name: 'X-Requested-With',
              value: 'XMLHttpRequest'
            }
          ]
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m'
        }
      }
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('calls on save callback', () => {
    const handler = jest.fn();
    const p = new Page(shallow(<JobForm {...props} onSave={handler} />));

    p.save();

    expect(handler).toBeCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.fn();
    const p = new Page(shallow(<JobForm {...props} onDelete={handler} />));

    p.delete();

    expect(handler).toBeCalledWith();
  });

  it('handles undefined callbacks', () => {
    props.item.id = '65ada2f9';
    const p = new Page(shallow(<JobForm {...props} />));

    p.change({
      name: '',
      action: {
        type: '',
        request: {
          method: ''
        },
        retryPolicy: {
          retryCount: ''
        }
      }
    });
    p.save();
    p.delete();
  });

  it('renders no errors', () => {
    const p = new Page(shallow(<JobForm {...props} />));

    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('renders all errors', () => {
    props.item.action.request.method = 'POST';
    const errors = {
      name: 'An error related to name.',
      state: 'An error related to state.',
      collectionId: 'An error related to collectionId.',
      type: 'An error related to type.',
      schedule: 'An error related to schedule.',
      method: 'An error related to method.',
      uri: 'An error related to uri.',
      body: 'An error related to body.',
      retryCount: 'An error related to retryCount.',
      retryInterval: 'An error related to retryInterval.',
      deadline: 'An error related to deadline.',
    };

    const p = new Page(shallow(<JobForm {...props} errors={errors} />));

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });
});

class Page {
  fields = [
    'name', 'collectionId', 'state', 'type', 'schedule', 'body',
    'method', 'uri',
    'retryCount', 'retryInterval', 'deadline'
  ];
  selectors = {
    name: 'FormControl[name="name"]',
    collectionId: 'FormControl[name="collectionId"]',
    stateEnabled: '#stateEnabled',
    stateDisabled: '#stateDisabled',
    schedule: 'FormControl[name="schedule"]',
    type: 'FormControl[name="type"]',
    method: 'FormControl[name="method"]',
    uri: 'FormControl[name="uri"]',
    body: 'FormControl[name="body"]',
    retryCount: 'FormControl[name="retryCount"]',
    retryInterval: 'FormControl[name="retryInterval"]',
    deadline: 'FormControl[name="deadline"]',
  }

  /**
   * @param {ShallowWrapper} w
   */
  constructor(w) {
    this.w = w;
  }

  data() {
    const r = this.w.find('Request').dive();
    let body;
    const b = r.find(this.selectors.body);
    if (b.exists()) {
      body = b.props().value;
    }
    const headers = this.w.find('Header');
    const p = this.w.find('RetryPolicy').dive();
    return {
      name: this.w.find(this.selectors.name).props().value,
      collectionId: this.w.find(this.selectors.collectionId)
          .props().value,
      state: this.w.find(this.selectors.stateEnabled).props().checked ?
        'enabled' :
        this.w.find(this.selectors.stateDisabled).props().checked ?
          'disabled' : '',
      schedule: this.w.find(this.selectors.schedule).props().value,
      action: {
        type: this.w.find(this.selectors.type).props().value,
        request: {
          method: r.find(this.selectors.method).props().value,
          uri: r.find(this.selectors.uri).props().value,
          headers: !headers.exists() ? [] : headers.dive().map((h) => {
            return {
              name: h.find('FormControl[name="name"]').props().value,
              value: h.find('FormControl[name="value"]').props().value,
            };
          }),
          body
        },
        retryPolicy: {
          retryCount: p.find(this.selectors.retryCount).props().value,
          retryInterval: p.find(this.selectors.retryInterval).props().value,
          deadline: p.find(this.selectors.deadline).props().value,
        }
      }
    };
  }

  change(item) {
    this.changeControl(
        this.selectors.collectionId, 'collectionId', item.collectionId);
    this.changeControl(this.selectors.name, 'name', item.name);
    this.changeControl(this.selectors.stateEnabled, 'state', item.state);
    this.changeControl(this.selectors.schedule, 'schedule', item.schedule);
    const {action} = item;
    if (action) {
      this.changeControl(this.selectors.type, 'type', action.type);
      const {request, retryPolicy} = action;
      if (request) {
        const r = this.w.find('Request').dive();
        this.changeControl(this.selectors.method, 'method', request.method, r);
        this.changeControl(this.selectors.uri, 'uri', request.uri, r);
        this.changeControl(this.selectors.body, 'body', request.body);
      }
      if (retryPolicy) {
        const p = this.w.find('RetryPolicy').dive();
        this.changeControl(
            this.selectors.retryCount,
            'retryCount',
            retryPolicy.retryCount,
            p);
        this.changeControl(
            this.selectors.retryInterval,
            'retryInterval',
            retryPolicy.retryInterval,
            p);
        this.changeControl(
            this.selectors.deadline, 'deadline', retryPolicy.deadline, p);
      }
    }
  }

  changeControl(selector, name, value, w) {
    if (value === undefined) {
      return;
    }
    if (!w) {
      w = this.w;
    }
    w.find(selector).simulate('change', {
      target: {
        name,
        value
      }
    });
  }

  errors() {
    const errors = {};
    [
      this.w,
      this.w.find('Request').dive(),
      this.w.find('RetryPolicy').dive()
    ]
        .flatMap((n) => n.find('FieldError').map((f) => f))
        .forEach((f, i) => {
          const m = f.props().message;
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
    this.w.find('Form').simulate('submit', {preventDefault: () => { }});
  }

  delete() {
    this.w.find('Button[variant="danger"]').simulate('click');
  }
}

import React from 'react';
import {shallow} from 'enzyme';

import api from './api';
import Job from './job';

jest.mock('./api');

describe('job', () => {
  const collections = {
    items: [
      {id: '65ada2f9', name: 'My App #1'},
      {id: '7d76cb30', name: 'My Other App'}
    ]
  };
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {}},
      history: {
        goBack: jest.fn()
      }
    };
  });

  it('list collections fails', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Job {...props} />));

    expect(p.data()).toMatchObject({
      collectionId: ''
    });
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('shows an error if no collections', () => {
    api.listCollections.mockImplementation(resolvePromise({items: []}));

    const p = new Page(shallow(<Job {...props} />));

    expect(p.errors()).toEqual({
      collectionId: 'There is no collection available.'
    });
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('render collections selects a first available', () => {
    api.listCollections.mockImplementation(resolvePromise(collections));

    const p = new Page(shallow(<Job {...props} />));

    expect(p.data()).toMatchObject({
      collectionId: '65ada2f9'
    });
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('retrieve job fails', () => {
    props.match.params.id = '7ce1f17e';
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockImplementation(rejectPromise(errors));
    api.listCollections.mockImplementation(resolvePromise(collections));

    const p = new Page(shallow(<Job {...props} />));

    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('handle item change', () => {
    const w = shallow(<Job {...props} />);
    w.find('FormControl[name="name"]').simulate('change', {
      target: {
        name: 'name',
        value: 'My Other Task'
      }
    });
    w.find('#stateDisabled').simulate('change', {
      target: {
        name: 'state',
        value: 'disabled'
      }
    });
    w.find('FormControl[name="schedule"]').simulate('change', {
      target: {
        name: 'schedule',
        value: '@every 15s'
      }
    });

    expect(w.state('item')).toMatchObject({
      name: 'My Other Task',
      state: 'disabled',
      schedule: '@every 15s'
    });
  });

  it('handle action change', () => {
    const w = shallow(<Job {...props} />);
    w.find('FormControl[name="type"]').simulate('change', {
      target: {
        name: 'type',
        value: 'HTTP'
      }
    });

    expect(w.state('item').action).toMatchObject({
      type: 'HTTP'
    });
  });

  it('handle request change', () => {
    const w = shallow(<Job {...props} />);
    const r = w.find('Request').dive();
    r.find('FormControl[name="method"]').simulate('change', {
      target: {
        name: 'method',
        value: 'POST'
      }
    });
    r.find('FormControl[name="uri"]').simulate('change', {
      target: {
        name: 'uri',
        value: 'https://localhost'
      }
    });
    w.find('FormControl[name="body"]').simulate('change', {
      target: {
        name: 'body',
        value: '{}'
      }
    });

    expect(w.state('item').action.request).toEqual({
      method: 'POST',
      uri: 'https://localhost',
      headers: [],
      body: '{}'
    });
  });

  it('handle policy change', () => {
    const w = shallow(<Job {...props} />);
    const p = w.find('RetryPolicy').dive();
    p.find('FormControl[name="retryCount"]').simulate('change', {
      target: {
        name: 'retryCount',
        value: '7'
      }
    });
    p.find('FormControl[name="retryInterval"]').simulate('change', {
      target: {
        name: 'retryInterval',
        value: '45s'
      }
    });
    p.find('FormControl[name="deadline"]').simulate('change', {
      target: {
        name: 'deadline',
        value: '3m'
      }
    });

    expect(w.state('item').action.retryPolicy).toEqual({
      retryCount: 7,
      retryInterval: '45s',
      deadline: '3m'
    });
  });

  it('add header', () => {
    const w = shallow(<Job {...props} />);
    w.find('button[className="btn"]').simulate('click');

    expect(w.state('item').action.request.headers).toEqual([{
      name: '', value: ''
    }]);
  });

  it('delete header', () => {
    const w = shallow(<Job {...props} />);
    w.find('button[className="btn"]').simulate('click');
    w.find('Header').dive().find('button').simulate('click');

    expect(w.state('item').action.request.headers).toEqual([]);
  });

  it('handle header change', () => {
    const w = shallow(<Job {...props} />);
    w.find('button[className="btn"]').simulate('click');
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

    expect(w.state('item').action.request.headers).toEqual([{
      name: 'X-Requested-With', value: 'XMLHttpRequest'
    }]);
  });

  it('handle header mutiple changes', () => {
    const w = shallow(<Job {...props} />);
    const b = w.find('button[className="btn"]');
    for (let i = 0; i < 8; i++) {
      b.simulate('click');
      const h = w.find('Header').at(i).dive();
      h.find('FormControl[name="name"]').simulate('change', {
        target: {
          name: 'name',
          value: `Name-${i}`
        }
      });
      h.find('FormControl[name="value"]').simulate('change', {
        target: {
          name: 'value',
          value: `Value-${i}`
        }
      });
    }
    // delete some headers
    for (let i = 6; i > 1; i--) {
      w.find('Header').at(i).dive().find('button').simulate('click');
    }

    expect(w.state('item').action.request.headers).toEqual([
      {name: 'Name-0', value: 'Value-0'},
      {name: 'Name-1', value: 'Value-1'},
      {name: 'Name-7', value: 'Value-7'}
    ]);
  });

  it('renders edit item', () => {
    props.match.params.id = '7ce1f17e';
    api.retrieveJob.mockImplementation(resolvePromise({
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
    }));
    api.listCollections.mockImplementation(resolvePromise(collections));

    const p = new Page(shallow(<Job {...props} />));

    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');
    expect(p.data()).toEqual({
      title: 'Job My Task #1',
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

  it('save item', () => {
    api.saveJob.mockImplementation(resolvePromise());

    const p = new Page(shallow(<Job {...props} />));
    p.save();

    expect(api.saveJob).toBeCalledWith({
      name: '',
      state: 'enabled',
      collectionId: '65ada2f9',
      schedule: '',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: '',
          headers: [],
          body: ''
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m'
        }
      }
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.controls()).toEqual({
      save: {disabled: true}
    });
  });

  it('save returns errors', () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.'
    };
    api.saveJob.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Job {...props} />));
    p.save();

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });

  it('delete item', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveJob.mockImplementation(resolvePromise({
      id: '65ada2f9',
      etag: '"2hhaswzbz72p8"',
      action: {request: {headers: []}, retryPolicy: {}}
    }));
    api.deleteJob.mockImplementation(resolvePromise());

    const p = new Page(shallow(<Job {...props} />));
    p.delete();

    expect(api.deleteJob).toBeCalledWith('65ada2f9', '"2hhaswzbz72p8"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
    expect(p.errors()).toEqual({});
    expect(p.controls()).toEqual({
      save: {disabled: true},
      delete: {disabled: true}
    });
  });

  it('delete returns an error', () => {
    props.match.params.id = '65ada2f9';
    api.retrieveJob.mockImplementation(resolvePromise({
      id: '65ada2f9',
      etag: '"2hhaswzbz72p8"',
      action: {request: {headers: []}, retryPolicy: {}}
    }));
    const errors = {__ERROR__: 'The error text.'};
    api.deleteJob.mockImplementation(rejectPromise(errors));

    const p = new Page(shallow(<Job {...props} />));
    p.delete();

    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false},
      delete: {disabled: false}
    });
  });

  it('renders no errors', () => {
    const p = new Page(shallow(<Job {...props} />));

    expect(p.data()).toEqual({
      title: 'Job ',
      name: '',
      state: 'enabled',
      collectionId: '65ada2f9',
      schedule: '',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: '',
          headers: []
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
      save: {disabled: false}
    });
  });

  it('renders all errors', () => {
    const w = shallow(<Job {...props} />);
    const p = new Page(w);

    const errors = {
      __ERROR__: 'The summary error text.',
      name: 'An error related to name.',
      state: 'An error related to state.',
      collectionId: 'An error related to collectionId.',
      type: 'An error related to type.',
      schedule: 'An error related to schedule.',
      method: 'An error related to method.',
      uri: 'An error related to uri.',
      retryCount: 'An error related to retryCount.',
      retryInterval: 'An error related to retryInterval.',
      deadline: 'An error related to deadline.',
    };
    w.setState({errors: errors});

    expect(p.errors()).toEqual(errors);
    expect(p.controls()).toEqual({
      save: {disabled: false}
    });
  });
});

class Page {
  fields = [
    'name', 'collectionId', 'state', 'type', 'schedule',
    'method', 'uri',
    'retryCount', 'retryInterval', 'deadline'
  ];

  constructor(w) {
    this.w = w;
  }

  data() {
    const r = this.w.find('Request').dive();
    const headers = this.w.find('Header');
    const p = this.w.find('RetryPolicy').dive();
    return {
      title: this.w.find('Layout').props().title,
      name: this.w.find('FormControl[name="name"]').props().value,
      collectionId: this.w.find('FormControl[name="collectionId"]')
          .props().value,
      state: this.w.find('#stateEnabled').props().checked ? 'enabled' :
        this.w.find('#stateDisabled').props().checked ? 'disabled' : '',
      schedule: this.w.find('FormControl[name="schedule"]').props().value,
      action: {
        type: this.w.find('FormControl[name="type"]').props().value,
        request: {
          method: r.find('FormControl[name="method"]').props().value,
          uri: r.find('FormControl[name="uri"]').props().value,
          headers: !headers.exists() ? [] : headers.dive().map((h) => {
            return {
              name: h.find('FormControl[name="name"]').props().value,
              value: h.find('FormControl[name="value"]').props().value,
            };
          })
        },
        retryPolicy: {
          retryCount: p.find('FormControl[name="retryCount"]').props().value,
          retryInterval: p.find('FormControl[name="retryInterval"]')
              .props().value,
          deadline: p.find('FormControl[name="deadline"]').props().value,
        }
      }
    };
  }

  errors() {
    const errors = {};
    const c = this.w.find('Layout').dive()
        .find('ErrorSummary').dive().find('h4');
    if (c.exists()) {
      errors.__ERROR__ = c.text();
    }
    [this.w, this.w.find('Request').dive(), this.w.find('RetryPolicy').dive()]
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

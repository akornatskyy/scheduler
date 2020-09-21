import React from 'react';
import {shallow} from 'enzyme';

import * as api from './collections-api';
import Collections from './collections';

jest.mock('./collections-api');

describe('collections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));

    const w = shallow(<Collections />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(w.state('errors')).toEqual(errors);
  });

  it('updates state with fetched items', () => {
    const items = [{
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled'
    }];
    api.listCollections.mockImplementation(resolvePromise({items}));

    const w = shallow(<Collections />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(w.state()).toEqual({
      errors: {},
      items
    });
  });
});

import React from 'react';
import {shallow} from 'enzyme';

import * as api from './variables-api';
import Variables from './variables';

jest.mock('./variables-api');

describe('variables', () => {
  const props = {
    location: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list collections error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(rejectPromise(errors));
    api.listVariables.mockImplementation(resolvePromise({items: []}));

    const w = shallow(<Variables {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledTimes(1);
    expect(api.listVariables).toBeCalledWith(null);
    expect(w.state('errors')).toEqual(errors);
  });

  it('handles list variables error', () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockImplementation(resolvePromise({items: []}));
    api.listVariables.mockImplementation(rejectPromise(errors));

    const w = shallow(<Variables {...props} />);

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledTimes(1);
    expect(api.listVariables).toBeCalledWith(null);
    expect(w.state('errors')).toEqual(errors);
  });

  it('updates state with fetched items', () => {
    const collections = [{
      id: '65ada2f9'
    }];
    api.listCollections.mockImplementation(resolvePromise({
      items: collections
    }));
    const variables = [{
      collectionId: '65ada2f9'
    }];
    api.listVariables.mockImplementation(resolvePromise({
      items: variables
    }));

    const w = shallow(
        <Variables {...props} location={{search: '?collectionId=65ada2f9'}} />
    );

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledTimes(1);
    expect(api.listVariables).toBeCalledWith('65ada2f9');
    expect(w.state()).toEqual({
      collections,
      variables,
      errors: {}
    });
  });
});

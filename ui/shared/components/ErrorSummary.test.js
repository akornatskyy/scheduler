import React from 'react';
import {shallow} from 'enzyme';

import ErrorSummary from './ErrorSummary';

describe('errors summary', () => {
  it('handles no errors', () => {
    const w = shallow(<ErrorSummary errors={{}} />);

    expect(w.getElement()).toBeNull();
  });

  it('ignores field error', () => {
    const errors = {name: 'some error'};
    const w = shallow(<ErrorSummary errors={errors} />);

    expect(w.getElement()).toBeNull();
  });

  it('shows error', () => {
    const errors = {__ERROR__: 'The error message.'};
    const w = shallow(<ErrorSummary errors={errors} />);

    expect(w.find('Alert').prop('variant')).toBe('danger');
    expect(w.find('h4').text()).toBe('The error message.');
  });
});

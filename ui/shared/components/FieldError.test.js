import React from 'react';
import {shallow} from 'enzyme';

import FieldError from './FieldError';

describe('field error', () => {
  it('handles no error', () => {
    const w = shallow(<FieldError />);

    expect(w.getElement()).toBeNull();
  });

  it('shows error', () => {
    const w = shallow(<FieldError message="The error message." />);

    expect(w.find('p').prop('className')).toMatch(/invalid-feedback/);
    expect(w.find('p').text()).toBe('The error message.');
  });
});

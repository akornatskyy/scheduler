import React from 'react';
import {shallow} from 'enzyme';

import Footer from './Footer';

describe('footer component', () => {
  it('renders a link to documentation', () => {
    const w = shallow(<Footer />);

    expect(w.find('a').text()).toBe('Documentation');
  });
});

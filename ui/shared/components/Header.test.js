import React from 'react';
import {shallow} from 'enzyme';

import Header from './Header';

describe('header component', () => {
  it('renders links', () => {
    const w = shallow(<Header />);

    expect(w.find('NavLink').map((l) => l.props().to))
        .toEqual(['/collections', '/variables', '/jobs']);
  });
});

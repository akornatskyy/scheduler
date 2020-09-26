import React from 'react';
import {shallow} from 'enzyme';

import Layout from './Layout';

describe('layout component', () => {
  it('renders title, errors summary and child', () => {
    const w = shallow(
        <Layout title="My Title">
          Child
        </Layout>
    );

    expect(w.find('h1').text()).toBe('My Title');
    expect(w.find('article').text()).toBe('<ErrorSummary />Child');
  });
});

import React from 'react';
import {shallow} from 'enzyme';

import {Header, Layout, Footer, ErrorSummary, FieldError} from './shared';

describe('shared', () => {
  it('renders header', () => {
    const w = shallow(<Header />);

    expect(w.find('NavLink').map((l) => l.props().to))
        .toEqual(['/collections', '/variables', '/jobs']);
  });

  it('renders layout', () => {
    const w = shallow(
        <Layout title="My Title">
          Child
        </Layout>
    );

    expect(w.find('h1').text()).toBe('My Title');
    expect(w.find('article').text()).toBe('<ErrorSummary />Child');
  });

  it('renders footer', () => {
    const w = shallow(<Footer />);

    expect(w.find('a').text()).toBe('Documentation');
  });

  it('errors summary empty', () => {
    const w = shallow(<ErrorSummary errors={{}} />);

    expect(w.getElement()).toBeNull();
  });

  it('errors summary ignores field error', () => {
    const errors = {name: 'some error'};
    const w = shallow(<ErrorSummary errors={errors} />);

    expect(w.getElement()).toBeNull();
  });

  it('errors summary', () => {
    const errors = {__ERROR__: 'The error message.'};
    const w = shallow(<ErrorSummary errors={errors} />);

    expect(w.find('Alert').prop('variant')).toBe('danger');
    expect(w.find('h4').text()).toBe('The error message.');
  });

  it('field error empty', () => {
    const w = shallow(<FieldError />);

    expect(w.getElement()).toBeNull();
  });

  it('field error', () => {
    const w = shallow(<FieldError message="The error message." />);

    expect(w.find('p').prop('className')).toMatch(/invalid-feedback/);
    expect(w.find('p').text()).toBe('The error message.');
  });
});

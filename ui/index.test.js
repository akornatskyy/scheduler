import React from 'react';
import {mount} from 'enzyme';
import {MemoryRouter} from 'react-router-dom';

import {App} from './index';

jest.mock('react-dom');

describe('index', () => {
  it.each([
    ['/', 'Collections'],
    ['/collections', 'Collections'],
    ['/jobs', 'Jobs'],
    ['/collections/add', 'Collection'],
    ['/collections/65ada2f9', 'Collection'],
    ['/jobs/add', 'Job'],
    ['/jobs/7ce1f17e', 'Job'],
    ['/jobs/7ce1f17e/history', 'JobHistory'],
  ])('routes %s to %s', (path, component) => {
    const w = mount(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
    );

    expect(w.exists('Header')).toBe(true);
    expect(w.exists(component)).toBe(true);
    expect(w.exists('Footer')).toBe(true);
  });
});

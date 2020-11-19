import React from 'react';
import {render, screen} from '@testing-library/react';

import Layout from './Layout';

describe('layout component', () => {
  it('renders title, errors summary and child', () => {
    render(
        <Layout title="My Title" errors={{}}>
          Child
        </Layout>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('My Title');
    expect(screen.getByText('Child')).toBeVisible();
  });
});

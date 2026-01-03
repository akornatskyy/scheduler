import {render, screen} from '@testing-library/react';
import {Layout} from './Layout';

describe('Layout', () => {
  it('renders title, errors summary and child', () => {
    render(
      <Layout title="My Title" errors={{}}>
        Child
      </Layout>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('My Title');
    expect(screen.getByText('Child')).toBeVisible();
  });
});

import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import Header from './Header';

describe('header component', () => {
  it('renders links', () => {
    render(
      <Router>
        <Header />
      </Router>,
    );

    expect(screen.getByText('Collections')).toBeVisible();
    expect(screen.getByText('Variables')).toBeVisible();
    expect(screen.getByText('Jobs')).toBeVisible();
  });
});

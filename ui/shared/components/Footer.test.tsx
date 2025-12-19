import {render, screen} from '@testing-library/react';
import {Footer} from './Footer';

describe('footer component', () => {
  it('renders a link to documentation', () => {
    render(<Footer />);

    expect(screen.getByText('Documentation')).toBeVisible();
  });
});

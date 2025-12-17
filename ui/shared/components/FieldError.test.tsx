import {render, screen} from '@testing-library/react';
import FieldError from './FieldError';

describe('field error component', () => {
  it('handles no error', () => {
    const {container} = render(<FieldError />);

    expect(container.firstChild).toBeNull();
  });

  it('shows error', () => {
    render(<FieldError message="The error message." />);

    expect(screen.getByText('The error message.')).toBeVisible();
  });
});

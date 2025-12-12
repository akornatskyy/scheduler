import {render, screen} from '@testing-library/react';
import ErrorSummary from './ErrorSummary';

describe('errors summary', () => {
  it('handles no errors', () => {
    const {container} = render(<ErrorSummary errors={{}} />);

    expect(container.firstChild).toBeNull();
  });

  it('ignores field error', () => {
    const errors = {name: 'some error'};
    const {container} = render(<ErrorSummary errors={errors} />);

    expect(container.firstChild).toBeNull();
  });

  it('shows error', () => {
    const errors = {__ERROR__: 'The error message.'};
    render(<ErrorSummary errors={errors} />);

    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});

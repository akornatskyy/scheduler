import {render, screen} from '@testing-library/react';
import {ErrorSummary} from './ErrorSummary';

describe('error summary component', () => {
  it('renders provided message', () => {
    render(<ErrorSummary message="The error message." />);

    expect(
      screen.getByRole('heading', {name: 'The error message.'}),
    ).toBeVisible();
    expect(
      screen.getByText(
        'An unexpected error has occurred. Retry your request later, please.',
      ),
    ).toBeVisible();
  });
});

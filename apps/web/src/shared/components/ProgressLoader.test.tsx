import {useSignal} from '$shared/hooks';
import {render, screen} from '@testing-library/react';
import {ProgressLoader} from './ProgressLoader';

jest.mock('$shared/hooks', () => ({
  useSignal: jest.fn(),
}));

describe('ProgressLoader', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders progress bar when visible', () => {
    jest.mocked(useSignal).mockReturnValue(true);

    render(<ProgressLoader />);

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('returns null when not visible', () => {
    jest.mocked(useSignal).mockReturnValue(false);

    const {container} = render(<ProgressLoader />);

    expect(container.firstChild).toBeNull();
  });
});

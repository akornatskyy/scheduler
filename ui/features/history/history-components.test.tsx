import {fireEvent, render, screen} from '@testing-library/react';
import {formatDate, formatRunning, JobHistoryList} from './history-components';
import {JobHistory, JobStatus} from './types';

describe('job history status formatters', () => {
  it.each([
    [null, ''],
    [undefined, ''],
    [false, 'Scheduled'],
    [true, 'Running'],
  ])('format running %o to %o', (running, expected) => {
    expect(formatRunning(running)).toEqual(expected);
  });

  it.each([
    [null, 'N/A'],
    [undefined, 'N/A'],
    ['', 'N/A'],
  ])('format date %o to %o', (s, expected) => {
    expect(formatDate(s)).toEqual(expected);
  });

  it('formats UTC date as local locale', () => {
    expect(formatDate('2019-08-29T13:29:36.976Z')).toEqual(
      new Date('2019-08-29T13:29:36Z').toLocaleString(),
    );
  });
});

describe('job history component', () => {
  const props: Parameters<typeof JobHistoryList>[0] = {
    status: {} as JobStatus,
    items: [],
  };

  it('renders empty list', () => {
    const {container} = render(<JobHistoryList {...props} />);

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const status: JobStatus = {
      running: false,
      runCount: 17,
      errorCount: 5,
      lastRun: '2019-08-29T13:29:36.976Z',
    };
    const items: JobHistory[] = [
      {
        action: 'HTTP',
        started: '2019-09-18T06:26:13Z',
        finished: '2019-09-18T06:27:02Z',
        status: 'failing',
        retryCount: 3,
        message: '404 Not Found',
      },
      {
        action: 'HTTP',
        started: '2019-09-18T06:25:56Z',
        finished: '2019-09-18T06:25:56Z',
        status: 'passing',
      },
    ];

    render(<JobHistoryList status={status} items={items} />);

    expect(screen.getByText('Scheduled')).toBeVisible();
    expect(screen.getByText('17 / 5')).toBeVisible();
    expect(
      screen.getByText(
        new Date('2019-08-29T13:29:36.976Z')
          .toLocaleString()
          .replace(/\s+/g, ' '),
      ),
    ).toBeVisible();
    expect(screen.getByText('N/A')).toBeVisible();
    expect(screen.getByText('failing')).toBeVisible();
    expect(screen.getByText('passing')).toBeVisible();

    expect(screen.getByText('Back')).toBeEnabled();
    expect(screen.getByText('Run')).toBeEnabled();
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('calls on back callback', () => {
    const handler = jest.fn();
    render(<JobHistoryList {...props} onBack={handler} />);

    fireEvent.click(screen.getByText('Back'));

    expect(handler).toHaveBeenCalled();
  });

  it('calls on run callback', () => {
    const handler = jest.fn();
    render(<JobHistoryList {...props} onRun={handler} />);

    fireEvent.click(screen.getByText('Run'));

    expect(handler).toHaveBeenCalled();
  });

  it('calls on delete callback', () => {
    const handler = jest.fn();
    render(
      <JobHistoryList
        {...props}
        items={[{} as JobHistory]}
        onDelete={handler}
      />,
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toHaveBeenCalled();
  });

  it('handles undefined callbacks', () => {
    render(<JobHistoryList {...props} items={[{} as JobHistory]} />);

    fireEvent.click(screen.getByText('Back'));
    fireEvent.click(screen.getByText('Run'));
    fireEvent.click(screen.getByText('Delete'));
  });
});

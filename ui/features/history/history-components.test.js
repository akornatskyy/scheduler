import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {JobHistoryList, formatRunning, formatDate} from './history-components';

describe('job history status', () => {
  it.each([
    [null, ''],
    [undefined, ''],
    [false, 'Scheduled'],
    [true, 'Running']
  ])('format running %o to %o', (running, expected) => {
    expect(formatRunning(running)).toEqual(expected);
  });

  it.each([
    [null, 'N/A'],
    [undefined, 'N/A'],
    ['', 'N/A']
  ])('format date %o to %o', (s, expected) => {
    expect(formatDate(s)).toEqual(expected);
  });
});

it('formats UTC date as local locale', () => {
  expect(
      formatDate('2019-08-29T13:29:36.976Z')
  ).toEqual(
      new Date('2019-08-29T13:29:36Z').toLocaleString()
  );
});

describe('job history component', () => {
  const props = {status: {}, items: []};

  it('renders empty list', () => {
    const {container} = render(
        <JobHistoryList {...props} />
    );

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const status = {
      running: false,
      runCount: 17,
      errorCount: 5,
      lastRun: '2019-08-29T13:29:36.976Z'
    };
    const items = [
      {
        action: 'HTTP',
        started: '2019-09-18T06:26:13Z',
        finished: '2019-09-18T06:27:02Z',
        status: 'failed',
        retryCount: 3,
        message: '404 Not Found'
      },
      {
        action: 'HTTP',
        started: '2019-09-18T06:25:56Z',
        finished: '2019-09-18T06:25:56Z',
        status: 'completed'
      }
    ];

    render(<JobHistoryList status={status} items={items} />);

    expect(screen.getByText('Scheduled')).toBeVisible();
    expect(screen.getByText('17 / 5')).toBeVisible();
    expect(screen.getByText(
        new Date('2019-08-29T13:29:36.976Z').toLocaleString())).toBeVisible();
    expect(screen.getByText('N/A')).toBeVisible();
    expect(screen.getByText('failed')).toBeVisible();
    expect(screen.getByText('completed')).toBeVisible();

    expect(screen.getByText('Back')).toBeEnabled();
    expect(screen.getByText('Run')).toBeEnabled();
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('calls on back callback', () => {
    const handler = jest.fn();
    render(<JobHistoryList {...props} onBack={handler} />);

    fireEvent.click(screen.getByText('Back'));

    expect(handler).toBeCalled();
  });

  it('calls on run callback', () => {
    const handler = jest.fn();
    render(<JobHistoryList {...props} onRun={handler} />);

    fireEvent.click(screen.getByText('Run'));

    expect(handler).toBeCalled();
  });

  it('calls on delete callback', () => {
    const handler = jest.fn();
    render(<JobHistoryList {...props} items={[{}]} onDelete={handler} />);

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toBeCalled();
  });

  it('handles undefined callbacks', () => {
    render(<JobHistoryList {...props} items={[{}]} />);

    fireEvent.click(screen.getByText('Back'));
    fireEvent.click(screen.getByText('Run'));
    fireEvent.click(screen.getByText('Delete'));
  });
});

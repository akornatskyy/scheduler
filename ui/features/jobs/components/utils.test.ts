import {formatDate, formatRunning} from './utils';

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

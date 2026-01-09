import {defer, signal} from './signals';

describe('signal', () => {
  it('initializes with the provided value', () => {
    const s = signal(42);

    expect(s.get()).toBe(42);
  });

  it('updates value when set is called', () => {
    const s = signal(10);

    s.set(20);

    expect(s.get()).toBe(20);
  });

  it('notifies subscribers when value changes', () => {
    const s = signal(0);
    const cb = jest.fn();

    s.subscribe(cb);
    s.set(1);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('notifies all subscribers when value changes', () => {
    const s = signal(0);
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    s.subscribe(cb1);
    s.subscribe(cb2);
    s.set(5);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('does not notify when value is Object.is equal', () => {
    const s = signal(42);
    const cb = jest.fn();

    s.subscribe(cb);
    s.set(42);

    expect(cb).not.toHaveBeenCalled();
  });

  it('returns unsubscribe function that removes the listener', () => {
    const s = signal(0);
    const cb = jest.fn();
    const unsubscribe = s.subscribe(cb);

    unsubscribe();
    s.set(1);

    expect(cb).not.toHaveBeenCalled();
  });

  it('allows multiple subscriptions and unsubscriptions', () => {
    const s = signal(0);
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const unsub1 = s.subscribe(cb1);
    s.subscribe(cb2);

    s.set(1);
    unsub1();
    s.set(2);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(2);
  });

  it('works with object values', () => {
    const s = signal({count: 1});
    const cb = jest.fn();

    s.subscribe(cb);
    s.set({count: 2});

    expect(s.get()).toEqual({count: 2});
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not notify when same object reference is set', () => {
    const obj = {count: 1};
    const s = signal(obj);
    const cb = jest.fn();

    s.subscribe(cb);
    s.set(obj);

    expect(cb).not.toHaveBeenCalled();
  });
});

describe('defer', () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with source signal value', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);

    expect(deferred.get()).toBe(false);
  });

  it('delays showing true state by delayMs', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);

    source.set(true);
    expect(deferred.get()).toBe(false);

    jest.advanceTimersByTime(99);
    expect(deferred.get()).toBe(false);

    jest.advanceTimersByTime(1);
    expect(deferred.get()).toBe(true);
  });

  it('keeps showing true for at least minShowMs after appearing', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);

    source.set(true);
    jest.advanceTimersByTime(100);
    expect(deferred.get()).toBe(true);

    source.set(false);
    expect(deferred.get()).toBe(true);

    jest.advanceTimersByTime(199);
    expect(deferred.get()).toBe(true);

    jest.advanceTimersByTime(1);
    expect(deferred.get()).toBe(false);
  });

  it('cancels pending show when source becomes false before delay', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);

    source.set(true);
    jest.advanceTimersByTime(50);
    expect(deferred.get()).toBe(false);

    source.set(false);
    jest.advanceTimersByTime(100);
    expect(deferred.get()).toBe(false);
  });

  it('does not update when source becomes false if deferred never showed', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);
    const cb = jest.fn();

    deferred.subscribe(cb);

    source.set(true);
    source.set(false);
    jest.advanceTimersByTime(200);

    expect(cb).not.toHaveBeenCalled();
    expect(deferred.get()).toBe(false);
  });

  it('hides immediately when minShowMs is 0', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 0);

    source.set(true);
    jest.advanceTimersByTime(100);
    expect(deferred.get()).toBe(true);

    source.set(false);
    jest.advanceTimersByTime(0);
    expect(deferred.get()).toBe(false);
  });

  it('shows immediately when delayMs is 0', () => {
    const source = signal(false);
    const deferred = defer(source, 0, 200);

    source.set(true);
    jest.advanceTimersByTime(0);
    expect(deferred.get()).toBe(true);
  });

  it('handles rapid true/false/true transitions correctly', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);

    source.set(true);
    jest.advanceTimersByTime(50);
    source.set(false);
    source.set(true);
    jest.advanceTimersByTime(100);

    expect(deferred.get()).toBe(true);
  });

  it('notifies subscribers when deferred state changes', () => {
    const source = signal(false);
    const deferred = defer(source, 100, 200);
    const cb = jest.fn();

    deferred.subscribe(cb);

    source.set(true);
    jest.advanceTimersByTime(100);

    expect(cb).toHaveBeenCalledTimes(1);

    source.set(false);
    jest.advanceTimersByTime(200);

    expect(cb).toHaveBeenCalledTimes(2);
  });
});

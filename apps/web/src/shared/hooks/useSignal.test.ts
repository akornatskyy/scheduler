import {signal} from '$shared/lib/signals';
import {act, renderHook} from '@testing-library/react';
import {useSignal} from './useSignal';

describe('useSignal', () => {
  it('returns current signal value', () => {
    const s = signal(42);

    const {result} = renderHook(() => useSignal(s));

    expect(result.current).toBe(42);
  });

  it('returns updated value when signal changes', () => {
    const s = signal(10);
    const {result, rerender} = renderHook(() => useSignal(s));

    act(() => s.set(20));
    rerender();

    expect(result.current).toBe(20);
  });

  it('subscribes to signal on mount', () => {
    const s = signal(0);
    const subscribeSpy = jest.spyOn(s, 'subscribe');

    renderHook(() => useSignal(s));

    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes from signal on unmount', () => {
    const s = signal(0);
    const unsubscribe = jest.fn();
    jest.spyOn(s, 'subscribe').mockReturnValue(unsubscribe);

    const {unmount} = renderHook(() => useSignal(s));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('works with object values', () => {
    const s = signal({count: 1});

    const {result, rerender} = renderHook(() => useSignal(s));

    expect(result.current).toEqual({count: 1});

    act(() => s.set({count: 2}));
    rerender();

    expect(result.current).toEqual({count: 2});
  });

  it('works with string values', () => {
    const s = signal('hello');

    const {result, rerender} = renderHook(() => useSignal(s));

    expect(result.current).toBe('hello');

    act(() => s.set('world'));
    rerender();

    expect(result.current).toBe('world');
  });

  it('works with boolean values', () => {
    const s = signal(false);

    const {result, rerender} = renderHook(() => useSignal(s));

    expect(result.current).toBe(false);

    act(() => s.set(true));
    rerender();

    expect(result.current).toBe(true);
  });

  it('handles multiple rerenders with same value', () => {
    const s = signal(5);
    const {result, rerender} = renderHook(() => useSignal(s));

    expect(result.current).toBe(5);

    rerender();
    expect(result.current).toBe(5);

    rerender();
    expect(result.current).toBe(5);
  });

  it('works with multiple hooks subscribing to same signal', () => {
    const s = signal(100);
    const {result: result1} = renderHook(() => useSignal(s));
    const {result: result2} = renderHook(() => useSignal(s));

    expect(result1.current).toBe(100);
    expect(result2.current).toBe(100);
  });

  it('updates multiple hooks when signal changes', () => {
    const s = signal(1);
    const {result: result1, rerender: rerender1} = renderHook(() =>
      useSignal(s),
    );
    const {result: result2, rerender: rerender2} = renderHook(() =>
      useSignal(s),
    );

    act(() => s.set(2));
    rerender1();
    rerender2();

    expect(result1.current).toBe(2);
    expect(result2.current).toBe(2);
  });
});

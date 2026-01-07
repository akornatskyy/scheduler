import {diffPartial} from './diff';

describe('diffPartial', () => {
  it('returns undefined when values are Object.is equal', () => {
    expect(diffPartial(1, 1)).toBeUndefined();
    expect(diffPartial('a', 'a')).toBeUndefined();
  });

  it('treats NaN as equal (Object.is) and returns undefined', () => {
    expect(diffPartial(Number.NaN, Number.NaN)).toBeUndefined();
  });

  it('returns next for primitive changes', () => {
    expect(diffPartial(1, 2)).toBe(2);
    expect(diffPartial('a', 'b')).toBe('b');
    expect(diffPartial(false, true)).toBe(true);
  });

  it('returns next when one side is array and the other is not', () => {
    expect(diffPartial({a: 1} as unknown, [1, 2] as unknown)).toEqual([1, 2]);
    expect(diffPartial([1, 2] as unknown, {a: 1} as unknown)).toEqual({a: 1});
  });

  it('returns undefined for equal arrays (deep)', () => {
    expect(diffPartial([1, {a: 2}], [1, {a: 2}])).toBeUndefined();
  });

  it('returns next array when arrays differ (deep)', () => {
    expect(diffPartial([1, 2], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(diffPartial([1, {a: 2}], [1, {a: 3}])).toEqual([1, {a: 3}]);
  });

  it('returns a minimal patch for changed keys only', () => {
    const prev = {a: 1, b: 2};
    const next = {a: 1, b: 3};

    expect(diffPartial(prev, next)).toEqual({b: 3});
  });

  it('returns nested patch for nested plain objects', () => {
    const prev = {
      a: 1,
      nested: {x: 1, y: 2},
    };
    const next = {
      a: 1,
      nested: {x: 1, y: 3},
    };

    expect(diffPartial(prev, next)).toEqual({nested: {y: 3}});
  });

  it('returns undefined when nested objects are deeply equal', () => {
    const prev = {nested: {x: 1, y: [1, 2]}};
    const next = {nested: {x: 1, y: [1, 2]}};

    expect(diffPartial(prev, next)).toBeUndefined();
  });

  it('includes array property when array differs deeply', () => {
    const prev = {items: [1, {a: 1}]};
    const next = {items: [1, {a: 2}]};

    expect(diffPartial(prev, next)).toEqual({items: [1, {a: 2}]});
  });

  it('ignores keys that exist only in prev (no deletion patch)', () => {
    const prev = {a: 1, b: 2};
    const next = {a: 1};

    expect(diffPartial(prev, next)).toBeUndefined();
  });

  it('includes keys that exist only in next', () => {
    const prev = {a: 1} as {a: number; b?: number};
    const next = {a: 1, b: 2};

    expect(diffPartial(prev, next)).toEqual({b: 2});
  });
});

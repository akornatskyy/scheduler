type KeyOf<T> = Extract<keyof T, string>;

type GroupByKey = string | number;

const groupBy = <T extends Record<string, unknown>>(
  items: T[],
  key: KeyOf<T>,
): Record<GroupByKey, T[]> =>
  items.reduce((result, value) => {
    (result[value[key] as GroupByKey] ??= []).push(value);
    return result;
  }, {} as Record<GroupByKey, T[]>);

type Props<G, I> = {
  groups: G[];
  items: I[];
  groupKey: KeyOf<I>;
  groupRow: (g: G) => React.ReactNode;
  itemRow: (i: I) => React.ReactNode;
};

export const GroupByList = <
  G extends {id: GroupByKey},
  I extends Record<string, unknown>,
>({
  groups,
  items,
  groupKey,
  groupRow,
  itemRow,
}: Props<G, I>): React.ReactNode[] => {
  const grouped = groupBy(items, groupKey);
  const rows: React.ReactNode[] = [];
  groups.forEach((c) => {
    const itemsByGroup = grouped[c.id];
    if (!itemsByGroup) return;

    rows.push(groupRow(c));
    rows.push(itemsByGroup.map((i) => itemRow(i)));
  });
  return rows;
};

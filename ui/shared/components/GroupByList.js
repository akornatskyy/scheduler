
function groupBy(items, key) {
  return items.reduce((result, value) => {
    (result[value[key]] = result[value[key]] || []).push(value);
    return result;
  }, {});
}

const GroupByList = ({groups, items, groupKey, groupRow, itemRow}) => {
  const grouped = groupBy(items, groupKey);
  const rows = [];
  groups.forEach((c) => {
    const itemsByGroup = grouped[c.id];
    if (!itemsByGroup) {
      return;
    }
    rows.push(groupRow(c));
    rows.push(itemsByGroup.map((i) => itemRow(i)));
  });
  return rows;
};

export default GroupByList;

import {render, screen} from '@testing-library/react';
import {GroupByList} from './GroupByList';

type Group = {id: number; name: string};

type Item = {id: string; groupId: number; label: string};

describe('GroupByList', () => {
  it('renders groups in order with their items', () => {
    const groups: Group[] = [
      {id: 1, name: 'Group 1'},
      {id: 2, name: 'Group 2'},
    ];

    const items: Item[] = [
      {id: 'a', groupId: 2, label: 'Item A'},
      {id: 'b', groupId: 1, label: 'Item B'},
      {id: 'c', groupId: 2, label: 'Item C'},
    ];

    render(
      <>
        {GroupByList<Group, Item>({
          groups,
          items,
          groupKey: 'groupId',
          groupRow: (g) => <div key={`g-${g.id}`}>GROUP {g.name}</div>,
          itemRow: (i) => <div key={`i-${i.id}`}>ITEM {i.label}</div>,
        })}
      </>,
    );

    const group1 = screen.getByText('GROUP Group 1');
    const group2 = screen.getByText('GROUP Group 2');

    expect(
      group1.compareDocumentPosition(group2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(
      group1.compareDocumentPosition(screen.getByText('ITEM Item B')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(
      group2.compareDocumentPosition(screen.getByText('ITEM Item A')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      group2.compareDocumentPosition(screen.getByText('ITEM Item C')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('skips groups that have no items', () => {
    const groups: Group[] = [
      {id: 1, name: 'Group 1'},
      {id: 2, name: 'Group 2'},
    ];

    const items: Item[] = [{id: 'b', groupId: 1, label: 'Item B'}];

    render(
      <>
        {GroupByList<Group, Item>({
          groups,
          items,
          groupKey: 'groupId',
          groupRow: (g) => <div key={`g-${g.id}`}>GROUP {g.name}</div>,
          itemRow: (i) => <div key={`i-${i.id}`}>ITEM {i.label}</div>,
        })}
      </>,
    );

    expect(screen.getByText('GROUP Group 1')).toBeVisible();
    expect(screen.getByText('ITEM Item B')).toBeVisible();
    expect(screen.queryByText('GROUP Group 2')).toBeNull();
  });

  it('renders nothing when items list is empty', () => {
    const groups: Group[] = [{id: 1, name: 'Group 1'}];

    render(
      <>
        {GroupByList<Group, Item>({
          groups,
          items: [],
          groupKey: 'groupId',
          groupRow: (g) => <div key={`g-${g.id}`}>GROUP {g.name}</div>,
          itemRow: (i) => <div key={`i-${i.id}`}>ITEM {i.label}</div>,
        })}
      </>,
    );

    expect(screen.queryByText('GROUP Group 1')).toBeNull();
  });
});

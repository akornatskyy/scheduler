import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {CollectionItem, VariableItem} from '../types';
import {GroupRow, ItemRow, VariableTable} from './VariableTable';

describe('VariableTable', () => {
  it('renders empty list', () => {
    const {container} = render(
      <VariableTable collections={[]} variables={[]} />,
    );

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const collections: CollectionItem[] = [
      {id: 'c1', name: 'My App #1', state: 'enabled'},
      {id: 'c2', name: 'My App #2', state: 'disabled'},
      {id: 'c3', name: 'My App #3', state: 'enabled'},
    ];
    const variables: VariableItem[] = [
      {
        id: 'v1',
        collectionId: 'c1',
        name: 'My Var #1',
        updated: '2025-12-15T19:16:44.057',
      },
      {
        id: 'v2',
        collectionId: 'c2',
        name: 'My Var #2',
        updated: '2025-11-18T14:10:21.178',
      },
    ];

    render(
      <Router>
        <VariableTable collections={collections} variables={variables} />
      </Router>,
    );

    expect(screen.getByText('My App #1')).toBeVisible();
    expect(screen.getByText('My App #2')).toBeVisible();
    expect(screen.queryByText('My App #3')).not.toBeInTheDocument();
    expect(screen.getByText('My Var #1')).toBeVisible();
    expect(screen.getByText('My Var #2')).toBeVisible();
  });
});

describe('GroupRow', () => {
  it('renders collection name', () => {
    const c: CollectionItem = {id: '123', name: 'My App #1', state: 'enabled'};

    render(
      <Router>
        <table>
          <tbody>
            <GroupRow collection={c} />
          </tbody>
        </table>
      </Router>,
    );

    expect(screen.getByText('My App #1')).toBeVisible();
  });
});

describe('ItemRow', () => {
  it('renders variable name', () => {
    const v: VariableItem = {
      id: '123',
      name: 'My Var',
      collectionId: 'c1',
      updated: '2025-11-18T14:10:21.178',
    };

    render(
      <Router>
        <table>
          <tbody>
            <ItemRow variable={v} />
          </tbody>
        </table>
      </Router>,
    );

    expect(screen.getByText('My Var')).toBeVisible();
  });
});

import {render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {Collection, Variable} from '../types';
import {GroupRow, ItemRow, VariableTable} from './VariableTable';

describe('variables list component', () => {
  it('renders empty list', () => {
    const collections: Collection[] = [];
    const variables: Variable[] = [];

    const {container} = render(
      <VariableTable collections={collections} variables={variables} />,
    );

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const collections: Collection[] = [
      {
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      },
      {
        id: '340de3dd',
        name: 'My App #2',
        state: 'disabled',
      },
      {
        id: '4502ad33',
        name: 'My App #3',
        state: 'enabled',
      },
    ];
    const variables: Variable[] = [
      {
        id: 'ce3457aa',
        collectionId: '65ada2f9',
        name: 'My Var #1',
        updated: '2025-12-15T19:16:44.057',
      },
      {
        id: '562da233',
        collectionId: '340de3dd',
        name: 'My Var #2',
        updated: '2025-11-18T14:10:21.178',
      },
    ];

    render(
      <Router>
        <VariableTable collections={collections} variables={variables} />
      </Router>,
    );

    expect(screen.getByText('My Var #1')).toBeVisible();
    expect(screen.getByText('My Var #2')).toBeVisible();
  });
});

describe('variables group row component', () => {
  it('renders collection name', () => {
    const c: Collection = {id: '123', name: 'My App #1', state: 'enabled'};

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

describe('variables item row component', () => {
  it('renders variable name', () => {
    const v: Variable = {
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

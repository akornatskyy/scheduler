import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen} from '@testing-library/react';

import {VariableList, GroupRow, ItemRow} from './variables-components';

describe('variables list component', () => {
  it('renders empty list', () => {
    const collections = [];
    const variables = [];

    const {container} = render(
      <VariableList collections={collections} variables={variables} />,
    );

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const collections = [
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
    const variables = [
      {
        id: 'ce3457aa',
        collectionId: '65ada2f9',
        name: 'My Var #1',
      },
      {
        id: '562da233',
        collectionId: '340de3dd',
        name: 'My Var #2',
      },
    ];

    render(
      <Router>
        <VariableList collections={collections} variables={variables} />
      </Router>,
    );

    expect(screen.getByText('My Var #1')).toBeVisible();
    expect(screen.getByText('My Var #2')).toBeVisible();
  });
});

describe('variables group row component', () => {
  it('renders collection name', () => {
    const c = {name: 'My App #1'};

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
    const v = {name: 'My Var'};

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

import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen} from '@testing-library/react';

import {JobList, JobStatus, GroupRow, ItemRow} from './jobs-components';

/**
 * @typedef {import('enzyme').ShallowWrapper} ShallowWrapper
 */

describe('jobs list component', () => {
  it('renders empty list', () => {
    const collections = [];
    const jobs = [];

    const {container} = render(
        <JobList collections={collections} jobs={jobs} />
    );

    expect(container.querySelector('tbody')).toBeEmptyDOMElement();
  });

  it('renders items', () => {
    const collections = [{
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled'
    }, {
      id: '340de3dd',
      name: 'My App #2',
      state: 'disabled'
    }, {
      id: '4502ad33',
      name: 'My App #3',
      state: 'enabled'
    }
    ];
    const jobs = [{
      id: '7ce1f17e',
      collectionId: '65ada2f9',
      name: 'My Task #1',
      schedule: '@every 15s',
      state: 'disabled',
      status: 'passing',
      errorRate: 0.2
    }, {
      id: '8d9302ad',
      collectionId: '340de3dd',
      name: 'My Task #2',
      schedule: '@every 30m',
      state: 'enabled',
      status: 'failing',
      errorRate: 0.5
    }
    ];

    render(<Router><JobList collections={collections} jobs={jobs} /></Router>);

    expect(screen.getByText('My App #1')).toBeVisible();
    expect(screen.getByText('My App #2')).toBeVisible();
    expect(screen.queryByText('My App #3')).not.toBeInTheDocument();
    expect(screen.getByText('My Task #1')).toBeVisible();
    expect(screen.getByText('My Task #2')).toBeVisible();
  });
});

describe('job status component', () => {
  it.each(
      ['disabled', 'enabled']
          .map((state) => ['ready', 'passing', 'failing', 'running']
              .map((status) => [state, status]))
          .flatMap((e) => e)
  )('renders %s and %s', (state, status) => {
    const job = {state, status};

    render(<JobStatus job={job} />);

    expect(screen.getByText((content) => content.includes(status)))
        .toBeVisible();
  });
});

describe('jobs group row component', () => {
  it.each(
      ['disabled', 'enabled']
  )('renders collection name in state %s', (state) => {
    const c = {name: 'My App #1', state};

    render(
        <Router>
          <table>
            <tbody><GroupRow collection={c} /></tbody>
          </table>
        </Router>
    );

    expect(screen.getByText('My App #1')).toBeVisible();
  });
});

describe('jobs item row component', () => {
  it('renders job name', () => {
    const j = {name: 'My Job'};

    render(
        <Router>
          <table>
            <tbody><ItemRow job={j} /></tbody>
          </table>
        </Router>
    );

    expect(screen.getByText('My Job')).toBeVisible();
  });
});

import React from 'react';
import update from 'immutability-helper';

import {Layout} from '../../shared/components';
import * as api from './job-api';
import {JobForm} from './job-components';

export default class Job extends React.Component {
  state = {
    item: {
      name: '',
      state: '',
      schedule: '',
      collectionId: '',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: '',
          headers: [],
          body: '',
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m',
        },
      },
    },
    collections: [],
    pending: true,
    errors: {},
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    if (id) {
      this.setState({pending: true});
      api
        .retrieveJob(id)
        .then((data) => this.setState({item: data, pending: false}))
        .catch((errors) => this.setState({errors, pending: false}));
    } else {
      this.setState({
        item: {
          ...this.state.item,
          state: 'enabled',
        },
        pending: false,
      });
    }
    api
      .listCollections()
      .then(({items}) =>
        this.setState(({item}) => {
          const s = {collections: items};
          if (!item.collectionId) {
            if (items.length > 0) {
              s.item = {
                ...item,
                collectionId: items[0].id,
              };
            } else {
              s.errors = {
                collectionId: 'There is no collection available.',
              };
            }
          }

          return s;
        }),
      )
      .catch((errors) => this.setState({errors}));
  }

  handleItemChange = (name, value) => {
    this.setState({
      item: {
        ...this.state.item,
        [name]: value,
      },
    });
  };

  handleActionChange = (name, value) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          [name]: {$set: value},
        },
      }),
    });
  };

  handleRequestChange = (name, value) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            [name]: {$set: value},
          },
        },
      }),
    });
  };

  handlePolicyChange = (name, value) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          retryPolicy: {
            [name]: {$set: value},
          },
        },
      }),
    });
  };

  handleHeaderChange = (name, value, i) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            headers: {
              [i]: {[name]: {$set: value}},
            },
          },
        },
      }),
    });
  };

  handleAddHeader = () => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            headers: {
              $push: [{name: '', value: ''}],
            },
          },
        },
      }),
    });
  };

  handleDeleteHeader = (i) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            headers: {
              $splice: [[i, 1]],
            },
          },
        },
      }),
    });
  };

  handleSave = () => {
    this.setState({pending: true});
    api
      .saveJob(this.state.item)
      .then(() => this.props.history.goBack())
      .catch((errors) => this.setState({errors, pending: false}));
  };

  handleDelete = () => {
    const {id, etag} = this.state.item;
    this.setState({pending: true});
    api
      .deleteJob(id, etag)
      .then(() => this.props.history.goBack())
      .catch((errors) => this.setState({errors, pending: false}));
  };

  render() {
    const {item, collections, pending, errors} = this.state;
    return (
      <Layout title={`Job ${item.name}`} errors={errors}>
        <JobForm
          item={item}
          collections={collections}
          pending={pending}
          errors={errors}
          onItemChange={this.handleItemChange}
          onActionChange={this.handleActionChange}
          onRequestChange={this.handleRequestChange}
          onPolicyChange={this.handlePolicyChange}
          onHeaderChange={this.handleHeaderChange}
          onAddHeader={this.handleAddHeader}
          onDeleteHeader={this.handleDeleteHeader}
          onSave={this.handleSave}
          onDelete={this.handleDelete}
        />
      </Layout>
    );
  }
}

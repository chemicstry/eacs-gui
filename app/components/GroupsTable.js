import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as rpc from '../utils/rpc';
import { Table, Popover, Tag, Button, message } from 'antd';

const { Column } = Table;

export default class GroupsTable extends Component {
  state = {
    groups: []
  }

  async fetchGroups() {
    var groups = await rpc.client.call('getGroups');
    groups.forEach((group) => {
      group.key = group.id;
    });
    console.log(groups);
    this.setState({groups})
  }

  componentDidMount() {
    this.fetchGroups();
  }

  async deleteGroup(id) {
    var res = await rpc.client.call('deleteGroup', id);
    if (res)
      message.success('Group deleted!');
    else
      message.error('Error deleting group');

    this.fetchGroups();
  }

  render() {
    return (
      <Table dataSource={this.state.groups}>
        <Column
          title="ID"
          dataIndex="id"
          key="id"
        />
        <Column
          title="Name"
          dataIndex="name"
          key="name"
        />
        <Column
          title="Permissions"
          dataIndex="permissions"
          key="permissions"
          render={permissions => (
            <span>{permissions.map(permission => <Tag key={permission}>{permission}</Tag>)}</span>
          )}
        />
        <Column
          title="Actions"
          key="actions"
          render={(actions, group) => (
            <span>
              <Link to={'/group/'+group.id}><Button icon="edit" type="primary" /></Link>&nbsp;
              <Button icon="delete" type="danger" onClick={() => this.deleteGroup(group.id)} />
            </span>
          )}
        />
      </Table>
    )
  }
}

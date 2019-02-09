import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as rpc from '../utils/rpc';
import { Table, Popover, Tag, Button, message } from 'antd';

const { Column } = Table;

export default class UsersTable extends Component {
  state = {
    users: []
  }

  async fetchUsers() {
    var users = await rpc.client.call('admin:getUsers');
    users.forEach((user) => {
      user.key = user.id;
    });
    console.log(users);
    this.setState({users})
  }

  async componentDidMount() {
    this.fetchUsers();
  }

  async deleteUser(id) {
    var res = await rpc.client.call('admin:deleteUser', id);
    if (res)
      message.success('User deleted!');
    else
      message.error('Error deleting user');

    this.fetchUsers();
  }

  render() {
    return (
      <Table dataSource={this.state.users} size="middle">
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
          title="Tags"
          dataIndex="tags"
          key="tags"
          render={tags => (
            <Popover content={<div>{tags.map(tag => <p key={tag}>{tag}</p>)}</div>} title="Tags">
              {tags.length}
            </Popover>
          )}
        />
        <Column
          title="Groups"
          dataIndex="groups"
          key="groups"
          render={groups => (
            <span>{groups.map(group => <Tag key={group}>{group}</Tag>)}</span>
          )}
        />
        <Column
          title="Actions"
          key="actions"
          render={(actions, user) => (
            <span>
              <Link to={'/user/'+user.id}><Button icon="edit" type="primary" /></Link>&nbsp;
              <Button icon="delete" type="danger" onClick={() => this.deleteUser(user.id)} />
            </span>
          )}
        />
      </Table>
    )
  }
}

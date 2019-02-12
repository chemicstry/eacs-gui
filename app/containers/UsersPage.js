import React, { Component } from 'react';
import UsersTable from '../components/UsersTable';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { default as save } from 'save-file/browser';
import { readFileSync } from 'fs';
import * as fileDialog from 'file-dialog';
import * as rpc from '../utils/rpc';
import { JSON_stringify_unicode } from '../utils/json';

export default class UsersPage extends Component {
  state = {
    refresh: false
  }

  refresh()
  {
    const {refresh} = this.state;
    this.setState({
      refresh: !refresh
    })
  }

  async exportUsers()
  {
    const users = await rpc.client.call('admin:getUsers');
    await save(JSON_stringify_unicode(users), "users.json");
  }

  async importUsers()
  {
    const files = await fileDialog();
    const users = JSON.parse(readFileSync(files[0].path));
    for (let user of users) {
      user.id = undefined;
      await rpc.client.call('admin:upsertUser', user);
    }
    this.refresh();
  }

  render() {
    const { refresh } = this.state;
    return (
      <div>
        <UsersTable refresh={refresh} /><br/>
        <Link to={'/user/0'}><Button type="primary">Create User</Button></Link>
        &nbsp;<Button onClick={() => this.exportUsers()}>Export Users</Button>
        &nbsp;<Button onClick={() => this.importUsers()}>Import Users</Button>
      </div>
    )
  }
}

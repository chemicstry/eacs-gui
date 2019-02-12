import React, { Component } from 'react';
import GroupsTable from '../components/GroupsTable';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { default as save } from 'save-file/browser';
import { readFileSync } from 'fs';
import * as fileDialog from 'file-dialog';
import * as rpc from '../utils/rpc';
import { JSON_stringify_unicode } from '../utils/json';

export default class GroupsPage extends Component {
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

  async exportGroups()
  {
    const groups = await rpc.client.call('admin:getGroups');
    await save(JSON_stringify_unicode(groups), "groups.json");
  }

  async importGroups()
  {
    const files = await fileDialog();
    const groups = JSON.parse(readFileSync(files[0].path));
    for (let group of groups) {
      group.id = undefined;
      await rpc.client.call('admin:upsertGroup', group);
    }
    this.refresh();
  }

  render() {
    const { refresh } = this.state;
    return (
      <div>
        <GroupsTable refresh={refresh} /><br/>
        <Link to={'/group/0'}><Button type="primary">Create Group</Button></Link>
        &nbsp;<Button onClick={() => this.exportGroups()}>Export Groups</Button>
        &nbsp;<Button onClick={() => this.importGroups()}>Import Groups</Button>
      </div>
    )
  }
}

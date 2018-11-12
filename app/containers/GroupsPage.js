import React, { Component } from 'react';
import GroupsTable from '../components/GroupsTable';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

export default class GroupsPage extends Component {
  render() {
    return (
      <div>
        <GroupsTable />
        <Link to={'/group/0'}><Button type="primary">Create Group</Button></Link>
      </div>
    )
  }
}

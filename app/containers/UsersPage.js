import React, { Component } from 'react';
import UsersTable from '../components/UsersTable';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

export default class UsersPage extends Component {
  render() {
    return (
      <div>
        <UsersTable /><br/>
        <Link to={'/user/0'}><Button type="primary">Create User</Button></Link>
      </div>
    )
  }
}

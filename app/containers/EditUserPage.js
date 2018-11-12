import React, { Component } from 'react';
import * as rpc from '../utils/rpc';
import EditUser from '../components/EditUser';
import { Spin } from 'antd';

export default class EditUserPage extends Component {
  state = {
    loading: true
  }

  async componentDidMount() {
    // Fetch user data if existing user is being edited
    var id = this.props.match.params.id;
    if (id)
    {
      var users = await rpc.client.call('getUsers');
      var userData = users.find((e) => {
        return e.id == id
      });
      console.log(userData);
      this.setState({userData});
    }
  
    this.setState({loading: false});
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          <div style={{textAlign:'center'}}>
            <Spin />
          </div>
        ) : (
          <EditUser userData={this.state.userData} />
        )}
      </div>
    )
  }
}

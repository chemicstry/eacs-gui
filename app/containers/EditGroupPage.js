import React, { Component } from 'react';
import * as rpc from '../utils/rpc';
import EditGroup from '../components/EditGroup';
import { Spin } from 'antd';

export default class EditGroupPage extends Component {
  state = {
    loading: true
  }

  async componentDidMount() {
    // Fetch user data if existing group is being edited
    var id = this.props.match.params.id;
    if (id)
    {
      var groups = await rpc.client.call('getGroups');
      var groupData = groups.find((e) => {
        return e.id == id
      });
      console.log(groupData);
      this.setState({groupData});
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
          <EditGroup groupData={this.state.groupData} />
        )}
      </div>
    )
  }
}

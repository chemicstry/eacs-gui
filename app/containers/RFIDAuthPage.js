import React, { Component } from 'react';
import * as nfc from '../utils/nfc';
import * as rpc from '../utils/rpc';
import { Row, Spin, Alert, Button } from 'antd';

const requiredPermissions = [
  "admin:getUsers",
  "admin:upsertUser",
  "admin:deleteUser",
  "admin:getGroups",
  "admin:upsertGroup",
  "admin:deleteGroup",
  "rfid:initKey"
];

export default class RFIDAuthPage extends Component {
  state = {
    error: null,
  }

  async waitForTag()
  {
    // Reset state
    this.setState({
      error: null
    });

    // Bind backwards rpc call to cryptographically authenticate tag
    rpc.client.bind("rfid:transceive", async (data) => {
      try {
        var resp = await nfc.dataExchange(Buffer.from(data, 'hex'));
        return resp.toString('hex');
      } catch (error) {
        console.log(error);
        this.setState({error});
      }
    });

    try {
      var tagInfo = await nfc.readTagInfo();
      var permissions = await rpc.client.call("rfid:authSocket", tagInfo);
      console.log(permissions);

      // Check if we got all required permissions
      for (let permission of requiredPermissions) {
        console.log(permission);
        if (!permissions.includes(permission))
          throw new Error(`User is not authorised to call ${permission}`);
      }

      this.props.history.push('/users');
    } catch(error) {
      console.log(error);
      this.setState({error});
    }
  }

  componentDidMount()
  {
    this.waitForTag();
  }

  render() {
    return (
      <div>
        {this.state.error === null ? (
          <div>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Spin />
            </Row>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              Waiting for RFID tag with admin permission
            </Row>
          </div>
        ) : (
          <div>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Alert message={this.state.error.toString()} type="error" />
            </Row>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Button onClick={() => this.waitForTag()}>Retry</Button>
            </Row>
          </div>
        )}
      </div>
    )
  }
}

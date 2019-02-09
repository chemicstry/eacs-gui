import React, { Component } from 'react';
import * as nfc from '../utils/nfc';
import * as rpc from '../utils/rpc';
import { Row, Spin, Alert, Button } from 'antd';


export default class InitKeyPage extends Component {
  state = {
    error: null,
    success: false
  }

  async waitForTag()
  {
    // Reset state
    this.setState({
      error: null,
      success: false
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
      if (!await rpc.client.call("rfid:initKey", tagInfo))
        throw new Error("Key initialization failed. Is the card already initialized?");

      this.setState({
        success: true
      })
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
        {this.state.error === null && this.state.success === false ? (
          <div>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Spin />
            </Row>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              Waiting for an empty RFID tag
            </Row>
          </div>
        ) : ''}
        {this.state.error ? (
          <div>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Alert message={this.state.error.toString()} type="error" />
            </Row>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Button onClick={() => this.waitForTag()}>Retry</Button>
            </Row>
          </div>
        ) : ''}
        {this.state.success ? (
          <div>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Alert message="Tag key initialization successful" type="success" />
            </Row>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Button onClick={() => this.waitForTag()}>Repeat</Button>
            </Row>
          </div>
        ) : ''}
      </div>
    )
  }
}

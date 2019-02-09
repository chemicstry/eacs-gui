import React, { Component } from 'react';
import * as nfc from '../utils/nfc';
import * as rpc from '../utils/rpc';
import { Row, Col, Spin, Alert, Button, Tag } from 'antd';

export default class TagInfoPage extends Component {
  state = {
    error: null,
    info: null
  }

  async waitForTag()
  {
    // Reset state
    this.setState({
      error: null,
      info: null
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
      var info = await rpc.client.call("rfid:tagInfo", tagInfo);

      console.log(info);

      this.setState({info});
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
    let info = this.state.info;

    return (
      <div>
        {this.state.error === null && this.state.info === null ? (
          <div>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Spin />
            </Row>
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              Waiting for RFID tag
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
        {this.state.info ? (
          <div>
            <Row style={{marginTop: 20}}>
              <Col span={6} offset={6}>UID</Col>
              <Col span={12}>{info.UID}</Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={6} offset={6}>Crypto Auth</Col>
              <Col span={12}>{info.cryptoAuth ? <Tag color="green">success</Tag> : <Tag color="red">failed</Tag>}</Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={6} offset={6}>User ID</Col>
              <Col span={12}>{info.userId ? info.userId : <Tag color="red">not found</Tag>}</Col>
            </Row>
            {info.userId ? (
              <Row style={{marginTop: 20}}>
                <Col span={6} offset={6}>Name</Col>
                <Col span={12}>{info.user.name}</Col>
              </Row>
            ) : ''}
            {info.permissions ? (
              <Row style={{marginTop: 20}}>
                <Col span={6} offset={6}>Permissions</Col>
                <Col span={12}>{info.permissions.map(permission => <Tag key={permission}>{permission}</Tag>)}</Col>
              </Row>
            ) : ''}
            <Row type="flex" justify="center" style={{marginTop: 20}}>
              <Button onClick={() => this.waitForTag()}>Repeat</Button>
            </Row>
          </div>
        ) : ''}
      </div>
    )
  }
}

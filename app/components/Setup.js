import React, { Component } from 'react';
import SetupForm from './SetupForm';
import * as rpc from '../utils/rpc';
import * as nfc from '../utils/nfc';
import { Spin, Alert, Button, Icon } from 'antd';
import { readFileSync } from 'fs';
import { withRouter } from 'react-router-dom';

export default withRouter(class Setup extends Component {
  state = {
    connecting: false,
    error: false
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async onSubmit(e) {
    console.log(e);
    try {
      this.setState({error: false});
      this.setState({connecting: true});

      let cert = readFileSync(e.serverCert.fileList[0].originFileObj.path);
      await rpc.connect(e.userAuthServiceAddress, e.authToken, cert);

      if (e.serialEnabled)
        await nfc.initNFC(e.serialPort);
      
      this.props.history.push('/users');
    } catch (e) {
      console.log(e);
      this.setState({error: e});
      this.setState({connecting: false});
    }
  }

  render() {
    return (
      <div>
        { this.state.error ? (
          <div>
            <Alert message={"Connection failed: " + this.state.error} type="error" /><br/>
            <Button type="primary" onClick={() => this.setState({error: false})}>
              <Icon type="left" />Back
            </Button>
          </div>
        ) : (
          this.state.connecting ? (
            <div style={{textAlign:'center'}}>
              <Spin />
            </div>
          ) : (
            <SetupForm onSubmit={(e) => this.onSubmit(e)} />
          )
        )}
      </div>
    );
  }
})
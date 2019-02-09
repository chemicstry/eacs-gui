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

      if (e.rfidEnabled)
        await nfc.initNFC(e.serialPort);
      
      if (e.authMethod == 'token') {
        await rpc.connect(e.serverAddress, e.serverFingerprint, e.authToken);
        this.props.history.push('/users');
      } else if (e.authMethod == 'rfid') {
        await rpc.connect(e.serverAddress, e.serverFingerprint);
        this.props.history.push('/rfidAuth');
      } else {
        throw Error(`Unknown auth method ${e.authMethod}`);
      }
      
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
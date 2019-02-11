import React, { Component } from 'react';
import {
  Form,
  Input,
  Button,
  Icon,
  Tooltip,
  Select,
  Divider,
  Switch,
  Radio,
  message
} from 'antd';
import * as fileDialog from 'file-dialog';
import { readFileSync } from 'fs';
import { pki, md, asn1 } from 'node-forge';
import { FindService } from '../utils/mdns';
import * as nfc from '../utils/nfc';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class SetupForm extends Component {
  state = {
    serialPorts: [],
    authMethod: 'token',
    rfidEnabled: false
  };

  componentDidMount() {
    this.updateSerialPorts();

    // load previous values
    try {
      const values = JSON.parse(localStorage.getItem('setupFormData'));
      console.log(values);
      if (values) {
        const { form } = this.props;
        form.setFieldsValue(values);
        this.setState({
          authMethod: values.authMethod,
          rfidEnabled: values.rfidEnabled
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async updateSerialPorts() {
    const ports = await nfc.listPorts();
    this.setState({ serialPorts: ports });
  }

  async fetchmdns() {
    try {
      const service = await FindService({
        type: 'eacs-server'
      });

      if (!service.addresses.length) {
        message.error('mDNS response does not contain any address');
        return;
      }

      console.log(service);

      const address = `wss://${service.addresses[0]}:${service.port}`;

      const { form } = this.props;
      form.setFieldsValue({
        serverAddress: address
      });
    } catch (e) {
      message.error(e);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // Save options to local storage, except the auth token
        const { authToken, ...safeValues } = values;
        localStorage.setItem('setupFormData', JSON.stringify(safeValues));

        // Proceed
        const { onSubmit } = this.props;
        onSubmit(values);
      }
    });
  }

  handleRfidEnabled(e) {
    this.setState({
      rfidEnabled: e
    });

    if (!e) {
      this.setState({
        authMethod: 'token'
      });
      const { form } = this.props;
      form.setFieldsValue({
        authMethod: 'token'
      });
    }
  }

  handleAuthMethodChange(e) {
    this.setState({
      authMethod: e.target.value
    });
    console.log(e);
  }

  renderCertificateSelect() {
    const { form } = this.props;

    function certToFingerprint(cert) {
      const hash = md.sha1
        .create()
        .update(
          asn1
            .toDer(pki.certificateToAsn1(pki.certificateFromPem(cert)))
            .getBytes()
        )
        .digest()
        .toHex();
      const chunks = hash.toUpperCase().match(/.{1,2}/g);
      return chunks.join(':');
    }

    async function selectFile() {
      fileDialog()
        .then(files => {
          console.log(`Loading certificate file: ${files[0].path}`);
          const cert = readFileSync(files[0].path);

          const fingerprint = certToFingerprint(cert);

          console.log(`Fingerprint: ${fingerprint}`);

          form.setFieldsValue({
            serverFingerprint: fingerprint
          });

          return fingerprint;
        })
        .catch(e => {
          message.error(e);
        });
    }

    return (
      <Tooltip title="Fetch from certificate file">
        <Icon type="file" onClick={() => selectFile()} />
      </Tooltip>
    );
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { serialPorts, rfidEnabled, authMethod } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6, offset: 0 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 18, offset: 6 }
      }
    };

    return (
      <Form onSubmit={e => this.handleSubmit(e)}>
        <Divider orientation="left">Connection</Divider>
        <FormItem label="Server URL" {...formItemLayout}>
          {getFieldDecorator('serverAddress', {
            rules: [{ required: true, message: 'Please enter server address' }]
          })(
            <Input
              placeholder="Server Address"
              addonAfter={
                <Tooltip title="Fetch from mDNS">
                  <Icon type="sync" onClick={() => this.fetchmdns()} />
                </Tooltip>
              }
            />
          )}
        </FormItem>
        <FormItem label="Fingerprint" {...formItemLayout}>
          {getFieldDecorator('serverFingerprint', {
            rules: [
              {
                required: true,
                message: 'Please enter sha1 server fingerprint'
              }
            ]
          })(
            <Input
              placeholder="Server Fingerprint"
              addonAfter={this.renderCertificateSelect()}
            />
          )}
        </FormItem>
        <Divider orientation="left">RFID Integration</Divider>
        <FormItem label="Enabled" {...formItemLayout}>
          {getFieldDecorator('rfidEnabled', {
            rules: [{ required: false }],
            valuePropName: 'checked'
          })(<Switch onChange={e => this.handleRfidEnabled(e)} />)}
        </FormItem>
        <FormItem label="Serial Port" {...formItemLayout}>
          <Input.Group>
            {getFieldDecorator('serialPort', {
              rules: [
                {
                  required: false,
                  message: 'Please select PN532 reader serial port'
                }
              ]
            })(
              <Select
                placeholder="NFC reader serial port"
                style={{ minWidth: '200px' }}
              >
                {serialPorts.map(port => (
                  <Select.Option key={port.comName} value={port.comName}>
                    {port.comName} ({port.manufacturer})
                  </Select.Option>
                ))}
              </Select>
            )}
            <Button
              icon="sync"
              onClick={() => this.updateSerialPorts()}
              style={{ marginLeft: 10 }}
            />
          </Input.Group>
        </FormItem>
        <Divider orientation="left">Authentication</Divider>
        <FormItem label="Method" {...formItemLayout}>
          {getFieldDecorator('authMethod', {
            rules: [
              { required: true, message: 'Please select authentication method' }
            ],
            initialValue: 'token'
          })(
            <RadioGroup
              buttonStyle="solid"
              onChange={e => this.handleAuthMethodChange(e)}
            >
              <RadioButton value="token">Token</RadioButton>
              <RadioButton value="rfid" disabled={!rfidEnabled}>
                RFID
              </RadioButton>
            </RadioGroup>
          )}
        </FormItem>
        {authMethod === 'token' ? (
          <FormItem label="Auth Token" {...formItemLayout}>
            {getFieldDecorator('authToken', {
              rules: [
                { required: true, message: 'Please enter authentication token' }
              ]
            })(<Input placeholder="Authentication Token" />)}
          </FormItem>
        ) : (
          ''
        )}
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="primary" htmlType="submit">
            Connect
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(SetupForm);

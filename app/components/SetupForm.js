import React, { Component } from 'react';
import { Form, Input, Button, Icon, Tooltip, Upload, Select, Divider, Switch, message } from 'antd';
import * as mdns from 'mdns';
import * as nfc from '../utils/nfc'

const FormItem = Form.Item;

class SetupForm extends Component {
  state = {
    serialPorts: []
  }

  componentDidMount() {
    this.updateSerialPorts();

    //load previous values
    try {
      let values = JSON.parse(localStorage.getItem('setupFormData'));
      if (values)
        this.props.form.setFieldsValue(values);
    } catch(e) {}
  }

  async updateSerialPorts() {
    var ports = await nfc.listPorts();
    this.setState({serialPorts: ports});
  }

  async fetchmdns() {
    try {
      var address = await new Promise((resolve, reject) => {
        var browser = mdns.createBrowser(mdns.tcp('eacs-user-auth'));

        var timer = setTimeout(() => reject('Service not found'), 3000);

        browser.on('serviceUp', (service) => {
          console.log(service);
          if (service.addresses.length)
          {
            resolve("wss://" + service.addresses[0] + ":" + service.port);
            browser.stop();
            clearTimeout(timer);
          }
        });
        browser.start();
      });

      this.props.form.setFieldsValue({
        userAuthServiceAddress: address
      })
    } catch(e) {
      message.error(e);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        localStorage.setItem('setupFormData', JSON.stringify(values));
        this.props.onSubmit(values);
      }
    });
  }

  render() {
    const { getFieldDecorator, setFieldValue } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6, offset: 0 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 18, offset: 6 },
      },
    };

    return (
      <Form onSubmit={(e) => this.handleSubmit(e)}>
        <Divider orientation="left">Connection</Divider>
        <FormItem label="User Auth URL" {...formItemLayout}>
          {getFieldDecorator('userAuthServiceAddress', {
            rules: [{ required: true, message: 'Please user authentication service address' }],
          })(
            <Input placeholder="User Auth Service Address" addonAfter={<Tooltip title="Fetch from mDNS"><Icon type="sync" onClick={() => this.fetchmdns()} /></Tooltip>} />
          )}
        </FormItem>
        <FormItem label="Auth Token" {...formItemLayout}>
          {getFieldDecorator('authToken', {
            rules: [{ required: true, message: 'Please enter authentication token' }],
          })(
            <Input placeholder="Authentication Token" />
          )}
        </FormItem>
        <FormItem label="Certificate" {...formItemLayout}>
          {getFieldDecorator('serverCert', {
            rules: [{ required: true, message: 'Please select user authentication service certificate' }],
          })(
            <Upload>
              <Button>
                <Icon type="upload" /> Select User Auth Service Certificate
              </Button>
            </Upload>
          )}
        </FormItem>
        <Divider orientation="left">RFID Integration</Divider>
        <FormItem label="Enabled" {...formItemLayout}>
          {getFieldDecorator('serialEnabled', {
            rules: [{ required: false }],
          })(
            <Switch />
          )}
        </FormItem>
        <FormItem label="Serial Port" {...formItemLayout}>
          <Input.Group>
          {getFieldDecorator('serialPort', {
            rules: [{ required: false, message: 'Please select PN532 reader serial port' }],
          })(
            <Select placeholder="NFC reader serial port">
              {this.state.serialPorts.map(port => (<Select.Option key={port.comName} value={port.comName}>{port.comName} ({port.manufacturer})</Select.Option>))}
            </Select>
          )}
          <Button icon="sync" onClick={() => this.updateSerialPorts()} style={{marginLeft:10}} />
          </Input.Group>
        </FormItem>
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button
            type="primary"
            htmlType="submit"
          >
            Connect
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(SetupForm);

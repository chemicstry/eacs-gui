import React, { Component } from 'react';
import { Form, Input, Button, Icon, Tooltip, Upload, Select, Modal, Checkbox, message } from 'antd';
import { history } from '../store/configureStore';
import * as nfc from '../utils/nfc';
import * as rpc from '../utils/rpc';

const FormItem = Form.Item;

class EditUser extends Component {
  async componentWillMount() {
    if (!this.props.userData){
      this.setState({
        name: 'New User',
        tags: [],
        groups: []
      })
    } else {
      this.setState(this.props.userData)
    }

    // Fetch available groups
    var availableGroups = await rpc.client.call('getGroups');
    availableGroups = availableGroups.map((group) => {
      return group.name;
    })
    console.log(availableGroups);
    this.setState({availableGroups});
  }

  componentDidMount() {
    this.props.form.setFieldsValue({
      name: this.state.name,
      tags: this.state.tags,
      groups: this.state.groups
    });
  }

  removeTag(index) {
    var tags = this.props.form.getFieldValue('tags');
    tags.splice(index, 1);
    this.setState({tags});
    this.props.form.setFieldsValue({tags});
  }

  addTag(uid = "") {
    var tags = [...this.state.tags, uid];
    this.setState({tags})
    this.props.form.setFieldsValue({tags});
  }

  async addTagRFID() {
    var reading = Modal.info({title: 'Waiting for tag on RFID reader...', okText: 'Cancel'});
    var UID = await nfc.readUID();
    reading.destroy();
    this.addTag(UID);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        // Check if it's existing user
        if (this.state.id)
          values.id = this.state.id
        
        // Fix tags array
        if (!values.tags)
          values.tags = [];
        
        var res = await rpc.client.call('upsertUser', values);
        if (res)
          message.success('User saved!');
        else
          message.error('Error saving user');
        
        history.push('/users');
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4, offset: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 6 },
      },
    };
    
    return (
      <Form onSubmit={(e) => this.handleSubmit(e)}>
        <FormItem label="Name" {...formItemLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter name' }],
          })(
            <Input />
          )}
        </FormItem>
        
        {this.state.tags.map((tag, index) => (
          <FormItem
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            label={index === 0 ? 'Tags' : ''}
            key={index}
          >
            {getFieldDecorator(`tags[${index}]`, {
              rules: [{ required: true, message: 'Please enter tag UID' }],
            })(
              <Input
                placeholder="Tag UID"
                addonAfter={<Icon style={{cursor:'pointer'}} type="minus-circle-o" onClick={() => this.removeTag(index)} />}
              />
            )}
            
          </FormItem>
        ))}
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={() => this.addTag()}>
            <Icon type="plus" /> Add tag
          </Button>&nbsp;
          <Button type="dashed" onClick={() => this.addTagRFID()}>
            <Icon type="plus" /> Add tag (From RFID)
          </Button>
        </FormItem>
        <FormItem label="Groups" {...formItemLayout}>
          {getFieldDecorator('groups', {
            rules: [{ required: false, message: 'Please select groups' }],
          })(
            <Checkbox.Group options={this.state.availableGroups} />
          )}
        </FormItem>
        <FormItem {...formItemLayoutWithOutLabel} style={{textAlign:'right'}}>
          <Button
            type="primary"
            htmlType="submit"
          >
            Save
          </Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create()(EditUser);

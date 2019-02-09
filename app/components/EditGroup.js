import React, { Component } from 'react';
import { Form, Input, Button, Icon, Tooltip, Upload, Select, Modal, Checkbox, message } from 'antd';
import { history } from '../store/configureStore';
import * as rpc from '../utils/rpc';

const FormItem = Form.Item;

class EditGroup extends Component {
  async componentWillMount() {
    if (!this.props.groupData){
      this.setState({
        name: 'New Group',
        permissions: [],
      })
    } else {
      this.setState(this.props.groupData)
    }
  }

  componentDidMount() {
    this.props.form.setFieldsValue({
      name: this.state.name,
      permissions: this.state.permissions,
    });
  }

  removePermission(index) {
    var permissions = this.props.form.getFieldValue('permissions');
    permissions.splice(index, 1);
    this.setState({permissions});
    this.props.form.setFieldsValue({permissions});
  }

  addPermission() {
    if (this.state.permissions.length)
      var permissions = [...this.props.form.getFieldValue('permissions'), ""];
    else
      var permissions = [""];

    this.setState({permissions})
    this.props.form.setFieldsValue({permissions});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        // Check if it's existing group
        if (this.state.id)
          values.id = this.state.id
        
        // Fix tags array
        if (!values.permissions)
          values.permissions = [];
        
        var res = await rpc.client.call('admin:upsertGroup', values);
        if (res)
          message.success('Group saved!');
        else
          message.error('Error saving group');
        
        history.push('/groups');
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
        
        {this.state.permissions.map((tag, index) => (
          <FormItem
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            label={index === 0 ? 'Permissions' : ''}
            key={index}
          >
            {getFieldDecorator(`permissions[${index}]`, {
              rules: [{ required: true, message: 'Please enter permission name' }],
            })(
              <Input
                placeholder="Permission Name"
                addonAfter={<Icon style={{cursor:'pointer'}} type="minus-circle-o" onClick={() => this.removePermission(index)} />}
              />
            )}
            
          </FormItem>
        ))}
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={() => this.addPermission()}>
            <Icon type="plus" /> Add permission
          </Button>&nbsp;
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

export default Form.create()(EditGroup);

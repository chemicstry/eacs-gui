import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as rpc from '../utils/rpc';
import { Table, Popover, Tag, Button, Input, Icon, message } from 'antd';
import Highlighter from 'react-highlight-words';

const { Column } = Table;

export default class GroupsTable extends Component {
  state = {
    groups: [],
    permissions: [] // list of all permissions for filtering
  }

  async fetchGroups() {
    var groups = await rpc.client.call('admin:getGroups');
    var permissions = [];
    groups.forEach((group) => {
      group.key = group.id;
      group.permissions.forEach(permission => {
        if (!permissions.includes(permission))
          permissions.push(permission);
      })
    });
    console.log(groups);
    this.setState({groups, permissions})
  }

  componentDidMount() {
    this.fetchGroups();
  }

  async deleteGroup(id) {
    var res = await rpc.client.call('admin:deleteGroup', id);
    if (res)
      message.success('Group deleted!');
    else
      message.error('Error deleting group');

    this.fetchGroups();
  }

  componentWillReceiveProps(props) {
    const {refresh} = this.props;
    if (refresh !== props.refresh)
      this.fetchGroups();
  }

  renderPermissions(permissions) {
    const maxShown = 2;
    var shown = permissions.slice(0, maxShown).map(permission => <Tag key={permission}>{permission}</Tag>);
    if (permissions.length <= maxShown)
      return <div>{shown}</div>;

    var hidden = (<Popover content={<div>{permissions.slice(maxShown).map(permission => <div key={permission}>{permission}</div>)}</div>} title="Permissions">
      <Tag color="blue">+{permissions.length-maxShown}</Tag>
    </Popover>)
    return <div>{shown}{hidden}</div>;
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { this.searchInput = node; }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    ),
  })

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  render() {
    var permissionsFilter = this.state.permissions.map((p) => {return {text: p, value: p}});
  
    return (
      <Table dataSource={this.state.groups}>
        <Column
          title="ID"
          dataIndex="id"
          key="id"
          sorter={(a, b) => a.id - b.id }
          {...this.getColumnSearchProps('id')}
        />
        <Column
          title="Name"
          dataIndex="name"
          key="name"
          sorter={(a, b) => (a.name < b.name ? -1 : 1)}
          {...this.getColumnSearchProps('name')}
        />
        <Column
          title="Permissions"
          dataIndex="permissions"
          key="permissions"
          render={permissions => this.renderPermissions(permissions)}
          filters={permissionsFilter}
          onFilter={(value, record) => record.permissions.includes(value)}
        />
        <Column
          title="Actions"
          key="actions"
          render={(actions, group) => (
            <span>
              <Link to={'/group/'+group.id}><Button icon="edit" type="primary" /></Link>&nbsp;
              <Button icon="delete" type="danger" onClick={() => this.deleteGroup(group.id)} />
            </span>
          )}
        />
      </Table>
    )
  }
}

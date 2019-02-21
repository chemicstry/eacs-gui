import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as rpc from '../utils/rpc';
import { Table, Popover, Tag, Button, Input, Icon, message } from 'antd';
import Highlighter from 'react-highlight-words';

const { Column } = Table;

export default class UsersTable extends Component {
  state = {
    users: [],
    groups: [] // Used for filtering
  }

  async fetchUsers() {
    var users = await rpc.client.call('admin:getUsers');
    var groups = [];
    users.forEach((user) => {
      user.key = user.id;
      user.groups.forEach(group => {
        if (!groups.includes(group))
          groups.push(group);
      });
    });
    console.log(users);
    this.setState({users, groups})
  }

  async componentDidMount() {
    this.fetchUsers();
  }

  async deleteUser(id) {
    var res = await rpc.client.call('admin:deleteUser', id);
    if (res)
      message.success('User deleted!');
    else
      message.error('Error deleting user');

    this.fetchUsers();
  }

  componentWillReceiveProps(props) {
    const {refresh} = this.props;
    if (refresh !== props.refresh)
      this.fetchUsers();
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
    var groupsFilter = this.state.groups.map((group) => {return {text: group, value: group}});
  
    return (
      <Table dataSource={this.state.users} size="middle">
        <Column
          title="ID"
          dataIndex="id"
          key="id"
          sorter={(a, b) => a.id - b.id}
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
          title="Tags"
          dataIndex="tags"
          key="tags"
          render={tags => (
            <Popover content={<div>{tags.map(tag => <p key={tag}>{tag}</p>)}</div>} title="Tags">
              {tags.length}
            </Popover>
          )}
          sorter={(a, b) => a.id - b.id}
        />
        <Column
          title="Groups"
          dataIndex="groups"
          key="groups"
          render={groups => (
            <span>{groups.map(group => <Tag key={group}>{group}</Tag>)}</span>
          )}
          sorter={(a, b) => a.groups.length - b.groups.length}
          filters={groupsFilter}
          onFilter={(value, record) => record.groups.includes(value)}
        />
        <Column
          title="Actions"
          key="actions"
          render={(actions, user) => (
            <span>
              <Link to={'/user/'+user.id}><Button icon="edit" type="primary" /></Link>&nbsp;
              <Button icon="delete" type="danger" onClick={() => this.deleteUser(user.id)} />
            </span>
          )}
        />
      </Table>
    )
  }
}

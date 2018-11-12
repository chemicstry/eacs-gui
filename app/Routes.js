import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import SetupPage from './containers/SetupPage';
import UsersPage from './containers/UsersPage';
import EditUserPage from './containers/EditUserPage';
import GroupsPage from './containers/GroupsPage';
import EditGroupPage from './containers/EditGroupPage';

import { Layout, Menu, Breadcrumb } from 'antd';
const { Header, Content, Footer } = Layout;

function uppercaseFirstLetter(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default withRouter(class Routes extends Component {
  render() {
    return (
      <App>
        <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1"><Link to={routes.SETUP}>Setup</Link></Menu.Item>
              <Menu.Item key="2"><Link to={routes.USERS}>Users</Link></Menu.Item>
              <Menu.Item key="3"><Link to={routes.GROUPS}>Groups</Link></Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              {this.props.location.pathname.split('/').map(name => (
                <Breadcrumb.Item key={name}>{uppercaseFirstLetter(name)}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <Switch>
                <Route path={routes.COUNTER} component={CounterPage} />
                <Route path={routes.SETUP} component={SetupPage} />
                <Route path={routes.USERS} component={UsersPage} />
                <Route path={routes.USER} render={(props) => <EditUserPage {...props}/>} />
                <Route path={routes.GROUPS} component={GroupsPage} />
                <Route path={routes.GROUP} render={(props) => <EditGroupPage {...props}/>} />
                <Route path={routes.HOME} component={HomePage} />
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
        
      </App>
    );
  }
})

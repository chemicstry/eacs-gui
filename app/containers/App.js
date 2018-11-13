// @flow
import * as React from 'react';
import routes from '../constants/routes';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import globalState from '../store/globalState';
import { Layout, Menu, Breadcrumb, Tag } from 'antd';
const { Header, Content, Footer } = Layout;


function uppercaseFirstLetter(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

type Props = {
  children: React.Node
};

export default withRouter(@observer class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return (
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1"><Link to={routes.SETUP}>Setup</Link></Menu.Item>
            { globalState.connected ? (
              <Menu.Item key="2"><Link to={routes.USERS}>Users</Link></Menu.Item>
            ) : ''}
            { globalState.connected ? (
              <Menu.Item key="3"><Link to={routes.GROUPS}>Groups</Link></Menu.Item>
            ) : ''}
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {this.props.location.pathname.split('/').map(name => (
              <Breadcrumb.Item key={name}>{uppercaseFirstLetter(name)}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    );
  }
})

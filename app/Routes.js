import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import SetupPage from './containers/SetupPage';
import UsersPage from './containers/UsersPage';
import EditUserPage from './containers/EditUserPage';
import GroupsPage from './containers/GroupsPage';
import EditGroupPage from './containers/EditGroupPage';
import RFIDAuthPage from './containers/RFIDAuthPage';
import InitKeyPage from './containers/InitKeyPage';
import TagInfoPage from './containers/TagInfoPage';

export default class Routes extends Component {
  render() {
    return (
      <App>
        <Switch>
          <Route path={routes.COUNTER} component={CounterPage} />
          <Route path={routes.SETUP} component={SetupPage} />
          <Route path={routes.RFIDAUTH} component={RFIDAuthPage} />
          <Route path={routes.INITKEY} component={InitKeyPage} />
          <Route path={routes.TAGINFO} component={TagInfoPage} />
          <Route path={routes.USERS} component={UsersPage} />
          <Route path={routes.USER} render={(props) => <EditUserPage {...props}/>} />
          <Route path={routes.GROUPS} component={GroupsPage} />
          <Route path={routes.GROUP} render={(props) => <EditGroupPage {...props}/>} />
          <Route path={routes.HOME} component={HomePage} />
        </Switch>
      </App>
    );
  }
}

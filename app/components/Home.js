// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <h2>Home</h2>
        <Link to={routes.SETUP}>Proceed to Setup</Link>
      </div>
    );
  }
}

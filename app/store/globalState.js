import { observable } from 'mobx';

class GlobalState {
  // Bitcoin price in usd
  @observable connected = false;
}

var globalState = new GlobalState();

export default globalState;

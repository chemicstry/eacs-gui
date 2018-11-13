import { WSTransport, RPCClient } from 'modular-json-rpc';
import globalState from '../store/globalState';
import WebSocket from 'ws';
import { message } from 'antd';
import { history } from '../store/configureStore';

var client;

function connect(address, token, cert)
{
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(address, [], {
      headers: {
        token
      },
      ca: [cert],
      checkServerIdentity: (host, cert) => { } // Skip hostname check, certificate is still validated
    });

    ws.on('open', async () => {
        console.log("Websocket connected.");
        globalState.connected = true;

        // Create transport interface via websocket
        var transport = new WSTransport(ws);

        // Create RPC client
        client = new RPCClient(transport);

        resolve(true);
    });

    ws.on('close', () => {
      globalState.connected = false;
      message.error('Server disconnected');
      history.push('/setup');
    })

    ws.on('error', (e) => {
      console.log('error' + e);
      reject(e);
    })
  });
}

export {
  connect,
  client
}

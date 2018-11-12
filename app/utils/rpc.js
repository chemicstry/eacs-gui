import { WSTransport, RPCClient } from 'modular-json-rpc';
import WebSocket from 'ws';

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

        // Create transport interface via websocket
        var transport = new WSTransport(ws);

        // Create RPC client
        client = new RPCClient(transport);

        resolve(true);
    });

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

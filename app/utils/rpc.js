import { WSTransport, RPCNode } from 'modular-json-rpc';
import globalState from '../store/globalState';
import WebSocket from 'ws';
import { message } from 'antd';
import { history } from '../store/configureStore';

var client;

function connect(address, fingerprint, token)
{
  return new Promise((resolve, reject) => {
    if (token)
      var headers = {token};
    else
      var headers = {};

    const ws = new WebSocket(address, [], {
      headers,
      rejectUnauthorized: false, // we do manual fingerprint check
      checkServerIdentity: (hostname, cert) => {console.log(cert)}
    });

    var req = ws._req;
    req.on('socket', socket => {
      console.log(socket);
      socket.on('secureConnect', () => {
        var fingerprint_server = socket.getPeerCertificate().fingerprint;
    
        // Match the fingerprint with our saved fingerprints
        if (fingerprint.indexOf(fingerprint_server) === -1){
          // Abort request, optionally emit an error event
          req.emit('error', new Error(`Fingerprint does not match. Expected: ${fingerprint}, got: ${fingerprint_server}`));
          return req.abort();
        }
      });
    });

    ws.on('open', async () => {
        console.log("Websocket connected.");
        globalState.connected = true;

        // Create transport interface via websocket
        var transport = new WSTransport(ws);

        // Create RPC client
        client = new RPCNode(transport);

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

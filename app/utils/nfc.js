import * as SerialPort from 'serialport';
import { PN532 } from 'pn532';

var serialport;
var nfc;

function listPorts()
{
  return SerialPort.list();
}

function initNFC(port)
{
  return new Promise((resolve, reject) => {
    console.log(`Initializing PN532 on port ${port}`);
    serialport = new SerialPort(port, {
      baudRate: 115200
    });
    serialport.write("OMGOMGOMG");
    try {
      nfc = new PN532(serialport);
    } catch (e) {
      reject(e);
    }

    var timer = setTimeout(() => reject('PN532 initialization failed'), 3000);

    nfc.on('ready', function() {
      clearTimeout(timer);
      console.log('PN532 Initialized');
      resolve(true);
    });
  });
}

function readUID()
{
  return new Promise((resolve, reject) => {
    nfc.scanTag().then(function(tag) {
      resolve(tag.uid.replace(/:/g, '').toUpperCase());
    });
  })
}

export {
  listPorts,
  initNFC,
  readUID
}
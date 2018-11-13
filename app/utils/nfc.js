import * as SerialPort from 'serialport';
import { PN532 } from 'pn532';

var serialport;
var nfc;

function listPorts()
{
  return SerialPort.list();
}

function close()
{
  return new Promise((resolve, reject) => {
    serialport.close(() => resolve());
  });
}

function initNFC(port)
{
  return new Promise(async (resolve, reject) => {
    console.log(`Initializing PN532 on port ${port}`);

    if (serialport && serialport.isOpen) {
      console.log(`Port already open, closing...`);
      await close();
    }

    serialport = new SerialPort(port, {
      baudRate: 115200
    });

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

var readPromiseReject;
function readUID()
{
  return new Promise((resolve, reject) => {
    // Check if previous read was in progress
    if (readPromiseReject)
      readPromiseReject();

    readPromiseReject = reject;
    nfc.scanTag().then(function(tag) {
      resolve(tag.uid.replace(/:/g, '').toUpperCase());
    });
  })
}

function enabled()
{
  return serialport && serialport.isOpen;
}

export {
  listPorts,
  initNFC,
  readUID,
  enabled
}
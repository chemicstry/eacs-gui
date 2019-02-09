import * as SerialPort from 'serialport';
import { PN532 } from 'pn532';
import * as PN532Constants from 'pn532/src/constants';

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

// library does not support ATS, so reimplement this function
function scanTag(nfc) {
  var maxNumberOfTargets = 0x01;
  var baudRate = PN532Constants.CARD_ISO14443A;

  var commandBuffer = [
    PN532Constants.COMMAND_IN_LIST_PASSIVE_TARGET,
    maxNumberOfTargets,
    baudRate
  ];

  return nfc.sendCommand(commandBuffer)
    .then((frame) => {
      var body = frame.getDataBody();

      var numberOfTags = body[0];
      if (numberOfTags === 1) {
        var tagNumber = body[1];
        var uidLength = body[5];
        var atsLength = body[6+uidLength]-1;
        console.log(`ATS len: ${atsLength}`);

        var uid = body.slice(6, 6 + uidLength)

        return {
          ATQA: [...body.slice(2, 4)],
          SAK: body[4],
          UID: uid.toString('hex').toUpperCase(),
          ATS: body.slice(7+uidLength, 7+uidLength+atsLength).toString('hex').toUpperCase()
        };
      }
    });
}

async function dataExchange(data) {
  var commandBuffer = [
    PN532Constants.COMMAND_IN_DATA_EXCHANGE,
    0x01, // tag number
    ...data
  ];

  var frame = await new Promise((resolve, reject) => {
    nfc.sendCommand(commandBuffer).then((frame) => resolve(frame));
  })

  let body = frame.getDataBody();
  return body.slice(1, body.length-1);
}

var readPromiseReject;
function readTagInfo()
{
  return new Promise((resolve, reject) => {
    // Check if previous read was in progress
    if (readPromiseReject)
      readPromiseReject();

    readPromiseReject = reject;
    scanTag(nfc).then(function(tag) {
      console.log(tag);
      resolve(tag);
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
  readTagInfo,
  enabled,
  nfc,
  dataExchange
}
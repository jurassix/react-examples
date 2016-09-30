import Peer from 'peerjs';

const noop = arg => {console.log(arg); return arg;};

export const createPeer = (options, onOpen, onConnection, onMessageRecieve) => {
  const peer = new Peer({
    debug: 3,
    host: 'localhost',
    port: 9000,
    path: '/',
    ...options,
  });
  open(peer, onOpen);
  connection(peer, onConnection).then((conn) => data(conn, onMessageRecieve));
  return peer;
}

export const send = (peer) => (data) => {
  Object.keys(peer.connections)
    .forEach((peerId) => {
      peer.connections[peerId].map(conn => {
        console.log('sending', data);
        conn.send(data);
      });
    });
}

function open(peer, onOpen = noop, onError = noop) {
  return new Promise((resolve, reject) => {
    try {
      if (peer.open) {
        resolve(peer.id);
      }
      peer.on('open', (id) => {
        console.log('Open is successful', id);
        onOpen(id);
        resolve(id);
      });
      peer.on('error', (err) => {
        console.log('Open failed', err);
        onError(err);
        reject(err);
      })
    } catch (err) {
      onError(err);
      reject(err);
    }
  });
}

function connection(peer, onConnection = noop, onError = noop) {
  return new Promise((resolve, reject) => {
    try {
      peer.on('connection', (conn) => {
        console.log('Connection is successful', conn);
        onConnection(conn);
        resolve(conn);
      });
      peer.on('error', (err) => {
        console.log('Connection failed', err);
        onError(err);
        reject(err);
      });
    } catch (err) {
      onError(err);
      reject(err);
    }
  });
}

function data(peer, onData = noop) {
  peer.on('data', (data) => {
    console.log('Data is recieved', data);
    onData(data);
  });
}

export async function connectToPeer(
  peer,
  remotePeerId,
  onOpen = noop,
  onConnection  = noop,
  onMessageRecieve = noop,
  onError = noop,
) {
  try {
    await open(peer, onOpen, onError);
    connection(peer).then((conn) => {
      data(conn, onMessageRecieve);
    });

    console.log('is connected?')
    // if (peer.connections[remotePeerId] === undefined) {
      console.log('NOT connected')
      const peerConn = peer.connect(remotePeerId, {serialization: 'json'});
      await open(peerConn, onOpen, onError);
      connection(peerConn, onConnection, onError).then((conn) => {
        data(conn, onMessageRecieve);
      });
    // } else {
      // console.error(`Already connected to remote peer id = ${remotePeerId}`);
    // }
  } catch (err) {
    console.error('Client connection failed', err);
  }
}

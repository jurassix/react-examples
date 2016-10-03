import Peer from 'peerjs';

const noop = arg => {console.log(arg); return arg;};

export const createPeer = (options, onOpen, onConnection, onMessageRecieve, onError) => {
  const peer = new Peer({
    debug: 3,
    host: 'localhost',
    port: 9000,
    path: '/',
    ...options,
  });
  error(peer, onError);
  open(peer, onOpen);
  connection(peer, onConnection).then(
    (conn) => data(conn, onMessageRecieve)
  );
  return peer;
}

export const send = (peer) => (data) => {
  Object.keys(peer.connections)
    .forEach((peerId) => {
      peer.connections[peerId].map(conn => {
        console.log('sending', peerId, data);
        conn.send(data);
      });
    });
}

function open(peer, onOpen = noop, onError = noop) {
  return new Promise((resolve, reject) => {
    try {
      if (peer.open) {
        console.log('Already open', peer.id);
        return resolve(peer.id);
      }
      peer.on('open', (id) => {
        console.log('Open is successful', id);
        onOpen(id);
        resolve(id);
      });
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

function error(peer, onError = noop) {
  peer.on('error', (err) => {
    console.log('Error encountered', err);
    onError(data);
  });
}

export async function connectToPeer(
  peer,
  remotePeerId,
  onOpen = noop,
  onMessageRecieve = noop,
  onError = noop,
) {
  try {
    //add reconnect info here...
    //open is redudant
    console.log('FK', peer, remotePeerId);
    await open(peer, onOpen, onError);

    if (peer.connections[remotePeerId] === undefined) {
      console.log('FK1', peer, remotePeerId);
      const peerConn = peer.connect(remotePeerId, {serialization: 'json'});
      await open(peerConn, onOpen, onError);
      data(peerConn, onMessageRecieve);
    } else {
      console.error(`Already connected to remote peer id = ${remotePeerId}`);
    }
  } catch (err) {
    console.error('Client connection failed', err);
  }
}

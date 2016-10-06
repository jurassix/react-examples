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
  connection(peer, (conn) => {
    onConnection(conn);
    data(conn, onMessageRecieve);
  });
  return peer;
}

export const send = (peer) => (data) => {
  Object.keys(peer.connections)
    .forEach((peerId) => {
      peer.connections[peerId].map(conn => {
        if (conn.open) {
          console.log('sending', peerId, data);
          conn.send(data);
        } else {
          console.log('cannot send, conn not open', conn);
        }
      });
    });
}

function open(peer, onOpen = noop) {
  if (!peer.open) {
    peer.on('open', onOpen);
  }
}

function connection(peer, onConnection = noop) {
  peer.on('connection', onConnection);
}

function data(peer, onData = noop) {
  peer.on('data', onData);
}

function error(peer, onError = noop) {
  peer.on('error', onError);
}

export function connectToPeer(
  peer,
  remotePeerId,
  onOpen = noop,
  onMessageRecieve = noop,
  onError = noop,
) {
  try {
    if (peer.connections[remotePeerId] === undefined) {
      console.log('connecting', peer.id, remotePeerId);
      const peerConn = peer.connect(remotePeerId, {serialization: 'json'});

      console.log('on error', peer.id, remotePeerId);
      error(peerConn, onError);

      console.log('on open', peer.id, remotePeerId);
      open(peerConn, (id) => {
        onOpen(id);
        console.log('on data', peer.id, remotePeerId);
        data(peerConn, onMessageRecieve);
      });
    } else {
      console.error(`Already connected to remote peer id = ${remotePeerId}`);
    }
  } catch (err) {
    console.error('Client connection failed', err);
  }
}

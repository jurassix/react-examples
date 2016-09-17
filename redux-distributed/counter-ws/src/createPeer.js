import Peer from 'peerjs';

export const createPeer = () => {
  return new Peer({
    debug: 3,
    host: 'localhost',
    port: 9000,
    path: '/',
  });
}

export function registerOpen(peer, onOpen) {
  peer.on('open', (id) => {
    console.log('OPEN', id)
    onOpen(id);
    // __registerData(peer, onOpen);
  });
}

export function registerError(peer, onError) {
  peer.on('error', (err) => {
    console.log('ERROR', err);
    onError(err);
  });
}

export const registerConnect = (peer, onRecieve) => {
  peer.on('connection', (conn) => {
    console.log('CONNECTION', conn);
    registerOpen(conn, onRecieve);
    __registerData(conn, onRecieve);
  });
}

const __registerData = (conn, onRecieve) => {
  conn.on('data', (data) => {
    console.log('DATA', data);
    onRecieve(data);
  });
}

export const connectToPeer = (peer, remotePeerId, onRecieve) => {
  const conn = peer.connect(remotePeerId, {
    label: 'remote-peer',
    serialization: 'none',
    metadata: {message: '@@init'},
  });
  // registerOpen(peer, () => __registerData(peer, onRecieve));
  __registerData(conn, onRecieve);
  registerError(conn, () => console.error);
}

export const send = (peer) => (data) => {
  Object.keys(peer.connections)
    .forEach((peerId) => {
      peer.connections[peerId].map(conn => {
        console.log('sending', conn);
        conn.send(data);
      });
    });
}

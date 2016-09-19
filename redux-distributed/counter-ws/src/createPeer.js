import Peer from 'peerjs';

export const createPeer = () => {
  return new Peer({
    debug: 3,
    host: 'localhost',
    port: 9000,
    path: '/',
  });
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

function open(peer) {
  return new Promise((resolve, reject) => {
    peer.on('open', (id) => {
      console.log('Open is successful', id);
      resolve(id);
    });
    peer.on('error', (err) => {
      console.log('Open failed', err);
      reject(err);
    })
  });
}

function connection(peer) {
  return new Promise((resolve, reject) => {
    peer.on('connection', (conn) => {
      console.log('Connection is successful', conn);
      resolve(conn);
    });
    peer.on('error', (err) => {
      console.log('Connection failed', err);
      reject(err);
    })
  });
}

function data(peer, onData = () => {}) {
  peer.on('data', (data) => {
    console.log('Data is recieved', data);
    onData(data);
  });
}

export async function connectToPeer(peer, peerTwo) {
  try {
    await open(peer);
    connection(peer).then((conn) => {
      data(conn);
    });

    const peerConn = peer.connect(peerTwo.id, {serialization: 'json'});
    await open(peerConn);
    connection(peerConn).then((conn) => {
      data(conn);
    });
  } catch(err) {
    console.error('Caught Exception', err);
  }
}

import Peer from 'peerjs';

export const createPeer = (options) => {
  return new Peer({
    debug: 3,
    host: 'localhost',
    port: 9000,
    path: '/',
    ...options,
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

export async function connectToPeer(peer, remotePeerId, onMessageRecieve) {
  try {
    console.log('here 0')
    await open(peer);
    console.log('here 1')
    connection(peer).then((conn) => {
      console.log('here data')
      data(conn, onMessageRecieve);
    });

    const peerConn = peer.connect(remotePeerId, {serialization: 'json'});
    console.log('here 2')
    await open(peerConn)
    console.log('here 3');
    connection(peerConn).then((conn) => {
      console.log('here data 2')
      data(conn, onMessageRecieve);
    });
    console.log('here done')
  } catch(err) {
    console.error('Client connection failed', err);
  }
}

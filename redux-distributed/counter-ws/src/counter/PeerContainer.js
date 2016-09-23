import {connect} from 'react-redux';
import Peer from './Peer';
import {selectPeerId, selectConnectedPeerIds} from './selectors';
import {initPeer, connectToPeer, sendMessage} from './actions';

const actions = {initPeer, connectToPeer, sendMessage};
const mapStateToProps = (state) => ({
  peerId: selectPeerId(state),
  connectedPeerIds: selectConnectedPeerIds(state),
});

const PeerContainer = connect(mapStateToProps, actions)(Peer);

export default PeerContainer;

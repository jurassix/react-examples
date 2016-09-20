import React, {PropTypes} from 'react';

export default Peer from React.Component {
  static propTypes = {
    peerOptions: PropTypes.object,
    onOpen: PropTypes.func,
    onConnection: PropTypes.func,
    onMessageRecieve: PropTypes.func,
    onError: PropTypes.func,
  }

  getChildContext() = {
    return {
      send: this.sendToPeer(),
      
    };
  }

  constructor(props) {

  }
}


export default function peerPreloadedStateEnhancer(preloadedState) {
  return {
    ...preloadedState,
    peer: {_peer: {}},
  };
}

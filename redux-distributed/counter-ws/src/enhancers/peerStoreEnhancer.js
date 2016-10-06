import {applyMiddleware} from 'redux';
import peerReducerEnhancer from './peerReducerEnhancer';
import peerPreloadedStateEnhancer from './peerPreloadedStateEnhancer';
import actionEnhancerMiddleware from './actionEnhancerMiddleware';
import {ignorePeerActions, peerMetadataEnhancer, peerReplicateActionEnhancer} from './peerActionEnhancers';

export default function peerStoreEnhancer() {
  return (createStore) => (reducer, preloadedState) => {
    const enhancedReducer = peerReducerEnhancer(reducer);
    const enhancedPreloadedState = peerPreloadedStateEnhancer(preloadedState);
    const peerEnhancer =
      applyMiddleware(
        actionEnhancerMiddleware({
          filter: ignorePeerActions,
          enhancer: peerMetadataEnhancer,
        }),
        actionEnhancerMiddleware({
          filter: ignorePeerActions,
          enhancer: peerReplicateActionEnhancer,
        })
      );

    // return createStore(enhancedReducer, enhancedPreloadedState, peerEnhancer);
    return peerEnhancer(createStore)(enhancedReducer, enhancedPreloadedState);
  }
}

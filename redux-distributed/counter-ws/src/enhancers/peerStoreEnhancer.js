import {applyMiddleware} from 'redux';
import peerReducerEnhancer from './peerReducerEnhancer';
import peerPreloadedStateEnhancer from './peerPreloadedStateEnhancer';
import actionEnhancerMiddleware from './actionEnhancerMiddleware';
import {ignorePeerActions, peerMetadataEnhancer, peerReplicateActionEnhancer} from './peerActionEnhancers';

export default function peerStoreEnhancer(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const enhancedReducer = peerReducerEnhancer(reducer);
    const enhancedPreloadedState = peerPreloadedStateEnhancer(preloadedState);
    const peerEnhancer =
      applyMiddleware(
        ...middlewares,
        actionEnhancerMiddleware({
          filter: ignorePeerActions,
          enhancer: peerReplicateActionEnhancer,
        }),
        actionEnhancerMiddleware({
          filter: ignorePeerActions,
          enhancer: peerMetadataEnhancer,
        })
      );

    return createStore(enhancedReducer, enhancedPreloadedState, peerEnhancer);
  }
}

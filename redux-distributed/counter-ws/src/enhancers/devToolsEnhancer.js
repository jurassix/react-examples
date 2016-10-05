
const devToolsEnhancer =
  typeof window === 'object' &&
  typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f;

export default devToolsExtension;

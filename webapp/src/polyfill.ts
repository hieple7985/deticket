(window as any).global = window;
// @ts-ignore
window.Buffer = window.Buffer || require('buffer').Buffer;

// eslint-disable-next-line import/no-anonymous-default-export
export default {}

export const ipfsGatewaySrc = (uri :string) => {
  if (!uri) {
    return ''
  }
  return uri.replace('ipfs://', 'https://ipfs.infura.io/ipfs/')
}

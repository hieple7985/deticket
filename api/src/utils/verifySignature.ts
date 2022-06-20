const sodium = require("libsodium-wrappers")
const bs58check = require("bs58check")

const prefix = {
  edsig: new Uint8Array([9, 245, 205, 134, 18]),
  edpk: new Uint8Array([13, 15, 37, 217])
};

function hex2buf(hex: any) {
  return new Uint8Array(
    hex.match(/[\da-f]{2}/gi).map(function (h: any) {
      return parseInt(h, 16)
    })
  );
}

const b58decode = (enc: any, prefix: any) => {
  return bs58check.decode(enc).slice(prefix.length);
}

export async function verifyUserSignature(bytes: any, sig: any, pk: any) {
  await sodium.ready;
  try {
    const verify = sodium.crypto_sign_verify_detached(
      b58decode(sig, prefix.edsig),
      sodium.crypto_generichash(32, hex2buf(bytes)),
      b58decode(pk, prefix.edpk)
    )
    return verify
  } catch (e) {
    throw e
  }
}

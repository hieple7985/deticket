import { char2Bytes } from "@taquito/utils";

export const generateSignaturePayloadBytes = (nonce: string): string => {
  const formattedInput: string = [
    "Tezos Signed Message:",
    "deTicket Auth",
    `Nonce: ${nonce}`,
  ].join(" ");
  const bytes = char2Bytes(formattedInput);
  const payloadBytes =
    "05" + "0100" + char2Bytes(bytes.length.toString()) + bytes;
  return payloadBytes
}

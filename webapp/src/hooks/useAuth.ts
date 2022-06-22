import { useWallet } from "@tezos-contrib/react-wallet-provider";
import { char2Bytes } from "@taquito/utils";
import { useState } from "react"
import { client } from "../client";
import { RequestSignPayloadInput, SigningType } from "@airgap/beacon-sdk";

interface UseAuth {
  auth: () => Promise<string> // token
  token: string | null,
  headers: { authorization?: string },
}


export const useAuth = (): UseAuth => {
  const [token, setToken] = useState<string | null>(null)
  const { activeAccount, client: tezosClient } = useWallet();
  const generateNonce = async (): Promise<string> => {
    const { data } = await client.post('/generate-nonce', {
      address: activeAccount?.address,
    })
    return data.nonce
  }
  const generateTicketSignature = async (nonce: string) => {
    if (!tezosClient) {
      return;
    }
    const formattedInput: string = [
      "Tezos Signed Message:",
      "deTicket Auth",
      `Nonce: ${nonce}`,
    ].join(" ");
    const bytes = char2Bytes(formattedInput);
    const payloadBytes =
      "05" + "0100" + char2Bytes(bytes.length.toString()) + bytes;

    const payload: RequestSignPayloadInput = {
      signingType: SigningType.MICHELINE,
      payload: payloadBytes,
      sourceAddress: activeAccount?.address,
    };
    const signedPayload = await tezosClient.requestSignPayload(payload);
    const { signature } = signedPayload;
    return signature
  };
  const auth = async (): Promise<string> => {
    if (token) {
      return token
    }
    const nonce = await generateNonce()
    const signature = await generateTicketSignature(nonce)
    const { data } = await client.post('/auth', {
      address: activeAccount?.address,
      publicKey: activeAccount?.publicKey,
      signature,
    })
    setToken(data.token)
    return data.token
  }
  const headers: UseAuth['headers'] = {}
  if (token) {
    headers.authorization = `Bearer ${token}`
  }
  return {
    auth,
    token: token || null,
    headers,
  }
}

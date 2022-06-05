import { TezosToolkit } from "@taquito/taquito";
import { useBeaconWallet, useWallet } from "@tezos-contrib/react-wallet-provider"
import { useEffect, useState } from "react";


export const useTezos = (): TezosToolkit | null => {
  const [tezos, setTezos] = useState<TezosToolkit | null>(null)
  const { activeAccount } = useWallet();
  const beaconWallet = useBeaconWallet()
  useEffect(() => {
    const tezos = new TezosToolkit('https://ithacanet.smartpy.io/');
    tezos.setWalletProvider(beaconWallet);
    setTezos(tezos)
  }, [activeAccount, beaconWallet])
  return tezos
}

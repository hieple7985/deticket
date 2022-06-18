import { TezosToolkit } from "@taquito/taquito";

export const tezos = new TezosToolkit('https://ithacanet.smartpy.io/');


export const getContract = () => tezos.contract.at('KT1UUKCSvb8pXmAtnVwLAeQUmPnS9ZFwEiHo')

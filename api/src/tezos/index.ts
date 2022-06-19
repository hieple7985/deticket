import { TezosToolkit } from "@taquito/taquito";

export const tezos = new TezosToolkit('https://ithacanet.smartpy.io/');


export const getContract = () => tezos.contract.at(process.env.CONTRACT_ADDRESS || '')

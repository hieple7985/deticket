import { ContractAbstraction, ContractMethod, TezosToolkit, Wallet } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { useTezos } from "./useTezos";

// TODO: Make contract address configurable
const CONTRACT_ADDRESS = 'KT1UUKCSvb8pXmAtnVwLAeQUmPnS9ZFwEiHo'


type DefaultMethods = Record<string, (...args: any[]) => ContractMethod<Wallet>>

interface TMethods extends DefaultMethods {
  create_ticket_collection: (name: string, purchase_amount_mutez: number) => ContractMethod<Wallet>;
  [key: string]: any;
}

type DeTicketContract = ContractAbstraction<Wallet, TMethods>



export const useDeTicketContract = (): DeTicketContract | null => {
  const [contract, setContract] = useState<DeTicketContract | null>(null)
  const tezos = useTezos()

  useEffect(() => {
    if (tezos && tezos.wallet) {
      tezos.wallet.at(CONTRACT_ADDRESS).then(contract => setContract(contract as any))
    }
  }, [tezos])
  return contract
}

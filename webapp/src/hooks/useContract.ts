import { ContractAbstraction, ContractMethod, TezosToolkit, Wallet } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { useTezos } from "./useTezos";

// TODO: Make contract address configurable
const CONTRACT_ADDRESS = 'KT1ARttgRAfMtpb7xaBdnjnS6toxebGaDyCH'


type DefaultMethods = Record<string, (...args: any[]) => ContractMethod<Wallet>>

interface TMethods extends DefaultMethods {
  create_ticket_collection: (
    cover_image: string,
    datetime: number,
    location: string,
    max_supply: number,
    name: string,
    purchase_amount_mutez: number,
  ) => ContractMethod<Wallet>;
  purchase_ticket: (ticket_collection_id: number, quantity: number) => ContractMethod<Wallet>;
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

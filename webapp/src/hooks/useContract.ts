import { ContractAbstraction, ContractMethod, TezosToolkit, Wallet } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { useTezos } from "./useTezos";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS!


type DefaultMethods = Record<string, (...args: any[]) => ContractMethod<Wallet>>


interface TransferTx {
  to_: string
  token_id: number
  amount: number
}

interface TransferParam {
  from_: string
  txs: TransferTx[]
}

interface TMethods extends DefaultMethods {
  create_ticket_collection: (
    cover_image: string,
    datetime: number,
    location: string,
    max_supply: number,
    name: string,
    purchase_amount_mutez: number,
    ticket_type: string,
  ) => ContractMethod<Wallet>;
  purchase_ticket: (ticket_collection_id: number, quantity: number) => ContractMethod<Wallet>;
  withdraw_collection: (amount: number, collection_id: number) => ContractMethod<Wallet>;
  transfer: (params: TransferParam[]) => ContractMethod<Wallet>;
  set_ticket_collection_verified: (ticket_collection_id: number, verified: boolean) => ContractMethod<Wallet>;
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

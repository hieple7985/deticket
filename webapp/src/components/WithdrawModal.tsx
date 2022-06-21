import { FC, useState } from "react";
import { Modal, ModalProps } from "./Modal";
import tezosIconSrc from "../assets/images/tezos-icon.png";
import { TezosAmountInput } from "./TezosAmountInput";
import { ExclamationIcon } from "@heroicons/react/outline";
import { useDeTicketContract } from "../hooks/useContract";
import { toast } from "react-toastify";
import { waitForTx } from "../utils/tx";
import { useGlobalLoading } from "../hooks/useLoading";

export interface WithdrawModalProps
  extends Pick<ModalProps, "open" | "setOpen"> {
  collection: any;
  refetch: () => any;
}

export const WithdrawModal: FC<WithdrawModalProps> = ({
  open,
  setOpen,
  collection,
  refetch,
}) => {
  const { setLoading } = useGlobalLoading()
  const contract = useDeTicketContract()
  const [amount, setAmount] = useState("");
  const balanceTezAmount = collection.balance_mutez / 10 ** 6;
  const notEnough = parseFloat(amount) > balanceTezAmount
  const submit = async () => {
    try {      
      setLoading(true)
      const amountNumber = Math.round(parseFloat(amount) * 10 ** 6);
      const res = await contract?.methods.withdraw_collection(amountNumber, collection.ticket_collection_id).send()
      await res?.confirmation(1)
      await waitForTx(res?.opHash!)
      toast.success('Withdraw successful!')
      setOpen(false)
      refetch()
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  return (
    <Modal open={open} setOpen={setOpen}>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Withdraw
        </h3>
        <div className="border-t mt-4 pt-4">
          <div className="mt-2">
            <strong>Collection:</strong> {collection.name}
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <strong>Balance:</strong>
              <img
                src={tezosIconSrc}
                alt="Tezos"
                className="w-3 h-3 rounded-full mr-1 ml-2"
              />
              {balanceTezAmount}
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-4">
          <strong>Withdraw Amount:</strong>
          <TezosAmountInput
            onChange={(e: any) => setAmount(e.target.value)}
            value={amount}
          />
          {notEnough && (            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationIcon
                    className="h-5 w-5 text-yellow-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Not enough balance
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(false)}
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={notEnough}
              onClick={() => submit()}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-200"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

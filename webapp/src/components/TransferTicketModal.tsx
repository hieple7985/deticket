import { FC, useState } from "react";
import { Modal, ModalProps } from "./Modal";
import { useDeTicketContract } from "../hooks/useContract";
import { toast } from "react-toastify";
import { waitForTx } from "../utils/tx";
import { useGlobalLoading } from "../hooks/useLoading";
import { useWallet } from "@tezos-contrib/react-wallet-provider";

export interface TransferTicketModalProps
  extends Pick<ModalProps, "open" | "setOpen"> {
  ticket: any;
  refetch: () => any;
}

export const TransferTicketModal: FC<TransferTicketModalProps> = ({
  open,
  setOpen,
  ticket,
  refetch,
}) => {
  const [toAddress, setToAddress] = useState('')
  const { activeAccount } = useWallet();
  const { setLoading } = useGlobalLoading();
  const contract = useDeTicketContract();
  const submit = async () => {
    try {
      setLoading(true);
      const res = await contract?.methods
        .transfer([
          {
            from_: activeAccount?.address!,
            txs: [
              {
                amount: 1,
                to_: toAddress,
                token_id: ticket.token_id,
              },
            ],
          },
        ])
        .send();
      await res?.confirmation(1);
      await waitForTx(res?.opHash!);
      toast.success("Transfer successful!");
      setOpen(false);
      refetch();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  return (
    <Modal open={open} setOpen={setOpen}>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Transfer Ticket
        </h3>
        <div className="border-t mt-4 pt-4">
          <div className="mt-2">
            <strong>Ticket Name:</strong> {ticket.name}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            To Address
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              className=" focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
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
              onClick={() => submit()}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-200"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

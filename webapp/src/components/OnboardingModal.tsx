import {
  CreditCardIcon,
  ExclamationIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";
import { useWallet } from "@tezos-contrib/react-wallet-provider";
import classNames from "classnames";
import { FC, useEffect, useState } from "react";
import { useTezos } from "../hooks/useTezos";
import { Modal, ModalProps } from "./Modal";
import TezosIconImg from "../assets/images/tezos-icon.png";

export interface OnboardingModalProps
  extends Pick<ModalProps, "open" | "setOpen"> {
  amount: number
  onCompleted: () => void
}

export const OnboardingModal: FC<OnboardingModalProps> = ({
  open,
  setOpen,
  amount,
  onCompleted,
}) => {
  const { activeAccount, connect, disconnect, client } = useWallet();
  const tezos = useTezos();
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    if (activeAccount) {
      (async () => {
        const balance = await tezos?.tz.getBalance(activeAccount.address);
        const balanceFloat = (balance?.toNumber() || 0) * 10 ** -6;
        setBalance(balanceFloat || 0);
      })();
    }
  }, [activeAccount, tezos]);
  const renderStep = (name: string, activeCondition: boolean) => {
    const className = classNames("step", { "step-primary": activeCondition });
    return <li className={className}>{name}</li>;
  };
  const getFormattedAmount = (amountValue?: number): string => {
    return Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      amountValue || 0
    );
  };
  const insufficientBalance = balance !== null && balance < amount
  const balanceLabelClassname = classNames(
    'font-semibold',
    {
      'text-red-500': insufficientBalance,
    }
  )
  const balanceBorderClassname = classNames(
    'border flex p-4 items-center rounded-md mt-2',
    {
      'border-red-500 border-2': insufficientBalance,
    }
  )
  const onChangeWalletClick = async () => {
    await disconnect()
    await connect()
  }
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-0"
    >
      <div className="flex">
        <div className="p-8 border-r min-w-[320px]">
          <ul className="steps steps-vertical">
            {renderStep("Connect Your Wallet", true)}
            {renderStep("Check Tezos Balance", !!activeAccount)}
            <li className="step">Ready to purchase</li>
          </ul>
        </div>
        <div className="p-8 min-w-[320px]">
          {!activeAccount && (
            <>
              <h1 className="text-lg font-bold">
                To continue, connect a Tezos Wallet
              </h1>
              <button
                className="btn btn-primary rounded-md w-full mt-4"
                onClick={() => connect()}
              >
                Connect Wallet
              </button>
              <div className="divider py-8">Don't have a wallet?</div>
              <p className="max-w-md text-gray-500 my-8">
                Don't worry if you've never had experience with Tezos before.
                You can install a wallet in your browser easily:{" "}
              </p>
              <a
                type="button"
                href="https://templewallet.com/download"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded-md hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
              >
                Install Temple Wallet{" "}
                <ExternalLinkIcon className="w-4 h-4 ml-2" />
              </a>
            </>
          )}
          {activeAccount && (
            <>
              <div>
                <div className="text-gray-500">Your Balance</div>
                <div className={balanceBorderClassname}>
                  <img
                    className="rounded-full w-5 h-5 mr-2"
                    src={TezosIconImg}
                  />
                  <span className={balanceLabelClassname}>{getFormattedAmount(balance || 0)}</span>
                </div>
                <div>
                  <button className="text-blue-500 mt-2 text-xs" onClick={onChangeWalletClick}>
                    Change Wallet
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-gray-500">Order Total</div>
                <div className="border flex p-4 items-center rounded-md mt-2">
                  <img
                    className="rounded-full w-5 h-5 mr-2"
                    src={TezosIconImg}
                  />
                  <span className="font-semibold">{getFormattedAmount(amount || 0)}</span>
                </div>
              </div>

              {insufficientBalance ? (
                <>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-[320px] my-8">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationIcon
                          className="h-5 w-5 text-yellow-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You don{`'`}t have enough Tezos amount to purchase your
                          order
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-2 max-w-[320px] text-gray-500">
                    But don't worry, you can purchase tezos easily with credit card
                  </div>

                  <a
                    href="https://global.transak.com?defaultCryptoCurrency=xtz"
                    target="_blank"
                    className="mt-4 w-full items-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:bg-blue-300"
                    onClick={() => {}} rel="noreferrer"
                  >
                    <CreditCardIcon className="w-6 h-6 mr-2" />
                    Purchase Tezos
                  </a>
                </>
              ): (
                <button
                onClick={() => onCompleted()}
                className="mt-4 flex justify-center items-center w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 disabled:bg-blue-300"
              >
                Confirm order
              </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="border-t"></div>
    </Modal>
  );
};

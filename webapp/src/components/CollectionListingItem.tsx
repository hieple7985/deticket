import {
  ExternalLinkIcon,
  IdentificationIcon,
  QrcodeIcon,
} from "@heroicons/react/outline";
import { FC, useState } from "react";
import { Link } from "react-router-dom";
import tezosIconSrc from "../assets/images/tezos-icon.png";
import { formatTicketDate } from "../utils/date";
import { ipfsGatewaySrc } from "../utils/ipfs";
import { WithdrawModal } from "./WithdrawModal";
import verifiedIconSrc from "../assets/images/verified-icon.svg";
import { getTicketTypeLabel } from "../utils/ticket";

export const CollectionListingItem: FC<{
  collection: any;
  isOwner?: boolean;
  refetch: () => any;
}> = ({ collection, isOwner = false, refetch }) => {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const tezAmount = collection.purchase_amount_mutez / 10 ** 6;
  const balanceTezAmount = collection.balance_mutez / 10 ** 6;
  const { supply, max_supply } = collection;
  const supplyProgress = (supply * 100) / max_supply;
  return (
    <div
      key={collection.title}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
      <Link to={`/collections/${collection.ticket_collection_id}`}>
        <div className="flex-shrink-0">
          <img
            className="h-48 w-full object-cover"
            src={ipfsGatewaySrc(collection.cover_image)}
            alt=""
          />
        </div>
        <div className="flex-1 bg-white p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 inline py-1 px-2 rounded-full">
              {getTicketTypeLabel(collection.ticket_type)}
            </span>
          </div>
          <div className="mt-4 flex space-x-1 text-sm text-gray-500">
            <time dateTime={collection.datetime}>
              {formatTicketDate(collection.datetime)}
            </time>
          </div>
          <div className="flex-1">
            <a href={""} className="block mt-2">
              <p className="text-xl font-semibold text-gray-900 flex text-ellipsis items-center">
                {collection.name}
                {collection.verified && (
                  <img
                    src={verifiedIconSrc}
                    alt="Ticket Collection Verified"
                    className="w-4 h-4 ml-2"
                  />
                )}
              </p>
            </a>
          </div>
          <div>
            <div className="flex items-center mt-4">
              <img
                src={tezosIconSrc}
                alt="Tezos"
                className="w-5 h-5 rounded-full mr-2"
              />
              {tezAmount}{" "}
              <span className="text-gray-500 ml-2">/ per ticket</span>
            </div>
          </div>
        </div>
      </Link>
      {isOwner && (
        <>
          <WithdrawModal
            collection={collection}
            open={withdrawModalOpen}
            setOpen={setWithdrawModalOpen}
            refetch={refetch}
          />
          <div className="bg-white border border-t-gray-200 px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Supply ({collection.supply} / {collection.max_supply})
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${supplyProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 text-right">
                  Balance
                </dt>
                <dd className="mt-1 text-sm text-gray-900 float-right">
                  <div className="flex">
                    <img
                      src={tezosIconSrc}
                      alt="Tezos"
                      className="w-5 h-5 rounded-full mr-2"
                    />
                    {balanceTezAmount}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
          <div className="bg-white border border-t-gray-200">
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="w-0 flex-1 flex">
                <Link
                  to={`/gate-scanner/${collection.ticket_collection_id}`}
                  className="cursor-pointer relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                >
                  <IdentificationIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3">Gate Scanner</span>
                </Link>
              </div>
              <div className="-ml-px w-0 flex-1 flex">
                <button
                  disabled={balanceTezAmount === 0}
                  onClick={() => setWithdrawModalOpen(true)}
                  className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500 disabled:text-gray-300"
                >
                  <ExternalLinkIcon
                    className={balanceTezAmount === 0 ? "w-5 h-5 text-gray-300" : "w-5 h-5 text-gray-400"}
                    aria-hidden="true"
                  />
                  <span className="ml-3">Withdraw</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import { useNavigate, useParams } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import tezosIconSrc from "../../assets/images/tezos-icon.png";
import verifiedIconSrc from "../../assets/images/verified-icon.svg";
import { useDeTicketContract } from "../../hooks/useContract";
import { useEffect, useState } from "react";
import { waitForTx } from "../../utils/tx";
import { ipfsGatewaySrc } from "../../utils/ipfs";
import { formatTicketDate } from "../../utils/date";
import { useWallet } from "@tezos-contrib/react-wallet-provider";
import { ExclamationIcon } from "@heroicons/react/outline";

export const CollectionView = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState("1");
  const [supply, setSupply] = useState<null | number>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { collectionId } = useParams();
  const contract = useDeTicketContract();

  const quantityInt = parseInt(quantity);
  const { collection } = useCollection({
    collectionId: collectionId ? parseInt(collectionId) : undefined,
  });
  useEffect(() => {
    if (collectionId) {
      (async () => {
        const s = await contract?.storage<{
          token_ticket_collections_supply: any;
        }>();
        const supply = await s?.token_ticket_collections_supply.get(
          parseInt(collectionId)
        );
        setSupply(supply.toNumber());
      })();
    }
  }, [collectionId, contract, setSupply]);
  if (!collection || supply === null) {
    return null;
  }
  const maxSupply = collection.max_supply.toNumber();
  // console.log(collection.purchase_amount_mutez)
  const purchase = async () => {
    setIsPurchasing(true);
    try {
      const res = await contract?.methods
        .purchase_ticket(collection.id, quantityInt)
        .send({
          amount:
            (collection.purchase_amount_mutez.toNumber() / 1000000) *
            quantityInt,
        });
      await res?.confirmation(1);
      try {
        await waitForTx(res?.opHash!);
      } catch (error) {
        console.log("waitForTx timeout");
        // TODO: Sentry or any reporting tool here
      }
      // @ts-ignore
      if (typeof party !== "undefined") {
        // @ts-ignore
        const { confetti, variation } = party;
        confetti(document.body, {
          count: variation.range(140, 200),
          size: variation.range(0.8, 1.2),
          spread: variation.range(5, 10),
        });
      }
      navigate("/my-tickets");
    } catch (error) {
      console.log(error);
    }
    setIsPurchasing(false);
  };
  const tezAmount = collection.purchase_amount_mutez / 10 ** 6;
  const total = tezAmount * quantityInt;
  const exceededSupply = quantityInt + supply > maxSupply;
  const soldOut = supply === maxSupply;
  const availableTickets = maxSupply - supply
  const renderPurchaseOptions = () => {
    if (soldOut) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Sold Out! All tickets have already been purchased
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <>
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-4"
          >
            Quantity
          </label>
          <select
            id="quantity"
            name="quantity"
            onChange={(e) => setQuantity(e.target.value)}
            value={quantity}
            className="rounded-md border border-gray-300 text-base font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </select>
          {quantityInt > availableTickets && availableTickets > 0 && (
            <div className="text-sm text-red-600 mt-2">
              Only {availableTickets} ticket{availableTickets > 1 ? 's are': ' is'} available.
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-right">
            Total
          </label>
          <div className="flex items-center pt-2">
            <img
              src={tezosIconSrc}
              alt="Tezos"
              className="w-5 h-5 rounded-full mr-2"
            />
            {total}
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="bg-gray-900 w-screen h-screen flex items-center justify-center">
      <div className="bg-white overflow-hidden sm:rounded-lg sm:shadow">
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 w-[480px]">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            {collection.name}
            <img
              src={verifiedIconSrc}
              alt="Ticket Collection Verified"
              className="w-4 h-4 ml-2"
            />
          </h3>
        </div>
        <div
          className="bg-cover w-full h-32 bg-center"
          style={{
            backgroundImage: `url(${ipfsGatewaySrc(collection.cover_image)})`,
          }}
        ></div>
        <div className="p-8 border-b border-gray-200">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {collection.location}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 text-right">
                Date / Time
              </dt>
              <dd className="mt-1 text-sm text-gray-900 text-right">
                {formatTicketDate(collection.datetime.toNumber())}
              </dd>
            </div>
          </dl>
        </div>
        <div className="p-8 border-b border-gray-200">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Supply</dt>
              <dd className="mt-1 text-sm text-gray-900 ">
                {supply} / {maxSupply}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 text-right">
                Ticket Type
              </dt>
              <dd className="mt-1 text-sm text-gray-900 text-right">
                Admit One
              </dd>
            </div>
          </dl>
        </div>
        <div className="p-8 flex justify-between w-full border-b border-gray-300">
          {renderPurchaseOptions()}
        </div>
        {!soldOut && (
          <div className="p-4">
            <button
              onClick={() => purchase()}
              disabled={isPurchasing || !!exceededSupply}
              className="flex justify-center items-center w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isPurchasing ? (
                <>
                  Confirming...
                  <div className="button-spinner ml-2">Loading...</div>
                </>
              ) : (
                <>Confirm order</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

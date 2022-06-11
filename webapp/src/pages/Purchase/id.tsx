import { useParams } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import tezosIconSrc from '../../assets/images/tezos-icon.png';
import verifiedIconSrc from '../../assets/images/verified-icon.svg';

export const PurchaseTicket = () => {
  const { collectionId } = useParams();
  const { collection } = useCollection({
    collectionId: collectionId ? parseInt(collectionId) : undefined,
  });
  if (!collection) {
    return null;
  }
  return (
    <div className="bg-gray-900 w-screen h-screen flex items-center justify-center">
      <div className="bg-white overflow-hidden sm:rounded-lg sm:shadow">
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 w-[480px]">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            {collection.name}
            <img src={verifiedIconSrc} alt="Ticket Collection Verified" className="w-4 h-4 ml-2" />
          </h3>
        </div>
        <div
          className="bg-cover w-full h-32 bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80)`,
          }}
        ></div>
        <div className="p-8 border-b border-gray-200">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">Teste</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Date / Time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                Wednesday, May 28, at 2:00 PM
              </dd>
            </div>
          </dl>
        </div>
        <div className="p-8 flex justify-between w-full border-b border-gray-300">
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
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-4 text-right"
            >
              Total
            </label>
            <div className="flex items-center pt-2">
              <img src={tezosIconSrc} alt="Tezos" className="w-5 h-5 rounded-full mr-2" />
              128.00
            </div>
          </div>
        </div>

        <div className="p-4">
            <button type="submit" className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500">
              Confirm order
            </button>
          </div>
      </div>
    </div>
  );
};

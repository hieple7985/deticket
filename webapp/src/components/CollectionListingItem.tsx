import { FC } from "react";
import { Link } from "react-router-dom";
import tezosIconSrc from "../assets/images/tezos-icon.png";

export const CollectionListingItem: FC<{ collection: any }> = ({
  collection,
}) => {
  const tezAmount = collection.purchase_amount_mutez / 10**6
  return (
    <Link to={`/collections/${collection.ticket_collection_id}`}>    
      <div
        key={collection.title}
        className="flex flex-col rounded-lg shadow-lg overflow-hidden"
      >
        <div className="flex-shrink-0">
          <img
            className="h-48 w-full object-cover"
            src={collection.imageUrl}
            alt=""
          />
        </div>
        <div className="flex-1 bg-white p-6 flex flex-col justify-between">
          <div className="mt-4 flex space-x-1 text-sm text-gray-500">
            <time dateTime={collection.datetime?.toISOString()}>April 22</time>
            <span aria-hidden="true">&middot;</span>
            <span>6 PM</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-600">
              <span className="hover:underline">{collection.type}</span>
            </p>
            <a href={""} className="block mt-2">
              <p className="text-xl font-semibold text-gray-900">
                {collection.name}
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
              {tezAmount}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

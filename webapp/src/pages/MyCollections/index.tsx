import { useWallet } from "@tezos-contrib/react-wallet-provider";
import { Topbar } from "../../components/Topbar";
import { CollectionListingItem } from "../../components/CollectionListingItem";
import { useQuery } from "react-query";
import { getMyCollections } from "../../client";
import { PlusIcon } from "@heroicons/react/outline";

export const MyCollections = () => {
  const { activeAccount } = useWallet();
  const { data, refetch, isLoading } = useQuery(
    ["getMyCollections", activeAccount?.address],
    getMyCollections,
    {
      enabled: !!activeAccount,
    }
  );
  const collections = data?.data || [];
  return (
    <div className="bg-slate-100 w-screen h-screen">
      <Topbar />
      <div className="relative max-w-7xl mx-auto">
        <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {collections.map((collection: any) => (
            <CollectionListingItem
              collection={collection}
              refetch={refetch}
              isOwner
            />
          ))}
        </div>
      </div>
      {!isLoading && collections.length === 0 && (
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No collections</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new collection.
          </p>
        </div>
      )}
      {/* Oi: {connected ? "true" : "false"}
      <button onClick={() => connectWallet()}>Connect</button> */}
    </div>
  );
};

import { Menu, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  DotsVerticalIcon,
  MinusCircleIcon,
} from "@heroicons/react/outline";
import classNames from "classnames";
import { Fragment, useEffect, useState } from "react";
import { useDeTicketContract } from "../hooks/useContract";
import { useGlobalLoading } from "../hooks/useLoading";
import { waitForTx } from "../utils/tx";

export const CollectionAdminOptions = ({ collection }: { collection: any }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { setLoading } = useGlobalLoading();
  const contract = useDeTicketContract();
  useEffect(() => {
    if (contract) {
      (async () => {
        const s = await contract.storage<{ administrator: boolean }>();
        setIsAdmin(s.administrator);
      })();
    }
  }, [contract]);
  const toggleVerification = async () => {
    setLoading(true);
    try {      
      const res = await contract?.methods
        .set_ticket_collection_verified(
          collection.id.toNumber(),
          !collection.verified
        )
        .send();
        await res?.confirmation(1)
        await waitForTx(res?.opHash!)
        window.location.reload()
    } catch (error) {
      console.log(error)
    }
    setLoading(false);
  };
  if (!isAdmin) {
    return null;
  }
  return (
    <Menu as="div" className="ml-3 relative">
      <div>
        <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <span className="sr-only">Open options</span>
          <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm cursor-pointer"
                  )}
                  onClick={() => toggleVerification()}
                >
                  {!collection.verified ? (
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" /> Mark as
                      verified
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MinusCircleIcon className="w-5 h-5 mr-2" /> Mark as
                      unverified
                    </div>
                  )}
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

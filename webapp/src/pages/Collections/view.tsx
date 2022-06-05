import { PaperClipIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateEditCollectionForm } from "../../components/CreateEditCollectionForm";
import { TicketPreview } from "../../components/TicketPreview";
import { useDeTicketContract } from "../../hooks/useContract";
import { useGlobalLoading } from "../../hooks/useLoading";
import { DashboardLayout } from "../../layouts/Dashboard";

export const CollectionsView = () => {
  const { setLoading } = useGlobalLoading();
  const contract = useDeTicketContract();
  const { collectionId } = useParams();
  const [collection, setCollection] = useState<any>(null);
  useEffect(() => {
    if (contract) {
      (async () => {
        setLoading(true);
        try {
          const s = await contract?.storage<{
            ticket_collections: any;
            last_ticket_collection_id: any;
          }>();
          const ticketCollection = await s.ticket_collections.get(
            parseInt(collectionId!)
          );
          setCollection(ticketCollection);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      })();
    }
  }, [contract, collectionId]);

  if (!collection) {
    return null;
  }

  const renderSectionInfo = (label: string, value: string) => {
    return (
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
      </div>
    );
  };

  const tezAmount = collection?.purchase_amount_mutez.toNumber() / 1000

  return (
    <DashboardLayout>
      <div className="flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow items-center px-8">
          <h1 className="text-xl">{collection.name}</h1>
        </div>
      </div>
      <div className="p-8">
        <section aria-labelledby="applicant-information-title">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2
                id="applicant-information-title"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Ticket Collection Details
              </h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                {renderSectionInfo('Name', collection?.name)}
                {renderSectionInfo('Location', 'Event Location')}
                {renderSectionInfo('Ticket Price', `${tezAmount} ꜩ`)}
                {renderSectionInfo('Ticket Supply', '500')}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">About</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim
                    incididunt cillum culpa consequat. Excepteur qui ipsum
                    aliquip consequat sint. Sit id mollit nulla mollit nostrud
                    in ea officia proident. Irure nostrud pariatur mollit ad
                    adipisicing reprehenderit deserunt qui eu.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

import { useState, useEffect } from "react";
import { useDeTicketContract } from "./useContract";
import { useGlobalLoading } from "./useLoading";

interface UseCollection {
  collection: any;
}

export const useCollection = ({ collectionId } :{ collectionId?: number }): UseCollection => {
  const { setLoading } = useGlobalLoading();
  const contract = useDeTicketContract();
  const [collection, setCollection] = useState<any>(null);
  useEffect(() => {
    if (contract && collectionId !== undefined) {
      (async () => {
        setLoading(true);
        try {
          const s = await contract?.storage<{
            ticket_collections: any;
            last_ticket_collection_id: any;
          }>();
          const ticketCollection = await s.ticket_collections.get(collectionId);
          setCollection(ticketCollection);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      })();
    }
  }, [contract, collectionId, setLoading]);
  return {
    collection,
  }
}

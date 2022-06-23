import { ExternalLinkIcon, QrcodeIcon } from "@heroicons/react/outline";
import { FC, useState } from "react";
import { client } from "../client";
import { useGlobalLoading } from "../hooks/useLoading";
import { formatTicketDate } from "../utils/date";
import { ipfsGatewaySrc } from "../utils/ipfs";
import { getTicketTypeLabel } from "../utils/ticket";
import { TicketTokenPreview } from "./TicketTokenPreview";
import { TransferTicketModal } from "./TransferTicketModal";
import verifiedIconSrc from "../assets/images/verified-icon.svg";
import { Link } from "react-router-dom";

export const TicketTokenListingItem: FC<{
  ticketToken: any;
  auth: () => Promise<string>;
  refetch: () => void;
}> = ({ ticketToken, auth, refetch }) => {
  const { setLoading } = useGlobalLoading();
  const [showPreview, setShowPreview] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [ticketAccessToken, setTicketAccessToken] = useState<null | string>(
    null
  );
  const generateAndViewTicket = async () => {
    setLoading(true);
    const accessToken = await auth();
    const { data } = await client.post(
      "/issue-ticket-token",
      {
        tokenId: ticketToken.token_id,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { token } = data;
    // TODO: Show Ticket with QR Code here
    setTicketAccessToken(token);
    setShowPreview(true);
    setLoading(false);
  };

  const { collection } = ticketToken;
  return (
    <div
      key={ticketToken.name}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
      <TransferTicketModal
        ticket={ticketToken}
        open={showTransfer}
        setOpen={setShowTransfer}
        refetch={refetch}
      />
      <TicketTokenPreview
        ticketToken={ticketToken}
        collection={ticketToken.collection}
        ticketAccessToken={ticketAccessToken}
        show={showPreview}
        setShow={setShowPreview}
      />
      <div className="flex-shrink-0">
        <img
          className="h-48 w-full object-cover"
          src={ipfsGatewaySrc(ticketToken.collection.cover_image)}
          alt=""
        />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 inline py-1 px-2 rounded-full">
            {getTicketTypeLabel(collection.ticket_type)}
          </span>
          <Link to={`/collections/${collection.ticket_collection_id}`} className="block mt-4">
            <p className="text-xs font-semibold text-gray-400 flex text-ellipsis items-center">
              {collection.name}
              {collection.verified && (
                <img
                  src={verifiedIconSrc}
                  alt="Ticket Collection Verified"
                  className="w-3 h-3 ml-1"
                />
              )}
            </p>
          </Link>
        </div>
        <div className="mt-4 flex space-x-1 text-sm text-gray-500">
          <time dateTime={collection.datetime}>
            {formatTicketDate(collection.datetime)}
          </time>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            <span className="hover:underline">{ticketToken.type}</span>
          </p>
          <span className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">
              {ticketToken.name}
            </p>
          </span>
        </div>
      </div>
      <div className="bg-white border border-t-gray-200">
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="w-0 flex-1 flex">
            <a
              onClick={generateAndViewTicket}
              className="cursor-pointer relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
            >
              <QrcodeIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
              <span className="ml-3">View Ticket</span>
            </a>
          </div>
          <div className="-ml-px w-0 flex-1 flex">
            <a
              onClick={() => setShowTransfer(true)}
              className="cursor-pointer relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
            >
              <ExternalLinkIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
              <span className="ml-3">Transfer</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

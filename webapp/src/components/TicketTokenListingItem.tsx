import {
  ExternalLinkIcon,
  QrcodeIcon,
} from "@heroicons/react/outline";
import { FC, useState } from "react";
import { client } from "../client";
import { useGlobalLoading } from "../hooks/useLoading";
import { ipfsGatewaySrc } from "../utils/ipfs";
import { TicketTokenPreview } from "./TicketTokenPreview";

export const TicketTokenListingItem: FC<{ ticketToken: any, auth: () => Promise<string> }> = ({
  ticketToken,
  auth,
}) => {
  const { setLoading } = useGlobalLoading()
  const [showPreview, setShowPreview] = useState(false);
  const [ticketAccessToken, setTicketAccessToken] = useState<null | string>(null)
  const generateAndViewTicket = async () => {
    setLoading(true)
    const accessToken = await auth()
    const { data } = await client.post('/issue-ticket-token', {
      tokenId: ticketToken.token_id,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
    const { token } = data;
    // TODO: Show Ticket with QR Code here
    setTicketAccessToken(token)
    setShowPreview(true)
    setLoading(false)
  };

  console.log(ticketToken.collection)

  return (
    <div
      key={ticketToken.name}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
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
        <div className="mt-4 flex space-x-1 text-sm text-gray-500">
          <time dateTime={ticketToken.datetime}>April 22</time>
          <span aria-hidden="true">&middot;</span>
          <span>6 PM</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            <span className="hover:underline">{ticketToken.type}</span>
          </p>
          <a href={""} className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">
              {ticketToken.name}
            </p>
          </a>
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
            <a className="cursor-pointer relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500">
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

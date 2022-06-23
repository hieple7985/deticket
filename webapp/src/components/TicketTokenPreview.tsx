import { createRef, FC, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { formatTicketDate } from "../utils/date";
import { ipfsGatewaySrc } from "../utils/ipfs";
import html2pdf from "html2pdf.js";
import { DocumentDownloadIcon, XIcon } from "@heroicons/react/outline";
import classNames from "classnames";
import verifiedIconSrc from "../assets/images/verified-icon.svg";
import { getTicketTypeLabel } from "../utils/ticket";

interface TicketTokenPreviewProps {
  ticketToken: any;
  collection: any;
  ticketAccessToken: string | null;
  show: boolean;
  setShow: (show: boolean) => void;
}

export const TicketTokenPreview: FC<TicketTokenPreviewProps> = ({
  ticketToken,
  collection,
  show,
  ticketAccessToken,
  setShow,
}) => {
  const [animateFinished, setAnimateFinished] = useState(false);
  if (!show || !ticketAccessToken) {
    return null;
  }
  const generatePDF = () => {
    setAnimateFinished(true);
    var element = document.getElementById("ticket-preview");
    html2pdf()
      .from(element)
      .set({
        filename: `deTicket-${ticketToken.name}`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 6, useCORS: true, allowTaint: true },
        jsPDF: { unit: "px", format: [1000, 400], orientation: "landscape" },
      })
      .save();
  };
  const cardClassNames = classNames(
    "bg-white overflow-hidden rounded-lg sm:shadow",
    {
      "animate__animated animate__flipInX": !animateFinished,
    }
  );
  return (
    <div
      style={{ background: "radial-gradient(#434343, #151515)" }}
      className="min-w-[800px] min-h-[400px] w-screen h-screen flex items-center justify-center fixed top-0 left-0 z-50"
    >
      <button
        className="absolute top-[32px] right-[32px] text-white"
        onClick={() => setShow(false)}
      >
        <XIcon className="h-8 w-8" />
      </button>
      <div>
        <div id="ticket-preview" className={cardClassNames}>
          <div className="flex">
            <div>
              <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 w-[480px]">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  {ticketToken.name}
                  {collection.verified && (
                    <img
                      src={verifiedIconSrc}
                      alt="Ticket Collection Verified"
                      className="w-4 h-4 ml-2"
                    />
                  )}
                </h3>
              </div>
              <div
                className="bg-cover w-full h-32 bg-center"
                style={{
                  backgroundImage: `url(${ipfsGatewaySrc(
                    collection.cover_image
                  )})`,
                }}
              ></div>
              <div className="p-8 border-b border-gray-200">
                <dl className="grid gap-x-4 gap-y-8 grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {collection.location}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Date / Time
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatTicketDate(collection.datetime)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="border-l-2 border-gray-400 border-dotted flex items-center p-4 px-12">
              <div className="w-full">
                <div className="w-full text-center mb-1 text-gray-500">
                  #{ticketToken.token_id.toString().padStart(8, "0")}
                </div>
                <div className="w-full text-center mb-4 text-gray-300 font-extrabold">
                  {getTicketTypeLabel(collection.ticket_type).toUpperCase()}
                </div>
                <div className="w-full flex items-center justify-center">
                  <QRCode
                    value={ticketAccessToken}
                    size={160}
                    className="text-center"
                  />
                </div>
                <p className="text-center text-xs text-red-400 mt-4 font-bold">
                  Note: Keep this QR Code safe
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-center mt-12">
          <button
            onClick={() => generatePDF()}
            className="inline-flex items-center text-lg px-4 py-2 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentDownloadIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

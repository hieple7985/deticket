import { useWallet } from "@tezos-contrib/react-wallet-provider";
import { DashboardLayout } from "../../layouts/Dashboard";
import { useNavigate } from "react-router-dom";
import { Topbar } from "../../components/Topbar";
import { CollectionListingItem } from "../../components/CollectionListingItem";
import { useQuery } from "react-query";
import { getAllCollections, getMyTickets } from "../../client";
import { TicketTokenListingItem } from "../../components/TicketTokenListingItem";
import { useAuth } from "../../hooks/useAuth";

export const MyTickets = () => {
  const { activeAccount } = useWallet();
  const navigate = useNavigate();
  const { data, refetch, isLoading } = useQuery(
    ["getMyTickets", activeAccount?.address],
    getMyTickets,
    {
      enabled: !!activeAccount,
    }
  );
  const { auth } = useAuth();
  const ticketTokens = data?.data || [];
  return (
    <div className="bg-slate-100 w-screen h-screen">
      <Topbar />
      <div className="relative max-w-7xl mx-auto">
        <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {ticketTokens.map((ticketToken: any) => (
            <TicketTokenListingItem
              ticketToken={ticketToken}
              auth={auth}
              refetch={refetch}
            />
          ))}
        </div>
      </div>
      {!isLoading && ticketTokens.length === 0 && (
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
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by purchasing a ticket.
          </p>
        </div>
      )}
      {/* Oi: {connected ? "true" : "false"}
      <button onClick={() => connectWallet()}>Connect</button> */}
    </div>
  );
};

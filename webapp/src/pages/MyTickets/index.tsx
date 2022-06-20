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
  const { activeAccount } = useWallet()
  const navigate = useNavigate();
  const { data } = useQuery(['getMyTickets', activeAccount?.address], getMyTickets, {
    enabled: !!activeAccount
  })
  const { auth } = useAuth()
  console.log(data)
  const ticketTokens = data?.data || []
  return (
    <div className="bg-slate-100 w-screen h-screen">
      <Topbar />
      <div className="relative max-w-7xl mx-auto">
        <div className="mt-8">
          <h2 className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-2xl">
            Next Events
          </h2>
          <p className="mt-3 text-md text-gray-500 sm:mt-4">
            Nullam risus blandit ac aliquam justo ipsum. Quam mauris volutpat
            massa dictumst amet. Sapien tortor lacus arcu.
          </p>
        </div>

        <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {ticketTokens.map((ticketToken: any) => (
            <TicketTokenListingItem ticketToken={ticketToken} auth={auth} />
          ))}
        </div>
      </div>
      {/* Oi: {connected ? "true" : "false"}
      <button onClick={() => connectWallet()}>Connect</button> */}
    </div>
  );
};

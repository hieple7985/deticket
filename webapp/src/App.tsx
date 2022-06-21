import React, { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { WalletProvider } from "@tezos-contrib/react-wallet-provider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import 'react-dates/initialize';

// Page Components
import { HomeIndex } from "./pages/Home";
import { CollectionsNew } from "./pages/Collections/new";
import { GlobalLoading } from "./hooks/useLoading";
import { GlobalLoadingContainer } from "./components/GlobalLoadingContainer";
import { CollectionView } from "./pages/CollectionView/id";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./client";
import { MyTickets } from "./pages/MyTickets";
import { MyCollections } from "./pages/MyCollections";

const WP = WalletProvider as any;

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <GlobalLoading.Provider value={{ loading, setLoading }}>
      <ToastContainer />
      <GlobalLoadingContainer loading={loading} />
      <QueryClientProvider client={queryClient}>
        <WP name="deticket" clientType="taquito" network="ITHACANET">
          <HashRouter>
            <Routes>
              <Route path="/new-collection" element={<CollectionsNew />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/my-collections" element={<MyCollections />} />
              <Route
                path="/collections/:collectionId"
                element={<CollectionView />}
              />
              <Route index element={<HomeIndex />} />
            </Routes>
          </HashRouter>
        </WP>
      </QueryClientProvider>
    </GlobalLoading.Provider>
  );
}

export default App;

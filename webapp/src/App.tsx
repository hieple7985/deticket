import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { WalletProvider } from '@tezos-contrib/react-wallet-provider';


// Page Components
import { HomeIndex } from './pages/Home';
import { DashboardIndex } from './pages/Dashboard';
import { CollectionsNew } from './pages/Collections/new';
import { GlobalLoading } from './hooks/useLoading';
import { GlobalLoadingContainer } from './components/GlobalLoadingContainer';
import { CollectionsView } from './pages/Collections/view';
import { PurchaseTicket } from './pages/Purchase/id';

const WP = WalletProvider as any;

function App() {
  const [loading, setLoading] = useState<boolean>(false)
  return (
    <GlobalLoading.Provider value={{ loading, setLoading }}>
      <GlobalLoadingContainer loading={loading} />
      <WP name="deticket" clientType="taquito" network="ITHACANET">
        <HashRouter>
          <Routes>
            <Route path="/">
              <Route index element={<HomeIndex />} />
              <Route path="dashboard">
                <Route index element={<DashboardIndex />} />
                <Route path="collections">
                  <Route path=":collectionId" element={<CollectionsView />} />
                  <Route path="new" element={<CollectionsNew />} />
                </Route>
                {/* <Route path=":teamId" element={<Team />} />
                <Route path="new" element={<NewTeamForm />} />
              <Route index element={<LeagueStandings />} /> */}
              </Route>
              <Route path="purchase/:collectionId" element={<PurchaseTicket />} />
            </Route>
          </Routes>
        </HashRouter>
      </WP>
    </GlobalLoading.Provider>
  );
}

export default App;

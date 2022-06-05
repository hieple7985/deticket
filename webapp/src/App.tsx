import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

// Page Components
import { HomeIndex } from './pages/Home';
import { DashboardIndex } from './pages/Dashboard';
import { DashboardLayout } from './layouts/Dashboard';

function App() {
  return (
    <HashRouter>
    <Routes>
      <Route path="/">
        <Route index element={<HomeIndex />} />
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          {/* <Route path=":teamId" element={<Team />} />
          <Route path="new" element={<NewTeamForm />} />
          <Route index element={<LeagueStandings />} /> */}
        </Route>
      </Route>
    </Routes>
  </HashRouter>
  );
}

export default App;

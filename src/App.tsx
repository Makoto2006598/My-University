
import React from 'react';
import { Layout } from './components/Layout';
import { CampusPlanner } from './components/game/CampusPlanner';

const App: React.FC = () => {
  return (
    <Layout>
      <CampusPlanner />
    </Layout>
  );
};

export default App;


import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { CampusPlanner } from './components/game/CampusPlanner';
import { EngineConsultant } from './components/EngineConsultant';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [currentMode, setMode] = useState<ViewMode>(ViewMode.PROTOTYPE);

  return (
    <Layout currentMode={currentMode} setMode={setMode}>
      {currentMode === ViewMode.PROTOTYPE ? (
        <CampusPlanner />
      ) : (
        <EngineConsultant />
      )}
    </Layout>
  );
};

export default App;

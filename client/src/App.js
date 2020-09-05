import React, { useState } from 'react';

import './App.css';
import TileGrid from './TileGrid';
import Button from './Button';

function App() {
  const [reset, setReset] = useState(false);

  return (
    // BEM
    <div className="app">
      {/* <ColorPicker setColor={setColor} /> */}
      <TileGrid width={5} reset={reset} />
      <Button reset={reset} setReset={setReset} />
    </div>
  );
}

export default App;

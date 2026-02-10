import { useEffect } from 'react';
import './App.css'
import Pokelist from './components/pokelist'

function App() {

  useEffect(() => {
    console.log("App component mounted");
  }, []);

  return (
    <div className="app-container">
      <Pokelist />
    </div>
  )

}

export default App

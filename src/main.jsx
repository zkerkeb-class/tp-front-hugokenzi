import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router";
import PokemonDetails from './screens/pokemonDetails.jsx';
import CreatePokemon from './screens/createPokemon.jsx';
import PokeQuizz from './screens/pokeQuizz.jsx';

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
    <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
        <Route path="/create" element={<CreatePokemon />} />
        <Route path="/quizz" element={<PokeQuizz />} />
        <Route path="/pokemonDetails/:url" element={<PokemonDetails />} />
    </Routes>
</BrowserRouter>
,
)

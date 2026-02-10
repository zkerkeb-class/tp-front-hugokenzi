import React from 'react';
import { Link } from 'react-router';
import './CardPokemon.css';

const typeColors = {
    grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820',
    normal: '#A8A878', poison: '#A040A0', electric: '#F8D030', ground: '#E0C068',
    fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
    ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', flying: '#A890F0'
};

const singleTypeGradients = {
    grass: 'linear-gradient(135deg, rgba(120, 200, 80, 0.4) 0%, rgba(120, 200, 80, 0.1) 100%)',
    fire: 'linear-gradient(135deg, rgba(240, 128, 48, 0.4) 0%, rgba(240, 128, 48, 0.1) 100%)',
    water: 'linear-gradient(135deg, rgba(104, 144, 240, 0.4) 0%, rgba(104, 144, 240, 0.1) 100%)',
    bug: 'linear-gradient(135deg, rgba(168, 184, 32, 0.4) 0%, rgba(168, 184, 32, 0.1) 100%)',
    normal: 'linear-gradient(135deg, rgba(168, 168, 120, 0.4) 0%, rgba(168, 168, 120, 0.1) 100%)',
    poison: 'linear-gradient(135deg, rgba(160, 64, 160, 0.4) 0%, rgba(160, 64, 160, 0.1) 100%)',
    electric: 'linear-gradient(135deg, rgba(248, 208, 48, 0.4) 0%, rgba(248, 208, 48, 0.1) 100%)',
    ground: 'linear-gradient(135deg, rgba(224, 192, 104, 0.4) 0%, rgba(224, 192, 104, 0.1) 100%)',
    fairy: 'linear-gradient(135deg, rgba(238, 153, 172, 0.4) 0%, rgba(238, 153, 172, 0.1) 100%)',
    fighting: 'linear-gradient(135deg, rgba(192, 48, 40, 0.4) 0%, rgba(192, 48, 40, 0.1) 100%)',
    psychic: 'linear-gradient(135deg, rgba(248, 88, 136, 0.4) 0%, rgba(248, 88, 136, 0.1) 100%)',
    rock: 'linear-gradient(135deg, rgba(184, 160, 56, 0.4) 0%, rgba(184, 160, 56, 0.1) 100%)',
    ghost: 'linear-gradient(135deg, rgba(112, 88, 152, 0.4) 0%, rgba(112, 88, 152, 0.1) 100%)',
    ice: 'linear-gradient(135deg, rgba(152, 216, 216, 0.4) 0%, rgba(152, 216, 216, 0.1) 100%)',
    dragon: 'linear-gradient(135deg, rgba(112, 56, 248, 0.4) 0%, rgba(112, 56, 248, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(112, 88, 72, 0.4) 0%, rgba(112, 88, 72, 0.1) 100%)',
    steel: 'linear-gradient(135deg, rgba(184, 184, 208, 0.4) 0%, rgba(184, 184, 208, 0.1) 100%)',
    flying: 'linear-gradient(135deg, rgba(168, 144, 240, 0.4) 0%, rgba(168, 144, 240, 0.1) 100%)'
};

function PokeCard({ pokemon, isFavorite, onFavoriteClick }) {
    if (!pokemon) return <div className="poke-card loading">Chargement...</div>;

    // Calcul du fond
    const type1 = pokemon.type[0]?.toLowerCase();
    const type2 = pokemon.type[1]?.toLowerCase();
    let backgroundStyle;

    if (type2) {
        const color1 = typeColors[type1] || '#A8A878';
        const color2 = typeColors[type2] || '#A8A878';
        backgroundStyle = `linear-gradient(135deg, ${color1}99 0%, ${color2}99 100%)`;
    } else {
        backgroundStyle = singleTypeGradients[type1] || singleTypeGradients.normal;
    }

    return (
        <div 
            className="poke-card" 
            style={{ background: backgroundStyle }}
        >
            <div className="favorite-btn" onClick={(e) => {
                e.stopPropagation();
                onFavoriteClick();
            }}>
                {isFavorite ? '❤️' : '🤍'}
            </div>
            
            <div className="img-container">
                <img 
                    src={pokemon.image} 
                    alt={pokemon.name.english} 
                    className="poke-img"
                />
            </div>

            <Link to={`/pokemon/${pokemon.id}`} className="card-link">
                <div className="card-info">
                    <h2 className="poke-name">{pokemon.name.english}</h2>
                    <span className="poke-id">#{pokemon.id.toString().padStart(3, '0')}</span>
                </div>

                <div className="types-container">
                    {pokemon.type.map((typeName, index) => {
                        const color = typeColors[typeName.toLowerCase()] || '#777';
                        return (
                            <span 
                                key={index} 
                                className="type-badge"
                                style={{ 
                                    backgroundColor: color, 
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                }}
                            >
                                {typeName}
                            </span>
                        );
                    })}
                </div>
            </Link>
        </div>
    );
}

export default PokeCard;
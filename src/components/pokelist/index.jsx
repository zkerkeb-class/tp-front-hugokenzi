import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import PokeCard from "../pokeCard/CardPokemon";

import './index.css';

const typeColors = {
    grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820',
    normal: '#A8A878', poison: '#A040A0', electric: '#F8D030', ground: '#E0C068',
    fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
    ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', flying: '#A890F0'
};

const allTypes = Object.keys(typeColors);

const PokeList = () => {
    const [pokemons, setPokemons] = useState([]);
    const [allPokemonsData, setAllPokemonsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showScrollToTop, setShowScrollToTop] = useState(false);

    // Charger les favoris depuis localStorage
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
        setFavorites(savedFavorites);
    }, []);

    // Sauvegarder les favoris dans localStorage
    useEffect(() => {
        localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
    }, [favorites]);

    // Détecter le scroll pour afficher le bouton "Retour en haut"
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Charge les Pokémons avec pagination
    useEffect(() => {
        const fetchPokemons = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/pokemons?page=${currentPage}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Données reçues:", data);
                setPokemons(data.data);
                setTotalPages(data.totalPages);
                setIsSearching(false);
                setSearchResult(null);
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!isSearching && !showFavoritesOnly) {
            fetchPokemons();
        }
    }, [currentPage, isSearching, showFavoritesOnly]);

    // Recherche en temps réel avec délai
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!searchQuery.trim()) {
                setIsSearching(false);
                setSearchResults([]);
                setSelectedTypes([]);
                setLoading(false);
                return;
            }

            const performSearch = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`http://localhost:3000/api/pokemons/search/${encodeURIComponent(searchQuery)}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        setSearchResults(Array.isArray(data) ? data : []);
                        setIsSearching(true);
                    } else {
                        setSearchResults([]);
                        setIsSearching(true);
                    }
                } catch (error) {
                    console.error("Erreur de recherche:", error);
                    setSearchResults([]);
                    setIsSearching(true);
                } finally {
                    setLoading(false);
                }
            };

            performSearch();
        }, 300); // Délai de 300ms avant de déclencher la recherche

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Charger tous les pokémons quand un filtre de type est sélectionné
    useEffect(() => {
        if (selectedTypes.length > 0) {
            const fetchAllPokemons = async () => {
                try {
                    setLoading(true);
                    let allPokemonsTemp = [];
                    let page = 1;
                    let hasMore = true;

                    // Charger tous les pokémons (pagination 20/page)
                    while (hasMore) {
                        const response = await fetch(`http://localhost:3000/api/pokemons?page=${page}`);
                        if (response.ok) {
                            const data = await response.json();
                            allPokemonsTemp = [...allPokemonsTemp, ...data.data];
                            hasMore = page < data.totalPages;
                            page++;
                        } else {
                            hasMore = false;
                        }
                    }

                    setAllPokemonsData(allPokemonsTemp);
                } catch (error) {
                    console.error("Erreur de chargement de tous les pokémons:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchAllPokemons();
        }
    }, [selectedTypes]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setSelectedTypes([]);
        setSortBy('id');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    // Filtre par types - utilise tous les pokémons s'ils sont chargés, sinon juste la page courante
    const pokemonsToFilter = selectedTypes.length > 0 && allPokemonsData.length > 0 ? allPokemonsData : pokemons;
    const filteredByType = useMemo(() => {
        if (selectedTypes.length === 0) return pokemons;
        return pokemonsToFilter.filter(pokemon => 
            selectedTypes.every(type => pokemon.type.map(t => t.toLowerCase()).includes(type.toLowerCase()))
        );
    }, [pokemonsToFilter, selectedTypes]);

    // Vérifier quels types sont disponibles pour former une combinaison valide
    const getAvailableTypesForSelection = useMemo(() => {
        const dataToCheck = selectedTypes.length > 0 && allPokemonsData.length > 0 ? allPokemonsData : pokemons;
        const availableTypes = new Set();

        dataToCheck.forEach(pokemon => {
            if (selectedTypes.length === 0) {
                // Aucun type sélectionné: tous les types sont disponibles
                pokemon.type.forEach(t => {
                    availableTypes.add(t.toLowerCase());
                });
            } else if (selectedTypes.length === 1) {
                // Un type sélectionné: trouver les types qui peuvent le combiner
                if (pokemon.type.map(t => t.toLowerCase()).includes(selectedTypes[0].toLowerCase())) {
                    pokemon.type.forEach(t => {
                        availableTypes.add(t.toLowerCase());
                    });
                }
            }
        });

        return availableTypes;
    }, [pokemons, selectedTypes, allPokemonsData]);

    const isTypeDisabled = (typeToCheck) => {
        // Si le type est déjà sélectionné, ne pas le désactiver
        if (selectedTypes.includes(typeToCheck)) return false;
        
        // Si aucun type n'est sélectionné, aucun n'est désactivé
        if (selectedTypes.length === 0) return false;
        
        // Si déjà 2 types sélectionnés, tous les autres sont désactivés
        if (selectedTypes.length >= 2) return true;
        
        // Si 1 type sélectionné, vérifier si ce nouveau type est disponible
        return !getAvailableTypesForSelection.has(typeToCheck.toLowerCase());
    };

    const toggleType = (type) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter(t => t !== type));
            // Réinitialiser la page quand on retire un filtre
            if (selectedTypes.length === 1) {
                setCurrentPage(1);
            }
        } else {
            if (selectedTypes.length < 2) {
                setSelectedTypes([...selectedTypes, type]);
                // Réinitialiser la page quand on ajoute un filtre
                setCurrentPage(1);
            }
        }
    };

    // Fonction de tri
    const sortPokemons = (pokemonsToSort) => {
        const sorted = [...pokemonsToSort];
        
        sorted.sort((a, b) => {
            let comparison = 0;
            
            switch(sortBy) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'name':
                    comparison = a.name.english.localeCompare(b.name.english);
                    break;
                case 'hp':
                    comparison = a.base.HP - b.base.HP;
                    break;
                case 'attack':
                    comparison = a.base.Attack - b.base.Attack;
                    break;
                case 'defense':
                    comparison = a.base.Defense - b.base.Defense;
                    break;
                case 'sp-attack':
                    comparison = a.base.SpecialAttack - b.base.SpecialAttack;
                    break;
                case 'sp-defense':
                    comparison = a.base.SpecialDefense - b.base.SpecialDefense;
                    break;
                case 'speed':
                    comparison = a.base.Speed - b.base.Speed;
                    break;
                default:
                    comparison = a.id - b.id;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return sorted;
    };

    // Toggle favori
    const toggleFavorite = (pokemonId) => {
        if (favorites.includes(pokemonId)) {
            setFavorites(favorites.filter(id => id !== pokemonId));
        } else {
            setFavorites([...favorites, pokemonId]);
        }
    };

    // Afficher les favoris
    const displayedFavorites = favorites.map(id => pokemons.find(p => p.id === id)).filter(Boolean);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Composant Skeleton Screen
    const SkeletonCard = () => (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-types">
                    <div className="skeleton-type"></div>
                    <div className="skeleton-type"></div>
                </div>
            </div>
        </div>
    );

    if (loading && pokemons.length === 0) {
        return (
            <div className="pokelist-container">
                <h1 className="main-title">Pokédex</h1>
                <div className="skeletons-loading">
                    <div className="poke-list">
                        {[...Array(20)].map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pokelist-container">
            <h1 className="main-title">Pokédex</h1>
            
            <div className="filters-container">
                <div className="top-filters">
                    <input
                        className="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                    />
                    {(searchQuery || selectedTypes.length > 0) && (
                        <button onClick={handleClearFilters} className="clear-btn">
                            ✕ Réinitialiser
                        </button>
                    )}
                    <div className="sort-controls">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="id">Tri: Pokédex (ID)</option>
                            <option value="name">Tri: Nom (A-Z)</option>
                            <option value="hp">Tri: PV</option>
                            <option value="attack">Tri: Attaque</option>
                            <option value="defense">Tri: Défense</option>
                            <option value="sp-attack">Tri: Att. Spé</option>
                            <option value="sp-defense">Tri: Dif. Spé</option>
                            <option value="speed">Tri: Vitesse</option>
                        </select>
                        <button 
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="sort-order-btn"
                            title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                    <button
                        className={`favorites-toggle-btn ${showFavoritesOnly ? 'active' : ''}`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    >
                        ❤️ Favoris ({favorites.length})
                    </button>
                    <Link to="/quizz" className="quizz-btn">🎮 Quizz</Link>
                    <Link to="/create" className="create-btn">+ Nouveau</Link>
                </div>

                {!showFavoritesOnly && (
                    <div className="type-filters-area">
                        <div className="types-label">
                            {selectedTypes.length === 0 
                                ? "Filtrer par types (max 2)" 
                                : `Types : ${selectedTypes.join(' + ')}`
                            }
                        </div>
                        <div className="types-grid">
                            {allTypes.map(type => (
                                <button
                                    key={type}
                                    className={`type-filter-btn ${selectedTypes.includes(type) ? 'active' : ''}`}
                                    style={{ backgroundColor: typeColors[type] }}
                                    onClick={() => toggleType(type)}
                                    disabled={isTypeDisabled(type) && !selectedTypes.includes(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isSearching && searchResults.length > 0 ? (
                <div className="search-results-section">
                    <div className="search-results-info">
                        <p>{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="poke-list">
                        {sortPokemons(searchResults).map((pokemon) => (
                            <PokeCard 
                                key={pokemon.id}
                                pokemon={pokemon}
                                isFavorite={favorites.includes(pokemon.id)}
                                onFavoriteClick={() => toggleFavorite(pokemon.id)}
                            />
                        ))}
                    </div>
                </div>
            ) : isSearching && searchResults.length === 0 ? (
                <div className="search-results-section">
                    <p className="no-results">Aucun Pokémon trouvé pour "{searchQuery}"</p>
                </div>
            ) : showFavoritesOnly ? (
                <div className="favorites-section">
                    {displayedFavorites.length === 0 ? (
                        <p className="no-favorites">Aucun favori pour le moment ! ❤️</p>
                    ) : (
                        <div className="poke-list">
                            {sortPokemons(displayedFavorites).map((pokemon) => (
                                <PokeCard 
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    isFavorite={true}
                                    onFavoriteClick={() => toggleFavorite(pokemon.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="poke-list">
                    {sortPokemons(selectedTypes.length > 0 ? filteredByType : filteredByType).map((pokemon) => (
                        <PokeCard 
                            key={pokemon.id}
                            pokemon={pokemon}
                            isFavorite={favorites.includes(pokemon.id)}
                            onFavoriteClick={() => toggleFavorite(pokemon.id)}
                        />
                    ))}
                </div>
            )}

            {!isSearching && !showFavoritesOnly && selectedTypes.length === 0 && (
                <div className="pagination">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                        ← Précédent
                    </button>
                    <span className="page-info">Page {currentPage}/{totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Suivant →
                    </button>
                </div>
            )}

            {showScrollToTop && (
                <button 
                    className="scroll-to-top-btn" 
                    onClick={scrollToTop}
                    title="Retour en haut"
                >
                    ↑
                </button>
            )}
        </div>
    );
};

export default PokeList;

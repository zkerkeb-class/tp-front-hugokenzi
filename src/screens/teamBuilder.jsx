import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import './teamBuilder.css';

const typeColors = {
    grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820',
    normal: '#A8A878', poison: '#A040A0', electric: '#F8D030', ground: '#E0C068',
    fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
    ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', flying: '#A890F0'
};

const MAX_TEAM_SIZE = 6;

const TeamBuilder = () => {
    const [allPokemons, setAllPokemons] = useState([]);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAssistant, setShowAssistant] = useState(false);
    const [assistantSuggestions, setAssistantSuggestions] = useState([]);

    // Charger tous les pokémons
    useEffect(() => {
        const fetchAllPokemons = async () => {
            try {
                setLoading(true);
                let all = [];
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    const response = await fetch(`http://localhost:3000/api/pokemons?page=${page}`);
                    if (response.ok) {
                        const data = await response.json();
                        all = [...all, ...data.data];
                        hasMore = page < data.totalPages;
                        page++;
                    } else {
                        hasMore = false;
                    }
                }

                setAllPokemons(all);
            } catch (error) {
                console.error("Erreur de chargement:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPokemons();
    }, []);

    // Types déjà présents dans l'équipe
    const teamTypes = useMemo(() => {
        const types = new Set();
        team.forEach(p => p.type.forEach(t => types.add(t.toLowerCase())));
        return types;
    }, [team]);

    // Générer les suggestions de l'assistant (pokémons avec des types différents)
    useEffect(() => {
        if (!showAssistant || team.length >= MAX_TEAM_SIZE) {
            setAssistantSuggestions([]);
            return;
        }

        const teamIds = new Set(team.map(p => p.id));

        // Filtrer les pokémons qui ont au moins un type NON présent dans l'équipe
        const candidates = allPokemons.filter(p => {
            if (teamIds.has(p.id)) return false;
            // Au moins un type du pokémon ne doit pas être dans l'équipe
            return p.type.some(t => !teamTypes.has(t.toLowerCase()));
        });

        // Trier par nombre de types "nouveaux" (ceux qui apportent le plus de diversité en premier)
        const scored = candidates.map(p => {
            const newTypes = p.type.filter(t => !teamTypes.has(t.toLowerCase())).length;
            return { pokemon: p, newTypes };
        });

        scored.sort((a, b) => b.newTypes - a.newTypes);

        // Prendre 12 suggestions aléatoires parmi les meilleurs candidats
        const topCandidates = scored.filter(s => s.newTypes > 0);
        const shuffled = topCandidates.sort(() => Math.random() - 0.5);
        setAssistantSuggestions(shuffled.slice(0, 12).map(s => s.pokemon));
    }, [showAssistant, team, allPokemons, teamTypes]);

    // Recherche parmi tous les pokémons
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const teamIds = new Set(team.map(p => p.id));
        return allPokemons
            .filter(p => !teamIds.has(p.id))
            .filter(p =>
                p.name.english.toLowerCase().includes(query) ||
                p.name.french.toLowerCase().includes(query) ||
                (p.name.japanese && p.name.japanese.includes(query)) ||
                (p.name.chinese && p.name.chinese.includes(query))
            )
            .slice(0, 20);
    }, [searchQuery, allPokemons, team]);

    const addToTeam = (pokemon) => {
        if (team.length >= MAX_TEAM_SIZE) return;
        if (team.find(p => p.id === pokemon.id)) return;
        setTeam([...team, pokemon]);
    };

    const removeFromTeam = (pokemonId) => {
        setTeam(team.filter(p => p.id !== pokemonId));
    };

    const clearTeam = () => {
        setTeam([]);
    };

    const refreshSuggestions = () => {
        // Force re-render des suggestions en togglant l'assistant
        setShowAssistant(false);
        setTimeout(() => setShowAssistant(true), 50);
    };

    // Calcul de la couverture de types
    const typeCoverage = useMemo(() => {
        const allTypesList = Object.keys(typeColors);
        const covered = allTypesList.filter(t => teamTypes.has(t));
        return { covered: covered.length, total: allTypesList.length };
    }, [teamTypes]);

    if (loading) {
        return (
            <div className="team-builder">
                <Link to="/" className="btn-back">← Retour à la liste</Link>
                <div className="team-loading">
                    <div className="pokeball-spinner"></div>
                    <p>Chargement des Pokémon...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="team-builder">
            <Link to="/" className="btn-back">← Retour à la liste</Link>

            <div className="team-builder-container">
                <h1>Création d'Équipe</h1>
                <p className="team-subtitle">Constitue ton équipe de {MAX_TEAM_SIZE} Pokémon !</p>

                {/* Slots d'équipe */}
                <div className="team-slots">
                    {[...Array(MAX_TEAM_SIZE)].map((_, index) => {
                        const pokemon = team[index];
                        return (
                            <div
                                key={index}
                                className={`team-slot ${pokemon ? 'filled' : 'empty'}`}
                                style={pokemon ? {
                                    borderColor: typeColors[pokemon.type[0]?.toLowerCase()] || '#ffcb05'
                                } : {}}
                            >
                                {pokemon ? (
                                    <>
                                        <button className="remove-btn" onClick={() => removeFromTeam(pokemon.id)}>✕</button>
                                        <img src={pokemon.image} alt={pokemon.name.english} />
                                        <span className="slot-name">{pokemon.name.french || pokemon.name.english}</span>
                                        <div className="slot-types">
                                            {pokemon.type.map((t, i) => (
                                                <span
                                                    key={i}
                                                    className="mini-type-badge"
                                                    style={{ backgroundColor: typeColors[t.toLowerCase()] || '#888' }}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-slot-content">
                                        <span className="empty-slot-icon">?</span>
                                        <span className="empty-slot-text">Slot {index + 1}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Couverture de types + actions */}
                <div className="team-info-bar">
                    <div className="type-coverage">
                        <span className="coverage-label">Couverture des types :</span>
                        <span className="coverage-value">{typeCoverage.covered}/{typeCoverage.total}</span>
                        <div className="coverage-bar">
                            <div
                                className="coverage-fill"
                                style={{ width: `${(typeCoverage.covered / typeCoverage.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="team-actions">
                        {team.length > 0 && (
                            <button className="clear-team-btn" onClick={clearTeam}>🗑 Vider l'équipe</button>
                        )}
                    </div>
                </div>

                {/* Types couverts */}
                {team.length > 0 && (
                    <div className="covered-types">
                        {Object.keys(typeColors).map(type => (
                            <span
                                key={type}
                                className={`coverage-type-badge ${teamTypes.has(type) ? 'covered' : 'not-covered'}`}
                                style={teamTypes.has(type) ? { backgroundColor: typeColors[type] } : {}}
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                )}

                {/* Assistant de création */}
                <div className="assistant-section">
                    <button
                        className={`assistant-toggle ${showAssistant ? 'active' : ''}`}
                        onClick={() => setShowAssistant(!showAssistant)}
                        disabled={team.length >= MAX_TEAM_SIZE}
                    >
                        🤖 {showAssistant ? "Masquer l'assistant" : "Assistant de création"}
                    </button>

                    {showAssistant && team.length < MAX_TEAM_SIZE && (
                        <div className="assistant-panel">
                            <div className="assistant-header">
                                <h3>🤖 Suggestions de l'assistant</h3>
                                <p className="assistant-desc">
                                    {team.length === 0
                                        ? "Choisis ton premier Pokémon pour commencer !"
                                        : `Voici des Pokémon avec des types différents de ton équipe pour maximiser ta couverture.`
                                    }
                                </p>
                                <button className="refresh-btn" onClick={refreshSuggestions}>🔄 Autres suggestions</button>
                            </div>
                            <div className="suggestions-grid">
                                {assistantSuggestions.map(pokemon => (
                                    <div
                                        key={pokemon.id}
                                        className="suggestion-card"
                                        onClick={() => addToTeam(pokemon)}
                                    >
                                        <img src={pokemon.image} alt={pokemon.name.english} />
                                        <span className="suggestion-name">{pokemon.name.french || pokemon.name.english}</span>
                                        <div className="suggestion-types">
                                            {pokemon.type.map((t, i) => (
                                                <span
                                                    key={i}
                                                    className="mini-type-badge"
                                                    style={{ backgroundColor: typeColors[t.toLowerCase()] || '#888' }}
                                                >
                                                    {t}
                                                    {!teamTypes.has(t.toLowerCase()) && <span className="new-type-indicator">★</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {team.length >= MAX_TEAM_SIZE && showAssistant && (
                        <div className="assistant-panel">
                            <p className="team-complete-msg">✅ Ton équipe est complète !</p>
                        </div>
                    )}
                </div>

                {/* Recherche manuelle */}
                <div className="manual-search-section">
                    <h2>Recherche manuelle</h2>
                    <input
                        className="team-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un Pokémon..."
                        disabled={team.length >= MAX_TEAM_SIZE}
                    />

                    {searchQuery.trim() && searchResults.length > 0 && (
                        <div className="search-results-grid">
                            {searchResults.map(pokemon => (
                                <div
                                    key={pokemon.id}
                                    className="suggestion-card"
                                    onClick={() => addToTeam(pokemon)}
                                >
                                    <img src={pokemon.image} alt={pokemon.name.english} />
                                    <span className="suggestion-name">{pokemon.name.french || pokemon.name.english}</span>
                                    <div className="suggestion-types">
                                        {pokemon.type.map((t, i) => (
                                            <span
                                                key={i}
                                                className="mini-type-badge"
                                                style={{ backgroundColor: typeColors[t.toLowerCase()] || '#888' }}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchQuery.trim() && searchResults.length === 0 && (
                        <p className="no-results">Aucun Pokémon trouvé pour "{searchQuery}"</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamBuilder;

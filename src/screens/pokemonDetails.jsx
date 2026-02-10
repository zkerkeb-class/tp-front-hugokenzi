import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import './pokemonDetails.css';

const PokemonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        name: {},
        type: [],
        base: {}
    });

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/pokemons/${id}`);
                if (!response.ok) {
                    throw new Error('Pokémon non trouvé');
                }
                const data = await response.json();
                setPokemon(data);
                setFormData({
                    name: { ...data.name },
                    type: [...data.type],
                    base: { ...data.base }
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemon();
    }, [id]);

    const typeColors = {
        grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820',
        normal: '#A8A878', poison: '#A040A0', electric: '#F8D030', ground: '#E0C068',
        fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
        ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', flying: '#A890F0'
    };

    const allTypes = Object.keys(typeColors);

    const handleInputChange = (field, value) => {
        if (field.startsWith('name.')) {
            const nameField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                name: { ...prev.name, [nameField]: value }
            }));
        } else if (field.startsWith('base.')) {
            const baseField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                base: { ...prev.base, [baseField]: parseInt(value) || 0 }
            }));
        }
    };

    const toggleType = (type) => {
        setFormData(prev => {
            if (prev.type.includes(type)) {
                return {
                    ...prev,
                    type: prev.type.filter(t => t !== type)
                };
            } else {
                return {
                    ...prev,
                    type: [...prev.type, type]
                };
            }
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/pokemons/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la modification');
            }

            const updatedPokemon = await response.json();
            setPokemon(updatedPokemon);
            setIsEditing(false);
            alert('Pokémon modifié avec succès!');
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/pokemons/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            alert('Pokémon supprimé avec succès!');
            navigate('/');
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="loading">Chargement des détails du Pokémon...</div>;
    }

    if (error) {
        return <div className="error">Erreur: {error}</div>;
    }

    if (!pokemon) {
        return <div className="error">Pokémon non trouvé</div>;
    }

    return (
        <div className="pokemon-details">
            <Link to="/" className="btn-back">← Retour à la liste</Link>

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Avertissement</h2>
                        <p>Êtes-vous sûr de vouloir supprimer <strong>{pokemon.name.english}</strong>?</p>
                        <p>Cette action est irréversible.</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Annuler
                            </button>
                            <button className="btn-confirm-delete" onClick={() => {
                                handleDelete();
                                setShowDeleteModal(false);
                            }}>
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pokemon-container">
                <div className="pokemon-image-section">
                    <img src={pokemon.image} alt={pokemon.name.english} className="pokemon-image" />
                </div>

                <div className="pokemon-info-section">
                    {!isEditing ? (
                        <div className="pokemon-display">
                            <h1>{pokemon.name.english}</h1>
                            <p className="pokemon-id">#{pokemon.id}</p>

                            <div className="info-group">
                                <label>Types:</label>
                                <div className="types-display">
                                    {pokemon.type.map((type, index) => (
                                        <span key={index} className={`type-badge type-${type.toLowerCase()}`}>
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="info-group">
                                <label>Noms:</label>
                                <p><strong>FR:</strong> {pokemon.name.french}</p>
                                <p><strong>JA:</strong> {pokemon.name.japanese}</p>
                                <p><strong>ZH:</strong> {pokemon.name.chinese}</p>
                            </div>

                            <div className="stats-group">
                                <label>Stats:</label>
                                <div className="stats-grid">
                                    {Object.entries(pokemon.base).map(([key, value]) => (
                                        <div key={key} className="stat-card">
                                            <span className="stat-name">{key}</span>
                                            <progress value={value} max="255"></progress>
                                            <span className="stat-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                    ✏️ Modifier
                                </button>
                                <button className="btn-delete" onClick={() => setShowDeleteModal(true)}>
                                    🗑️ Supprimer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pokemon-edit">
                            <h1>Modifier {pokemon.name.english}</h1>

                            <div className="form-group">
                                <label>Nom Anglais:</label>
                                <input
                                    type="text"
                                    value={formData.name.english}
                                    onChange={(e) => handleInputChange('name.english', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nom Français:</label>
                                <input
                                    type="text"
                                    value={formData.name.french}
                                    onChange={(e) => handleInputChange('name.french', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nom Japonais:</label>
                                <input
                                    type="text"
                                    value={formData.name.japanese}
                                    onChange={(e) => handleInputChange('name.japanese', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nom Chinois:</label>
                                <input
                                    type="text"
                                    value={formData.name.chinese}
                                    onChange={(e) => handleInputChange('name.chinese', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Types:</label>
                                <div className="types-selector">
                                    <div className="types-buttons">
                                        {allTypes.map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                className={`type-select-btn ${formData.type.includes(type) ? 'active' : ''}`}
                                                style={{ backgroundColor: formData.type.includes(type) ? typeColors[type] : 'rgba(255,255,255,0.1)' }}
                                                onClick={() => toggleType(type)}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="selected-types">
                                        {formData.type.map((type, index) => (
                                            <span key={index} className={`type-badge type-${type.toLowerCase()}`}>
                                                {type}
                                                <button
                                                    type="button"
                                                    className="remove-type-btn"
                                                    onClick={() => toggleType(type)}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stats:</label>
                                <div className="stats-form">
                                    {Object.entries(formData.base).map(([key, value]) => (
                                        <div key={key} className="stat-input">
                                            <label>{key}:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="255"
                                                value={value}
                                                onChange={(e) => handleInputChange(`base.${key}`, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="edit-buttons">
                                <button className="btn-save" onClick={handleSave}>
                                    ✓ Enregistrer
                                </button>
                                <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                                    ✕ Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PokemonDetails;
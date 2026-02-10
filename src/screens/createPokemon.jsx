import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import './createPokemon.css';

const CreatePokemon = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: {
            english: '',
            french: '',
            japanese: '',
            chinese: ''
        },
        type: [],
        base: {
            HP: 0,
            Attack: 0,
            Defense: 0,
            SpecialAttack: 0,
            SpecialDefense: 0,
            Speed: 0
        },
        image: ''
    });

    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        } else if (field === 'image') {
            setFormData(prev => ({
                ...prev,
                image: value
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.english) {
            alert('Veuillez entrer au moins le nom anglais du Pokémon');
            return;
        }

        if (formData.type.length === 0) {
            alert('Veuillez ajouter au moins un type');
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmCreate = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/pokemons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la création');
            }

            const newPokemon = await response.json();
            alert(`Pokémon "${newPokemon.name.english}" créé avec succès!`);
            navigate('/');
        } catch (error) {
            alert(`Erreur: ${error.message}`);
            setShowConfirmModal(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-pokemon">
            <Link to="/" className="btn-back">← Retour à la liste</Link>

            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirmation de création</h2>
                        <p>Êtes-vous sûr de vouloir créer ce Pokémon?</p>
                        <div className="confirm-details">
                            <p><strong>Nom:</strong> {formData.name.english}</p>
                            <p><strong>Types:</strong> {formData.type.join(', ')}</p>
                        </div>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
                                Annuler
                            </button>
                            <button className="btn-confirm" onClick={() => {
                                handleConfirmCreate();
                                setShowConfirmModal(false);
                            }} disabled={loading}>
                                {loading ? 'Création en cours...' : '✓ Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="form-container">
                <h1>Créer un nouveau Pokémon</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2>Informations de Base</h2>

                        <div className="form-group">
                            <label>Nom Anglais *</label>
                            <input
                                type="text"
                                value={formData.name.english}
                                onChange={(e) => handleInputChange('name.english', e.target.value)}
                                placeholder="ex: Pikachu"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Nom Français</label>
                            <input
                                type="text"
                                value={formData.name.french}
                                onChange={(e) => handleInputChange('name.french', e.target.value)}
                                placeholder="ex: Pikachu"
                            />
                        </div>

                        <div className="form-group">
                            <label>Nom Japonais</label>
                            <input
                                type="text"
                                value={formData.name.japanese}
                                onChange={(e) => handleInputChange('name.japanese', e.target.value)}
                                placeholder="ex: ピカチュウ"
                            />
                        </div>

                        <div className="form-group">
                            <label>Nom Chinois</label>
                            <input
                                type="text"
                                value={formData.name.chinese}
                                onChange={(e) => handleInputChange('name.chinese', e.target.value)}
                                placeholder="ex: 皮卡丘"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Types *</h2>
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
                                {formData.type.length === 0 ? (
                                    <p className="no-types-selected">Sélectionnez au moins un type</p>
                                ) : (
                                    formData.type.map((type, index) => (
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
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Image</h2>
                        <div className="form-group">
                            <label>URL de l'image</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => handleInputChange('image', e.target.value)}
                                placeholder="http://localhost:3000/assets/pokemons/default.png"
                            />
                        </div>
                        {formData.image && (
                            <div className="image-preview">
                                <img src={formData.image} alt="Aperçu" />
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h2>Stats</h2>
                        <div className="stats-form-grid">
                            {Object.entries(formData.base).map(([key, value]) => (
                                <div key={key} className="form-group">
                                    <label>{key}</label>
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

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Création en cours...' : '✓ Créer le Pokémon'}
                        </button>
                        <Link to="/" className="btn-cancel-link">
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePokemon;
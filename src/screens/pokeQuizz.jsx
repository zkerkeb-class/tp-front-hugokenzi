import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import './pokeQuizz.css';

const PokeQuizz = () => {
    const navigate = useNavigate();
    const [pokemons, setPokemons] = useState([]);
    const [currentPokemon, setCurrentPokemon] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [userGuess, setUserGuess] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [gameActive, setGameActive] = useState(true);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    
    // Nouveau système de scoring
    const [timeRemaining, setTimeRemaining] = useState(10);
    const [comboMultiplier, setComboMultiplier] = useState(1);
    const [showComboAnimation, setShowComboAnimation] = useState(false);
    const [bonusPointsDisplay, setBonusPointsDisplay] = useState({ points: 0, show: false });

    // Charger les pokémons
    useEffect(() => {
        const fetchAllPokemons = async () => {
            try {
                setLoading(true);
                let allPokemons = [];
                let page = 1;
                let hasMore = true;

                // Charger tous les pokémons (pagination 20/page)
                while (hasMore) {
                    const response = await fetch(`http://localhost:3000/api/pokemons?page=${page}`);
                    if (response.ok) {
                        const data = await response.json();
                        allPokemons = [...allPokemons, ...data.data];
                        hasMore = page < data.totalPages;
                        page++;
                    } else {
                        hasMore = false;
                    }
                }

                setPokemons(allPokemons);
                selectRandomPokemon(allPokemons);
            } catch (error) {
                console.error("Erreur de chargement:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPokemons();
    }, []);

    // Gestion du chronomètre
    useEffect(() => {
        if (!gameActive || !currentPokemon || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Temps écoulé - réinitialiser combo et passer au prochain pokémon
                    setComboMultiplier(1);
                    setQuestionsAnswered(questionsAnswered + 1);
                    setFeedback(`Temps écoulé! C'était ${currentPokemon.name.english} ⏰`);
                    
                    setTimeout(() => {
                        setUserGuess('');
                        setFeedback('');
                        selectRandomPokemon(pokemons);
                    }, 2000);
                    
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameActive, currentPokemon, timeRemaining, questionsAnswered]);

    const selectRandomPokemon = (pokemonList) => {
        if (pokemonList.length === 0) {
            setCurrentPokemon(null);
            return;
        }
        const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
        setCurrentPokemon(randomPokemon);
        setUserGuess('');
        setFeedback('');
        setTimeRemaining(10); // Réinitialiser le chronomètre
        setBonusPointsDisplay({ points: 0, show: false });
    };

    const checkGuess = (e) => {
        e.preventDefault();
        
        if (!gameActive || !currentPokemon) return;

        const guess = userGuess.toLowerCase().trim();
        const correctNames = [
            currentPokemon.name.english.toLowerCase(),
            currentPokemon.name.french.toLowerCase(),
            currentPokemon.name.japanese.toLowerCase(),
            currentPokemon.name.chinese.toLowerCase()
        ];

        if (correctNames.includes(guess)) {
            // Calcul des points: base 10 + bonus rapidité + multiplicateur combo
            const basePoints = 10;
            const speedBonus = timeRemaining;
            const pointsEarned = Math.round((basePoints + speedBonus) * comboMultiplier);
            
            // Augmenter le multiplicateur de combo
            let newCombo = comboMultiplier;
            if (comboMultiplier < 5) {
                newCombo = comboMultiplier + 0.5; // Augmente par 0.5 (x1 -> x1.5 -> x2 -> x2.5 -> x3)
            }
            
            setScore(score + pointsEarned);
            setStreak(streak + 1);
            setComboMultiplier(newCombo);
            setBonusPointsDisplay({ points: pointsEarned, show: true });
            
            // Afficher l'animation combo si multiplicateur >= 1.5
            if (newCombo >= 1.5) {
                setShowComboAnimation(true);
                setTimeout(() => setShowComboAnimation(false), 1500);
            }
            
            setQuestionsAnswered(questionsAnswered + 1);
            setFeedback(`Correct! +${pointsEarned} points 🎉`);
            
            // Cacher l'affichage des points bonus après 1s
            setTimeout(() => setBonusPointsDisplay({ points: 0, show: false }), 1000);
            
            setTimeout(() => {
                setUserGuess('');
                setFeedback('');
                selectRandomPokemon(pokemons);
            }, 1500);
        } else {
            // Erreur: réinitialiser combo et streak
            setStreak(0);
            setComboMultiplier(1);
            setQuestionsAnswered(questionsAnswered + 1);
            setFeedback(`Incorrect! C'était ${currentPokemon.name.english} ❌`);
            
            setTimeout(() => {
                setUserGuess('');
                setFeedback('');
                selectRandomPokemon(pokemons);
            }, 2000);
        }
    };

    const resetGame = () => {
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        setComboMultiplier(1);
        setTimeRemaining(10);
        setGameActive(true);
        selectRandomPokemon(pokemons);
    };

    if (loading) {
        return (
            <div className="quizz-container">
                <div className="loading">Chargement du Pokédex...</div>
            </div>
        );
    }

    return (
        <div className="quizz-page">
            <button className="back-to-list" onClick={() => navigate('/')}>
                ← Retour au Pokédex
            </button>

            <div className="quizz-container">
                <h1 className="quizz-title">Poké-Quizz Express</h1>

                {showComboAnimation && (
                    <div className="combo-animation">
                        🔥 Combo x{comboMultiplier.toFixed(1)} 🔥
                    </div>
                )}

                <div className="quizz-stats">
                    <div className="stat">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{score}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Combo</span>
                        <span className="stat-value" style={{ color: comboMultiplier > 1 ? '#ffcb05' : '#fff' }}>
                            x{comboMultiplier.toFixed(1)}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Temps</span>
                        <span className="stat-value" style={{ color: timeRemaining <= 3 ? '#ff6b6b' : '#fff' }}>
                            {timeRemaining}s
                        </span>
                    </div>
                </div>

                {currentPokemon ? (
                    <div className="quizz-game">
                        <div className="pokemon-silhouette-container">
                            <img
                                src={currentPokemon.image}
                                alt="Silhouette"
                                className="pokemon-silhouette"
                            />
                        </div>

                        {bonusPointsDisplay.show && (
                            <div className="bonus-points-animation">
                                +{bonusPointsDisplay.points}
                            </div>
                        )}

                        <form onSubmit={checkGuess} className="guess-form">
                            <input
                                type="text"
                                value={userGuess}
                                onChange={(e) => setUserGuess(e.target.value)}
                                placeholder="Quel est ce Pokémon ?"
                                className="guess-input"
                                disabled={!gameActive}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="guess-btn"
                                disabled={!gameActive || !userGuess.trim()}
                            >
                                ✓ Valider
                            </button>
                        </form>

                        {feedback && (
                            <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
                                {feedback}
                            </div>
                        )}

                        <div className="game-info">
                            <p>💡 Indice: Ce Pokémon est de type <strong>{currentPokemon.type[0]}</strong></p>
                            <p className="scoring-info">
                                Base: 10 + Rapidité: {timeRemaining}s + Combo: x{comboMultiplier.toFixed(1)} = {Math.round((10 + timeRemaining) * comboMultiplier)} pts possibles
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="quizz-game">
                        <p className="no-pokemon-message">Aucun Pokémon à afficher.</p>
                    </div>
                )}

                <button onClick={resetGame} className="reset-btn">
                    🔄 Nouvelle partie
                </button>
            </div>
        </div>
    );
};

export default PokeQuizz;

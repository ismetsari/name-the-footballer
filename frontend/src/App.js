import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [players, setPlayers] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [dailyPlayer, setDailyPlayer] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    axios.get(`${backendUrl}/search-players`)
      .then(response => setPlayers(response.data))
      .catch(error => console.error('Error fetching players:', error));
  }, [backendUrl]);

  useEffect(() => {
    axios.get(`${backendUrl}/player-of-the-day`)
      .then(response => {
        console.log("🎯 Daily player received:", response.data);
        setDailyPlayer(response.data);
      })
      .catch(error => console.error('Error fetching daily player:', error));
  }, [backendUrl]);

  const normalize = (str) =>
    str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const compareGuess = (guessName) => {
    if (!dailyPlayer) return null;

    const normalizedGuess = normalize(guessName);
    let guessedPlayer = players.find(
      (p) => normalize(p.name) === normalizedGuess
    );

    if (!guessedPlayer) {
      guessedPlayer = {
        name: guessName,
        position: 'Unknown',
        nationality: 'Unknown',
        age: 'Unknown',
        club: 'Unknown',
        league: 'Unknown',
        shirtNumber: 'Unknown',
        marketValue: 'Unknown'
      };
    }

    return {
      position: normalize(guessedPlayer.position) === normalize(dailyPlayer.position) ? '🟢' : '🔴',
      nationality: normalize(guessedPlayer.nationality) === normalize(dailyPlayer.nationality) ? '🟢' : '🔴',
      age:
        guessedPlayer.age === dailyPlayer.age
          ? '🟢'
          : guessedPlayer.age > dailyPlayer.age
          ? '🔼'
          : '🔽',
      club: normalize(guessedPlayer.club) === normalize(dailyPlayer.club) ? '🟢' : '🔴',
      league: normalize(guessedPlayer.league) === normalize(dailyPlayer.league) ? '🟢' : '🔴',
      shirtNumber:
        guessedPlayer.shirtNumber === dailyPlayer.shirtNumber
          ? '🟢'
          : guessedPlayer.shirtNumber > dailyPlayer.shirtNumber
          ? '🔼'
          : '🔽',
      marketValue:
        guessedPlayer.marketValue === dailyPlayer.marketValue
          ? '🟢'
          : guessedPlayer.marketValue > dailyPlayer.marketValue
          ? '🔼'
          : '🔽',
      unknown: false
    };
  };

  const handleGuess = () => {
    if (!dailyPlayer) {
      alert("Daily player data is still loading. Please try again shortly.");
      return;
    }

    if (attempts >= 10 || !currentGuess.trim()) return;

    const indicators = compareGuess(currentGuess);

    const newGuess = {
      guess: currentGuess,
      indicators: indicators || null
    };

    setGuesses([...guesses, newGuess]);
    setCurrentGuess('');
    setAttempts(attempts + 1);

    if (normalize(currentGuess) === normalize(dailyPlayer.name)) {
      setMessage('🎉 You won!');
    } else if (attempts === 9) {
      setMessage(`❌ Game Over! The answer was ${dailyPlayer.name}`);
    }
  };

  const formatMarketValue = (value) => {
    if (value === 'Unknown' || isNaN(value)) return 'Unknown';
    return `$${(value / 1e6).toFixed(1)}M`;
  };

  if (!dailyPlayer) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
        <h2>⏳ Loading player of the day...</h2>
      </div>
    );
  }

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Name the Footballer</h1>
      <h2 style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>Attempt: {attempts} / 10</h2>

      <input
        type="text"
        value={currentGuess}
        onChange={(e) => setCurrentGuess(e.target.value)}
        list="player-names"
        placeholder="Guess the player"
        style={{ padding: '10px', width: '100%', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />

      <datalist id="player-names">
        {players.map((p, i) => (
          <option key={i} value={p.name} />
        ))}
      </datalist>

      <button onClick={handleGuess} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.3s' }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}>
        Guess
      </button>

      <div style={{ marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', fontWeight: 'bold', marginBottom: '10px', borderBottom: '2px solid #ddd', paddingBottom: '5px', color: '#555' }}>
          <span>Guess</span>
          <span>Position</span>
          <span>Nationality</span>
          <span>Age</span>
          <span>Club</span>
          <span>League</span>
          <span>Shirt Number</span>
          <span>Market Value</span>
        </div>
        {guesses.map((guessObj, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginBottom: '10px', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #eee', color: '#333' }}>
            <strong>{guessObj.guess}</strong>

            {guessObj.indicators ? (
              <>
                <span>{guessObj.indicators.position}</span>
                <span>{guessObj.indicators.nationality}</span>
                <span>{guessObj.indicators.age}</span>
                <span>{guessObj.indicators.club}</span>
                <span>{guessObj.indicators.league}</span>
                <span>{guessObj.indicators.shirtNumber}</span>
                <span>{formatMarketValue(guessObj.indicators.marketValue)}</span>
                {guessObj.indicators.unknown && (
                  <div style={{ color: 'orange', marginTop: '4px', gridColumn: 'span 8' }}>
                    ⚠️ Player not recognized
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: 'red', gridColumn: 'span 7' }}>❌ Invalid guess</span>
            )}
          </div>
        ))}
      </div>

      {message && <h3 style={{ marginTop: '20px', textAlign: 'center', color: '#d9534f' }}>{message}</h3>}
    </div>
  );
}

export default App;

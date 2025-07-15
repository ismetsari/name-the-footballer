const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let dailyPlayer = null;

const API_KEY = 'd5f12cbf459a0e7f9185ea123cf27b8f';
const API_URL = 'https://v3.football.api-sports.io/players';

async function fetchPlayerData() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        league: '39',
        season: '2023'
      }
    });

    const players = response.data.response;
    console.log('📦 Fetched player count:', players.length);
    return players;
  } catch (error) {
    console.error('❌ API fetch failed:', error.message);
    return [];
  }
}

async function selectDailyPlayer() {
  const players = await fetchPlayerData();

  if (players.length > 0) {
    const randomIndex = Math.floor(Math.random() * players.length);
    const selected = players[randomIndex];

    dailyPlayer = {
      name: selected.player.name,
      age: selected.player.age,
      nationality: selected.player.nationality,
      position: selected.statistics[0]?.games?.position || 'Unknown',
      club: selected.statistics[0]?.team?.name || 'Unknown',
      league: selected.statistics[0]?.league?.name || 'Unknown'
    };

    console.log('✅ Daily player selected:', dailyPlayer.name);
  } else {
    // fallback mock
    dailyPlayer = {
      name: 'João Moutinho',
      age: 36,
      nationality: 'Portugal',
      position: 'Midfielder',
      club: 'Wolves',
      league: 'Premier League'
    };

    console.warn('⚠️ No players fetched from API. Using mock player:', dailyPlayer.name);
  }
}

selectDailyPlayer();
setInterval(selectDailyPlayer, 24 * 60 * 60 * 1000);

app.get('/player-of-the-day', (req, res) => {
  if (!dailyPlayer) {
    return res.status(404).json({ message: 'Player of the day not set.' });
  }
  res.json(dailyPlayer);
});

app.get('/search-players', async (req, res) => {
  try {
    const players = await fetchPlayerData();

    if (players.length === 0 && dailyPlayer) {
      console.warn('⚠️ Returning mock dailyPlayer in search results.');
      return res.json([dailyPlayer]);
    }

    const formatted = players.map(p => ({
      name: p.player.name,
      age: p.player.age,
      nationality: p.player.nationality,
      position: p.statistics[0]?.games?.position || 'Unknown',
      club: p.statistics[0]?.team?.name || 'Unknown',
      league: p.statistics[0]?.league?.name || 'Unknown'
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error in /search-players:', error.message);
    res.status(500).json({ message: 'Error fetching players' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Game endpoints
  async startGame(country, difficulty) {
    return this.request('/start-game', {
      method: 'POST',
      body: JSON.stringify({ country, difficulty }),
    });
  }

  async checkStation(gameId, station) {
    return this.request('/check-station', {
      method: 'POST',
      body: JSON.stringify({ gameId, station }),
    });
  }

  async getHint(gameId, hintAmount) {
    return this.request('/hint', {
      method: 'POST',
      body: JSON.stringify({ gameId, hintAmount }),
    });
  }

  async checkWin(gameId) {
    return this.request('/check-win', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async getGuessedStops(gameId) {
    return this.request('/get-guessed-stops', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async getTrainName(gameId) {
    return this.request('/get-train-name', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async cancelGame(gameId) {
    return this.request('/cancel-game', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async getScore(gameId) {
    return this.request('/get-score', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async deleteGame(gameId) {
    return this.request('/delete-game', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async archiveTrain(gameId) {
    return this.request('/archive-train', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async saveGame(gameId, name) {
    return this.request('/save-game', {
      method: 'POST',
      body: JSON.stringify({ gameId, name }),
    });
  }

  async getTime(gameId) {
    return this.request('/get-time', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async getTop(amount) {
    return this.request(`/get-top?amount=${amount}`, {
      method: 'GET',
    });
  }

  async getGameData(gameId) {
    return this.request('/game-data', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  // Sort the Stations endpoints
  async stsStartGame(country) {
    return this.request('/sts/start-game', {
      method: 'POST',
      body: JSON.stringify({ country }),
    });
  }

  async stsCheckSolution(gameId, solution) {
    return this.request('/sts/check-solution', {
      method: 'POST',
      body: JSON.stringify({ gameId, solution }),
    });
  }

  async stsGetShuffledStops(gameId) {
    return this.request('/sts/get-shuffled-stops', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async stsGetTrainName(gameId) {
    return this.request('/sts/get-trainname', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }
}

const apiService = new ApiService();
export default apiService;

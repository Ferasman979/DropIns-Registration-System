import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://xrsl4chg6k.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const [games, setGames] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentID, setStudentID] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  // Admin panel states
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newStudentID, setNewStudentID] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProgram, setNewProgram] = useState('');
  
  // Create game states
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameDateTime, setGameDateTime] = useState('');
  const [maxSpots, setMaxSpots] = useState('10');

  useEffect(() => {
    if (userId) {
      fetchGames();
    }
  }, [userId]);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/games?userID=${userId}`);
      setGames(response.data.games);
      setUserRegistrations(response.data.userRegistrations);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const payload = {
        action: isLogin ? 'login' : 'register',
        username,
        password
      };
      
      if (!isLogin) {
        payload.studentID = studentID;
      }
      
      const response = await axios.post(`${API_URL}/auth`, payload);
      
      const { userID, role, firstName: fName } = response.data;
      setUserId(userID);
      setUserRole(role);
      setFirstName(fName);
      
      localStorage.setItem('userId', userID);
      localStorage.setItem('userRole', role);
      localStorage.setItem('firstName', fName);
      
      setMessage('Authentication successful!');
      fetchGames();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Authentication failed');
    }
  };

  const registerForGame = async (gameId) => {
    try {
      await axios.post(`${API_URL}/games/register`, {
        gameID: gameId,
        userID: userId,
        action: 'register'
      });
      setMessage('Successfully registered for game!');
      fetchGames();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Registration failed');
    }
  };

  const unregisterFromGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to drop out of this game?')) return;
    
    try {
      await axios.post(`${API_URL}/games/register`, {
        gameID: gameId,
        userID: userId,
        action: 'unregister'
      });
      setMessage('Successfully dropped out of game!');
      fetchGames();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to drop out');
    }
  };

  const createGame = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/games`, {
        gameName,
        dateTime: gameDateTime,
        maxSpots: parseInt(maxSpots),
        organizerID: userId
      });
      setMessage('Game created successfully!');
      setShowCreateGame(false);
      setGameName('');
      setGameDateTime('');
      setMaxSpots('10');
      fetchGames();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create game');
    }
  };

  const deleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await axios.delete(`${API_URL}/games/manage`, {
        data: {
          action: 'delete',
          gameID: gameId,
          userID: userId
        }
      });
      setMessage('Game deleted successfully!');
      fetchGames();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete game');
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth`, {
        action: 'add-student',
        studentID: newStudentID,
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        program: newProgram
      });
      setMessage('Student added successfully!');
      setNewStudentID('');
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewProgram('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add student');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUserId('');
    setUserRole('');
    setFirstName('');
    setGames([]);
    setUserRegistrations([]);
    setMessage('Logged out successfully');
  };

  const isRegistered = (gameId) => {
    return userRegistrations.includes(gameId);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏀 Drop-in Games Registration</h1>
        
        {!userId ? (
          <div className="auth-form">
            <div className="auth-toggle">
              <button 
                className={isLogin ? 'active' : ''} 
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                className={!isLogin ? 'active' : ''} 
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleAuth}>
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <input 
                  type="text" 
                  placeholder="Student ID (e.g., 991234567)" 
                  value={studentID}
                  onChange={(e) => setStudentID(e.target.value)}
                  required
                />
              )}
              <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
          </div>
        ) : (
          <div className="dashboard">
            <div className="user-info">
              <p>Welcome, <strong>{firstName}</strong>!</p>
              <p>Role: <span className="role-badge">{userRole}</span></p>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>

            {userRole === 'admin' && (
              <div className="admin-controls">
                <button onClick={() => setShowCreateGame(!showCreateGame)}>
                  {showCreateGame ? 'Cancel' : '➕ Create Game'}
                </button>
                <button onClick={() => setShowAdminPanel(!showAdminPanel)}>
                  {showAdminPanel ? 'Close Admin Panel' : '👤 Add Student'}
                </button>
              </div>
            )}

            {showCreateGame && userRole === 'admin' && (
              <div className="create-game-form">
                <h3>Create New Game</h3>
                <form onSubmit={createGame}>
                  <input 
                    type="text" 
                    placeholder="Game Name" 
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    required
                  />
                  <input 
                    type="datetime-local" 
                    value={gameDateTime}
                    onChange={(e) => setGameDateTime(e.target.value)}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Max Spots" 
                    value={maxSpots}
                    onChange={(e) => setMaxSpots(e.target.value)}
                    required
                    min="1"
                  />
                  <button type="submit">Create Game</button>
                </form>
              </div>
            )}

            {showAdminPanel && userRole === 'admin' && (
              <div className="admin-panel">
                <h3>Add New Student</h3>
                <form onSubmit={addStudent}>
                  <input 
                    type="text" 
                    placeholder="Student ID (e.g., 991234567)" 
                    value={newStudentID}
                    onChange={(e) => setNewStudentID(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Program (optional)" 
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                  />
                  <button type="submit">Add Student</button>
                </form>
              </div>
            )}

            <div className="games-list">
              <h2>Available Games</h2>
              {games.length === 0 ? (
                <p>No games available yet.</p>
              ) : (
                games.map(game => (
                  <div key={game.GameID} className="game-card">
                    <h3>{game.GameName}</h3>
                    <p>📅 {new Date(game.DateTime).toLocaleString()}</p>
                    <p>👥 Spots: {game.CurrentSpots}/{game.MaxSpots}</p>
                    <div className="game-actions">
                      {userRole === 'student' && (
                        <>
                          {isRegistered(game.GameID) ? (
                            <button 
                              onClick={() => unregisterFromGame(game.GameID)}
                              className="dropout-btn"
                            >
                              🚪 Drop Out
                            </button>
                          ) : (
                            <button 
                              onClick={() => registerForGame(game.GameID)}
                              disabled={game.CurrentSpots >= game.MaxSpots}
                            >
                              {game.CurrentSpots >= game.MaxSpots ? '❌ Full' : '📝 Register'}
                            </button>
                          )}
                        </>
                      )}
                      {userRole === 'admin' && (
                        <button 
                          onClick={() => deleteGame(game.GameID)}
                          className="delete-btn"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {message && <p className="message">{message}</p>}
      </header>
    </div>
  );
}

export default App;

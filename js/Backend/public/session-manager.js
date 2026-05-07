const SESSION_ID_KEY = 'gts_session_id';
const SESSIONS_KEY = 'gts_sessions';

// Format session ID for display (first 8 chars)
const formatSessionIdShort = (sessionId) => sessionId.substring(0, 8);

// Format session ID for display (first 16 chars)
const formatSessionIdLong = (sessionId) => sessionId.substring(0, 16);

export const sessionManager = {
  // Get current session ID from localStorage
  getCurrentSessionId() {
    return localStorage.getItem(SESSION_ID_KEY);
  },

  async createSession(name = '') {
    const response = await fetch('/session/generate?name=' + encodeURIComponent(name));
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    const data = await response.json();
    console.log('Session ID:', data.sessionId);
    this.setCurrentSessionId(data.sessionId);
    return this.addSession(data.sessionId, name);
  },


  // Set current session ID in localStorage
  setCurrentSessionId(sessionId) {
    if (!sessionId) {
      localStorage.removeItem(SESSION_ID_KEY);
      return;
    }
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  },

  // Get all sessions from localStorage
  getAllSessions() {
    const sessionsJson = localStorage.getItem(SESSIONS_KEY);
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  },
  //Check if session name exists
  sessionNameExists(name) {
    const sessions = this.getAllSessions();
    return sessions.some(s => s.name === name);
  },

  // Alias for getAllSessions (for compatibility)
  getSessions() {
    return this.getAllSessions();
  },

  // Add a new session to the list
  addSession(sessionId, sessionName = '') {
    const sessions = this.getAllSessions();
    const session = {
      id: sessionId,
      name: sessionName,
      createdAt: new Date().toISOString()
    };
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return session;
  },

  // Check if a session exists in the list
  sessionExists(sessionId) {
    const sessions = this.getAllSessions();
    return sessions.some(s => s.id === sessionId);
  },

  // Format session ID for dropdown display (short version)
  formatSessionIdShort,

  // Format session ID for info display (long version)
  formatSessionIdLong,

  // Get a display name for a session (fallback to shortened ID)
  getSessionDisplayName(session) {
    if (!session) {
      return 'Unknown session';
    }
    const name = (session.name || '').trim();
    if (name.length > 0) {
      return name;
    }
    return `Session ${formatSessionIdShort(session.id)}`;
  },

  // Get display name by id from stored sessions
  getSessionDisplayNameById(sessionId) {
    if (!sessionId) {
      return 'No active session';
    }
    const session = this.getAllSessions().find(s => s.id === sessionId);
    return this.getSessionDisplayName(session);
  }
};

export default sessionManager;

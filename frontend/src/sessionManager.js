const SESSION_ID_KEY = 'gts_session_id';
const SESSIONS_KEY = 'gts_sessions';

export function getCurrentSessionId() {
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setCurrentSessionId(sessionId) {
  if (!sessionId) {
    localStorage.removeItem(SESSION_ID_KEY);
    return;
  }
  localStorage.setItem(SESSION_ID_KEY, sessionId);
}

export function getSessions() {
  const sessionsJson = localStorage.getItem(SESSIONS_KEY);
  return sessionsJson ? JSON.parse(sessionsJson) : [];
}

export function addSession(sessionId, sessionName = '') {
  const sessions = getSessions();
  const session = {
    id: sessionId,
    name: sessionName,
    createdAt: new Date().toISOString()
  };
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return session;
}

export function sessionNameExists(name) {
  const sessions = getSessions();
  return sessions.some((s) => s.name === name);
}

export function getSessionDisplayName(session) {
  if (!session) return 'Unknown session';
  const name = (session.name || '').trim();
  if (name.length > 0) return name;
  return `Session ${session.id.substring(0, 8)}`;
}

export function getSessionDisplayNameById(sessionId) {
  if (!sessionId) return 'No active session';
  const session = getSessions().find((s) => s.id === sessionId);
  return getSessionDisplayName(session);
}

export async function createSession(name = '') {
  const response = await fetch(`/session/generate?name=${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  const data = await response.json();
  setCurrentSessionId(data.sessionId);
  return addSession(data.sessionId, name);
}

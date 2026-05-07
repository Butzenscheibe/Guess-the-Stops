import React, { useState } from 'react';

function Feedback({ t }) {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedFeedback = feedback.trim();
    if (!trimmedName || !trimmedFeedback) {
      setStatus({ type: 'error', message: '✗ Please fill in all fields.' });
      return;
    }
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('https://feedback.diebutzenscheibe.dev/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, feedback: trimmedFeedback, subject: 'GTS' })
      });
      if (response.ok) {
        setStatus({ type: 'success', message: '✓ Thank you! Your feedback has been submitted successfully.' });
        setName('');
        setFeedback('');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      setStatus({ type: 'error', message: '✗ Failed to submit feedback. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-section">
      <h2>{t('feedback.title')}</h2>
      <p className="feedback-description">{t('feedback.desc')}</p>
      <form className="feedback-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="feedback-name">{t('feedback.name')}</label>
          <input
            id="feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('feedback.namePlaceholder')}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="feedback-text">{t('feedback.text')}</label>
          <textarea
            id="feedback-text"
            rows="6"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('feedback.textPlaceholder')}
            required
          ></textarea>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Sending...' : t('feedback.submit')}
        </button>
      </form>
      {status.message && (
        <div className={`feedback-status ${status.type}`}>{status.message}</div>
      )}
    </div>
  );
}

export default Feedback;

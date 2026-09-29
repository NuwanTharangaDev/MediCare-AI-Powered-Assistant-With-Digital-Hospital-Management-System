import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, MessageCircle, Minus, Plus, Send, Sparkles, Trash2, X } from 'lucide-react';
import './Chatbot.css';

const welcomeText = "Hello! 👋 I'm Medicare AI Assistant.\n\nI can help you with hospital services, appointments, departments, general health information, and navigating the hospital system.\n\nHow can I help you today?";
const suggestions = [
  { label: 'Book an Appointment', prompt: 'How can I book an appointment?' },
  { label: 'Hospital Services', prompt: 'What services does this hospital provide?' },
  { label: 'Departments', prompt: 'What departments are available?' },
  { label: 'General Health Questions', prompt: 'I have a general health question. Can you help?' },
  { label: 'Contact Hospital', prompt: 'How can I contact the hospital?' }
];

function createMessage(role, text, actions = [], sources = []) {
  return { id: `${Date.now()}-${Math.random()}`, role, text, actions, sources, time: new Date() };
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function Chatbot({ token, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([createMessage('assistant', welcomeText)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text || isLoading || text.length > 4000) return;

    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-12)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.text.slice(0, 1500)
      }));

    setMessages((current) => [...current, createMessage('user', text)]);
    setInput('');
    setIsLoading(true);
    const typingStartedAt = Date.now();
    let replyText = '';
    let replyActions = [];
    let replySources = [];

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, history })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Chat request failed');
      replyText = data.reply;
      replyActions = data.actions || [];
      replySources = data.sources || [];
    } catch (error) {
      replyText = error.message || 'The assistant is temporarily unavailable. Please try again.';
    } finally {
      const remainingTypingTime = Math.max(0, 1000 - (Date.now() - typingStartedAt));
      if (remainingTypingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTypingTime));
      }
      setMessages((current) => [...current, createMessage('assistant', replyText, replyActions, replySources)]);
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    if (isLoading) return;
    setMessages([createMessage('assistant', welcomeText)]);
  };

  return (
    <>
      {isOpen && (
        <section className={`assistant-panel${isMinimized ? ' is-minimized' : ''}`} aria-label="Medicare AI Assistant">
          <header className="assistant-header">
            <span className="assistant-mark"><Sparkles size={17} aria-hidden="true" /></span>
            <div className="assistant-heading">
              <strong>Medicare AI Assistant</strong>
              <span><i className="assistant-status" />How can I help you today?</span>
            </div>
            <div className="assistant-tools">
              <button type="button" onClick={() => setIsMinimized((value) => !value)} aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'} title={isMinimized ? 'Expand chat' : 'Minimize chat'}>
                {isMinimized ? <Plus size={17} /> : <Minus size={17} />}
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" title="Close chat"><X size={18} /></button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <div className="assistant-disclaimer">General information only. Not a substitute for a healthcare professional.</div>
              <div className="assistant-messages" ref={messageListRef} aria-live="polite" aria-relevant="additions text">
                {messages.map((message) => (
                  <article className={`assistant-message-row ${message.role}`} key={message.id}>
                    {message.role === 'assistant' && <span className="assistant-avatar"><Bot size={15} aria-hidden="true" /></span>}
                    <div className="assistant-message-wrap">
                      <div className="assistant-message">{message.text}</div>
                      {message.sources?.length > 0 && (
                        <div className="assistant-sources" aria-label="Sources">
                          {message.sources.map((source) => (
                            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                          ))}
                        </div>
                      )}
                      <time className="assistant-time" dateTime={message.time.toISOString()}>{formatTime(message.time)}</time>
                      {message.actions?.length > 0 && (
                        <div className="assistant-actions">
                          {message.actions.map((action) => (
                            <button type="button" key={action.tab} onClick={() => onNavigate(action.tab)}>{action.label}<ChevronDown size={14} /></button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                {messages.length === 1 && (
                  <div className="assistant-suggestions" aria-label="Suggested questions">
                    {suggestions.map((suggestion) => (
                      <button type="button" key={suggestion.label} onClick={() => sendMessage(suggestion.prompt)} disabled={isLoading}>{suggestion.label}</button>
                    ))}
                  </div>
                )}
                {isLoading && (
                  <div className="assistant-message-row assistant" role="status" aria-label="Medicare AI Assistant is typing">
                    <span className="assistant-avatar"><Bot size={15} aria-hidden="true" /></span>
                    <div className="assistant-message assistant-typing">
                      <span className="assistant-typing-label">Medicare AI Assistant is typing</span>
                      <span className="assistant-typing-dots" aria-hidden="true"><i /><i /><i /></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="assistant-footer">
                <button className="assistant-clear" type="button" onClick={clearConversation} disabled={isLoading} aria-label="Clear conversation" title="Clear conversation">
                  <Trash2 size={15} />
                </button>
                <form className="assistant-form" onSubmit={handleSubmit}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value.slice(0, 4000))}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    aria-label="Message Medicare AI Assistant"
                    maxLength={4000}
                    rows={1}
                    disabled={isLoading}
                  />
                  <button className="assistant-send" type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
                    <Send size={17} />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}

      <button className={`assistant-launcher${isOpen ? ' active' : ''}`} type="button" onClick={() => {
        setIsOpen((value) => !value);
        setIsMinimized(false);
      }} aria-expanded={isOpen} aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}>
        {isOpen ? <X size={19} /> : <MessageCircle size={19} />}
        <span>{isOpen ? 'Close' : 'AI Assistant'}</span>
      </button>
    </>
  );
}
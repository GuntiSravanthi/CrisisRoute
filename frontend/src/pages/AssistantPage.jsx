import { useEffect, useRef, useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import { PageHeader } from '../components/UI';
import { assistantAPI } from '../services/api';

function AssistantContent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CrisisRoute Emergency Assistant. I can help you find shelters, emergency contacts, and disaster safety actions. How can I help?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Nearest shelter',
    'Emergency actions during flood',
    'Emergency contacts',
    'What to do during earthquake',
  ]);
  const [location, setLocation] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await assistantAPI.chat(text, location?.lat, location?.lng);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
      if (res.data.suggestions) setSuggestions(res.data.suggestions);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Emergency Assistant" subtitle="AI-guided emergency support with predefined safety protocols" />

      <div className="glass-card flex flex-col" style={{ height: '600px' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-crisis-red text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-400">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-crisis-border">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-crisis-border text-slate-400 hover:text-white hover:border-crisis-red/50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Ask about shelters, emergency actions..."
            />
            <button type="submit" disabled={loading} className="btn-primary px-6 disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <ProtectedRoute>
      <Layout><AssistantContent /></Layout>
    </ProtectedRoute>
  );
}

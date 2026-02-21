import { useState, useRef, useEffect, useCallback } from 'react';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { stripMarkdown } from '../lib/format';
import { buildAppContext, ChatStore, ProfileStore } from '../lib/records';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  pending?: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const QUICK_PROMPTS = [
  'Who are you?',
  'How much protein daily?',
  'Tips to sleep better',
  'Help with lower back pain',
];

export function CoachTab() {
  const loader = useModelLoader();
  const profile = ProfileStore.get();
  
  const isQwen = loader.modelId === 'qwen2.5-0.5b-instruct-q4_k_m';
  const coachTitle = isQwen ? 'VitalAI Expert (Qwen)' : 'VitalAI Coach (Liquid)';

  const [msgs, setMsgs] = useState<Msg[]>(() => {
    const history = ChatStore.get(20);
    if (history.length > 0) {
      return history.map(h => ({ id: uid(), role: h.role, text: h.text }));
    }
    return [{
      id: uid(),
      role: 'assistant',
      text: `Hi ${profile.name || 'there'}. I'm your private AI health coach — running entirely on your device. What would you like to work on today?`
    }];
  });

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 10);
    }
  }, [msgs]);

  const addMsg = useCallback((m: Msg) => setMsgs(p => [...p, m]), []);

  const updateLast = useCallback((text: string, pending = false) => {
    setMsgs(p => {
      const u = [...p];
      u[u.length - 1] = { ...u[u.length - 1], text, pending };
      return u;
    });
  }, []);

  const cleanResponse = (text: string) => {
    return stripMarkdown(text)
      .replace(/^(Vitalis:|Coach:|AI:|System:|Assistant:|User:)\s*/gi, '')
      .replace(/\n+/g, ' ') 
      .trimStart();
  };

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setInput('');
    setSending(true);
    setBusy(true);
    setTimeout(() => setSending(false), 400); 

    addMsg({ id: uid(), role: 'user', text: trimmed });
    addMsg({ id: uid(), role: 'assistant', text: '', pending: true });

    ChatStore.add({ role: 'user', text: trimmed, ts: Date.now() });

    await new Promise(resolve => setTimeout(resolve, 50));

    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) {
        updateLast('Model failed to load. Please try again.');
        setBusy(false);
        return;
      }
    }

    const prompt = `This is a text message conversation with Vitalis, an expert health coach. Vitalis gives very short, direct answers (1-2 sentences maximum). Vitalis never uses lists or bullet points.

User Data: ${buildAppContext()}

User: How can I sleep better?
Coach: Try avoiding screens for an hour before bed and keeping your room cool. A consistent sleep schedule helps regulate your circadian rhythm.

User: ${trimmed}
Coach:`;

    try {
      const { stream, result: done, cancel } = await TextGeneration.generateStream(prompt, {
        maxTokens: 120, 
        temperature: 0.25, 
      });

      cancelRef.current = cancel;
      let acc = '';

      for await (const token of stream) {
        acc += token;
        updateLast(cleanResponse(acc), true);
      }

      await done;
      let finalClean = cleanResponse(acc).trim();
      
      if (!finalClean) finalClean = "I can definitely help with that. What's on your mind?";
      
      updateLast(finalClean, false);
      ChatStore.add({ role: 'assistant', text: finalClean, ts: Date.now() });

    } catch (e) {
      updateLast(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      cancelRef.current = null;
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [busy, loader, addMsg, updateLast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const showQuick = msgs.length <= 1;

  const modelStatus = () => {
    switch (loader.state) {
      case 'ready': return { label: 'Ready · On-device', dot: 'dot-green' };
      case 'idle': return { label: 'Click to load AI', dot: 'dot-dim' };
      case 'downloading': return { label: `Downloading… ${Math.round((loader.progress || 0) * 100)}%`, dot: 'dot-amber' };
      case 'loading': return { label: 'Loading memory…', dot: 'dot-amber' };
      case 'error': return { label: `Error: ${loader.error}`, dot: 'dot-red' };
      default: return { label: 'Initialising…', dot: 'dot-dim' };
    }
  };

  const { label: statusLabel, dot: statusDot } = modelStatus();

  return (
    <div className="coach-panel" style={{ maxWidth: 620, margin: '0 auto', width: '100%', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
      <div className="coach-topbar">
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </div>
        <div className="coach-info">
          <div className="coach-name">{coachTitle}</div>
          <div className="coach-status" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className={`dot ${statusDot}`} />
            <span>{statusLabel}</span>
          </div>
        </div>
        {loader.state === 'downloading' && (
          <div className="model-progress-wrap">
            <div className="model-progress-bar" style={{ width: `${Math.round((loader.progress || 0) * 100)}%` }} />
          </div>
        )}
        {loader.state === 'loading' && <div className="spinner" />}
        {loader.state === 'idle' && (
          <button className="model-load-btn" onClick={loader.ensure}>Load AI</button>
        )}
        {loader.state === 'error' && (
          <button className="model-load-btn" onClick={loader.ensure}>Retry</button>
        )}
      </div>

      <div className="msg-list" ref={listRef}>
        {msgs.map(msg => (
          <div key={msg.id} className={`msg msg-${msg.role === 'user' ? 'user' : 'ai'}`}>
            {msg.role === 'assistant' && (
              <div className="msg-av msg-av-ai" style={{ fontSize: 10, letterSpacing: 0 }}>AI</div>
            )}
            <div className="msg-bubble">
              {msg.pending && !msg.text ? (
                <div className="typing-dots"><span /><span /><span /></div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="msg-av msg-av-user">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        {showQuick && (
          <div style={{ padding: '6px 0 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Suggested</div>
            <div className="quick-row">
              {QUICK_PROMPTS.map(q => (
                <button key={q} className="quick-chip" onClick={() => send(q)} disabled={busy}>{q}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form className="chat-bar" onSubmit={handleSubmit}>
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            className="chat-input-field"
            placeholder={busy ? 'Coach is typing…' : 'Ask about health, fitness, nutrition…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={busy}
            autoComplete="off"
          />
        </div>
        {busy
          ? <button type="button" className="stop-btn" onClick={() => cancelRef.current?.()}>
              <svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" fill="white" /></svg>
            </button>
          : <button type="submit" className={`send-btn${sending ? ' sending' : ''}`} disabled={!input.trim()}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
            </button>
        }
      </form>
    </div>
  );
}
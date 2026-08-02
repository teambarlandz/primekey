'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, ExternalLink, RefreshCw, Send, Phone } from 'lucide-react';
import {
  fetchWhatsAppThreads,
  fetchWhatsAppMessages,
  sendWhatsAppMessage,
  startWhatsAppThread,
  buildWhatsAppLink,
  WhatsAppThread,
  WhatsAppMessage,
} from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

function formatTime(dateString: string | null): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export const WhatsAppPanel: React.FC = () => {
  const [threads, setThreads] = useState<WhatsAppThread[]>([]);
  const [activeThread, setActiveThread] = useState<WhatsAppThread | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWhatsAppThreads();
      setThreads(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const openThread = async (thread: WhatsAppThread) => {
    setActiveThread(thread);
    setError(null);
    try {
      const data = await fetchWhatsAppMessages(thread.id);
      setMessages(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load chat history.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !draft.trim() || sending) return;

    setSending(true);
    try {
      const sent = await sendWhatsAppMessage(activeThread.id, draft.trim());
      setMessages((prev) => [...prev, sent]);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id ? { ...t, last_message: sent.body, last_message_at: sent.created_at, message_count: t.message_count + 1 } : t
        )
      );
      setDraft('');
      window.open(buildWhatsAppLink(activeThread.phone, sent.body), '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleStartNew = async () => {
    const phone = window.prompt('Start a WhatsApp conversation. Enter phone number (e.g., 08012345678):');
    if (!phone || !phone.trim()) return;
    setError(null);
    try {
      const thread = await startWhatsAppThread({ phone: phone.trim(), message: 'Hello from Primekey Homes 👋' });
      await loadThreads();
      openThread(thread);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to start conversation.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Thread list */}
      <div className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-base font-bold font-heading" style={{ color: BRAND_COLOR }}>
            <MessageCircle className="w-4 h-4" />
            Conversations
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: BRAND_COLOR }}>
              {threads.length}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={loadThreads}
              disabled={loading}
              className="p-2 rounded-full hover:bg-purple-50 transition-colors"
              style={{ color: BRAND_COLOR }}
              aria-label="Refresh conversations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}

        <button
          onClick={handleStartNew}
          className="w-full mb-3 px-3 py-2 rounded-xl text-sm font-semibold font-heading text-white transition-colors"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          + New conversation
        </button>

        {threads.length === 0 ? (
          <p className="text-sm text-[#4a607a] font-body">No conversations yet. Start one to reach a lead on WhatsApp.</p>
        ) : (
          <ul className="space-y-1.5 max-h-[420px] overflow-y-auto">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  onClick={() => openThread(thread)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    activeThread?.id === thread.id ? 'bg-[#f3f0ff]/70 border-purple-200' : 'bg-white border-purple-100 hover:bg-purple-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>
                      {thread.lead_name || thread.display_name || thread.phone}
                    </p>
                    <span className="text-[10px] text-[#4a607a] whitespace-nowrap">{formatTime(thread.last_message_at)}</span>
                  </div>
                  <p className="text-xs text-[#4a607a] font-body mt-0.5 truncate">
                    {thread.last_message || '—'}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat window */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-4 flex flex-col min-h-[420px]">
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <MessageCircle className="w-12 h-12 text-purple-200 mb-3" />
            <p className="text-sm font-body text-[#4a607a]">Select a conversation to view the chat history.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 mb-3">
              <div>
                <p className="font-semibold font-heading" style={{ color: BRAND_COLOR }}>
                  {activeThread.lead_name || activeThread.display_name || activeThread.phone}
                </p>
                <p className="text-xs text-[#4a607a] font-body flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {activeThread.phone}
                </p>
              </div>
              <a
                href={buildWhatsAppLink(activeThread.phone, activeThread.last_message || 'Hello')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-heading text-white transition-colors"
                style={{ backgroundColor: '#25D366' }}
              >
                <ExternalLink className="w-3 h-3" />
                Open WhatsApp
              </a>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] pr-1">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-[#4a607a] font-body py-8">No messages in this thread yet.</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm font-body ${
                        message.direction === 'inbound'
                          ? 'bg-purple-50 text-[#22376e] border border-purple-100'
                          : 'text-white'
                      }`}
                      style={message.direction === 'outbound' ? { backgroundColor: BRAND_COLOR } : undefined}
                    >
                      <p>{message.body}</p>
                      <p className={`text-[10px] mt-1 ${message.direction === 'inbound' ? 'text-[#4a607a]' : 'text-white/70'}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-purple-100 mt-3">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 h-10 px-3 rounded-xl border border-purple-200 bg-white text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-semibold font-heading text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

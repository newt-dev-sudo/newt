import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, SmilePlus, UserPlus } from "lucide-react";
import type { SimulatedMessage } from "./simulationEngine.js";

interface SimulatedChatProps {
  messages: SimulatedMessage[];
  onSendMessage: (content: string) => void;
  onJoin: () => void;
  onReaction: (emoji: string) => void;
}

export function SimulatedChat({ messages, onSendMessage, onJoin, onReaction }: SimulatedChatProps) {
  const [draft, setDraft] = useState("!hello");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    onSendMessage(content);
    setDraft("");
  }

  return (
    <section className="chat-surface" aria-label="Simulated Discord chat">
      <div className="chat-header">
        <div>
          <strong># bot-commands</strong>
          <span>Test Server</span>
        </div>
        <div className="chat-actions">
          <button type="button" onClick={onJoin} title="Trigger join event">
            <UserPlus size={16} />
          </button>
          <button type="button" onClick={() => onReaction("👍")} title="Trigger thumbs-up reaction">
            <SmilePlus size={16} />
          </button>
        </div>
      </div>

      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">Send a command or trigger a join event to see the bot respond.</div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`message ${message.from}`}>
              <div className="avatar">{initials(message.author)}</div>
              <div className="bubble">
                <div className="meta">
                  <strong>{message.author}</strong>
                  <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {message.content && <p>{message.content}</p>}
                {message.embed && (
                  <div className="embed" style={{ borderLeftColor: message.embed.color ?? "#5865f2" }}>
                    {message.embed.title && <strong>{message.embed.title}</strong>}
                    {message.embed.description && <p>{message.embed.description}</p>}
                    {message.embed.fields?.map((field) => (
                      <dl key={field.name}>
                        <dt>{field.name}</dt>
                        <dd>{field.value}</dd>
                      </dl>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <form className="message-form" onSubmit={submit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message #bot-commands" />
        <button type="submit" title="Send message">
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatApi, matchingApi } from '@/services/api';
import { Message, mockMatches, mockRestaurants } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const match = mockMatches.find(m => m.id === matchId);

  useEffect(() => {
    if (matchId) {
      loadMessages();
    }
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const data = await chatApi.getMessages(matchId);
      setMessages(data);
      await chatApi.markAsSeen(matchId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !matchId) return;

    try {
      const message = await chatApi.sendMessage(matchId, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMatchedRestaurantNames = () => {
    if (!match) return '';
    return match.matchedRestaurants
      .map(id => mockRestaurants.find(r => r.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Chat not found</p>
        <Link to="/matches">
          <Button variant="gold">Back to Matches</Button>
        </Link>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup?.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 h-16 px-4 glass-strong border-b border-border/50">
        <Link to="/matches">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <img
              src={match.user.avatar}
              alt={match.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-drink-green border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">
              {match.user.name}
            </h1>
            <p className="text-xs text-primary truncate">
              📍 {getMatchedRestaurantNames()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {groupedMessages.map((group, groupIndex) => (
              <div key={group.date}>
                {/* Date Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground px-2">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Messages */}
                {group.messages.map((message, i) => {
                  const isOwn = message.senderId === 'current';
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex mb-2",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[75%] px-4 py-2.5 rounded-2xl",
                        isOwn 
                          ? "gradient-gold text-primary-foreground rounded-br-md" 
                          : "bg-card text-foreground rounded-bl-md"
                      )}>
                        <p className="text-sm">{message.text}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          <span className="text-[10px]">
                            {formatTime(message.timestamp)}
                          </span>
                          {isOwn && (
                            <span className="text-[10px]">
                              {message.seen ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 glass-strong border-t border-border/50 safe-area-pb">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary border-0"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            variant="gold"
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

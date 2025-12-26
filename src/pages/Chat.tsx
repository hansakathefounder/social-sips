import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatService, matchingService, profileService, restaurantService, DbMessage, DbMatch, DbProfile, DbRestaurant } from '@/services/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MatchData {
  match: DbMatch;
  otherUser: DbProfile;
  restaurant: DbRestaurant | null;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (matchId && user) {
      loadMatchAndMessages();
    }
  }, [matchId, user, authLoading, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!matchId) return;
    
    const subscription = chatService.subscribeToMessages(matchId, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  const loadMatchAndMessages = async () => {
    if (!matchId || !user) return;
    setLoading(true);
    try {
      // Load match data
      const matches = await matchingService.getMatches(user.id);
      const match = matches.find(m => m.id === matchId);
      
      if (!match) {
        setMatchData(null);
        setLoading(false);
        return;
      }

      // Load other user's profile
      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const otherUser = await profileService.getById(otherUserId);
      
      // Load restaurant if exists
      let restaurant: DbRestaurant | null = null;
      if (match.shared_restaurant_id) {
        restaurant = await restaurantService.getById(match.shared_restaurant_id);
      }

      if (otherUser) {
        setMatchData({ match, otherUser, restaurant });
      }

      // Load messages
      const data = await chatService.getMessages(matchId);
      setMessages(data);
      await chatService.markAsSeen(matchId, user.id);
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !matchId || !user) return;

    try {
      const message = await chatService.sendMessage(matchId, user.id, newMessage.trim());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Chat not found</p>
        <Link to="/matches">
          <Button variant="gold">Back to Matches</Button>
        </Link>
      </div>
    );
  }

  const { otherUser, restaurant } = matchData;

  // Group messages by date
  const groupedMessages: { date: string; messages: DbMessage[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.created_at);
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
              src={otherUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-drink-green border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">
              {otherUser.name}
            </h1>
            {restaurant && (
              <p className="text-xs text-primary truncate">
                📍 {restaurant.name}
              </p>
            )}
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
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🍷</div>
            <h3 className="font-semibold text-foreground mb-2">Say hello!</h3>
            <p className="text-sm text-muted-foreground">
              You matched at {restaurant?.name || 'a shared spot'}. Start the conversation!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {groupedMessages.map((group) => (
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
                  const isOwn = message.sender_id === user?.id;
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
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          <span className="text-[10px]">
                            {formatTime(message.created_at)}
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

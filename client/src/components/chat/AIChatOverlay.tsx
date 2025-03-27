import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, MessageSquare, Sparkles, Users, BarChart, TrendingUp } from 'lucide-react';
import { aiService, type SentimentAnalysis, type CrowdAnalytics } from '@/lib/services/aiService';
import { useAuth } from '@/lib/stores/useAuth';
import { useEvents } from '@/lib/stores/useEvents';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  sentiment?: {
    mood: 'positive' | 'neutral' | 'negative';
    score: number;
  };
}

interface AIChatOverlayProps {
  eventId: number;
}

export default function AIChatOverlay({ eventId }: AIChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crowdAnalytics, setCrowdAnalytics] = useState<CrowdAnalytics | null>(null);
  const [engagementLevel, setEngagementLevel] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { currentEvent } = useEvents();

  // Fetch initial crowd analytics
  useEffect(() => {
    const fetchCrowdAnalytics = async () => {
      const analytics = await aiService.getCrowdAnalytics(eventId);
      setCrowdAnalytics(analytics);
      setEngagementLevel(analytics.engagementScore);
    };
    fetchCrowdAnalytics();
    // Set up interval to update analytics
    const interval = setInterval(fetchCrowdAnalytics, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeSentiment = async (text: string): Promise<SentimentAnalysis | undefined> => {
    try {
      console.log('🔍 Analyzing sentiment for message:', text);
      const analysis = await aiService.analyzeChatSentiment([text]);
      console.log('📊 Sentiment analysis result:', analysis);
      return {
        mood: analysis.mood,
        score: analysis.score,
        keywords: analysis.keywords
      };
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      return undefined;
    }
  };

  const updateEngagement = (sentiment: SentimentAnalysis) => {
    console.log('📈 Current engagement level:', engagementLevel);
    const engagementDelta = sentiment.score * 5; // Scale the sentiment score to engagement change
    const newEngagement = Math.min(100, Math.max(0, engagementLevel + engagementDelta));
    
    console.log('🎯 Engagement delta:', engagementDelta);
    console.log('📊 New engagement level:', newEngagement);
    
    // Log engagement changes
    if (newEngagement > engagementLevel) {
      console.log(`🎉 Audience engagement rising! (${Math.round(newEngagement)}%)`);
    } else if (newEngagement < engagementLevel) {
      console.log(`📉 Audience engagement decreasing (${Math.round(newEngagement)}%)`);
    } else {
      console.log('➡️ Engagement level stable');
    }
    
    setEngagementLevel(newEngagement);
    
    // Update crowd analytics
    setCrowdAnalytics(prev => {
      if (!prev) return null;
      return {
        ...prev,
        engagementScore: newEngagement,
        peakMoments: [
          ...prev.peakMoments,
          {
            timestamp: Date.now(),
            description: `Engagement ${newEngagement > engagementLevel ? 'increased' : 'decreased'} to ${Math.round(newEngagement)}%`
          }
        ]
      };
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    console.log('💬 Sending message:', input);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      // Always increase engagement when a message is sent
      const newEngagement = Math.min(100, engagementLevel + 10);
      console.log(`🎉 Audience engagement rising! (${Math.round(newEngagement)}%)`);
      setEngagementLevel(newEngagement);
      
      // Update crowd analytics
      setCrowdAnalytics(prev => {
        if (!prev) return null;
        return {
          ...prev,
          engagementScore: newEngagement,
          peakMoments: [
            ...prev.peakMoments,
            {
              timestamp: Date.now(),
              description: `Engagement increased to ${Math.round(newEngagement)}%`
            }
          ]
        };
      });
      
      // Get AI response
      const aiResponse = await aiService.getChatResponse(
        input,
        currentEvent?.title || ''
      );

      console.log('🤖 AI Response:', aiResponse);

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // If suggestions are provided, add them as system messages
      if (aiResponse.suggestions?.length) {
        console.log('💡 Adding suggestions:', aiResponse.suggestions);
        const suggestionMessages: Message[] = aiResponse.suggestions.map((suggestion, index) => ({
          id: (Date.now() + 2 + index).toString(),
          text: suggestion,
          sender: 'system',
          timestamp: new Date()
        }));
        setMessages(prev => [...prev, ...suggestionMessages]);
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-xl bg-background/95 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Chat Assistant
          </CardTitle>
          {crowdAnalytics && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {crowdAnalytics.totalAttendees}
              </Badge>
              <Badge 
                variant="outline" 
                className={`flex items-center gap-1 ${
                  engagementLevel > 70 ? 'bg-green-500/10 text-green-500' :
                  engagementLevel > 40 ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {Math.round(engagementLevel)}%
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`
                    rounded-lg px-4 py-2 max-w-[80%] space-y-1
                    ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender === 'ai'
                        ? 'bg-muted'
                        : 'bg-accent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {message.sender === 'ai' && (
                      <Sparkles className="h-3 w-3 text-primary" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                  {message.sentiment && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          message.sentiment.mood === 'positive'
                            ? 'bg-green-500/10 text-green-500'
                            : message.sentiment.mood === 'negative'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {message.sentiment.mood}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 mt-4">
          <Input
            placeholder="Ask me anything about the event..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            disabled={isAnalyzing}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={isAnalyzing || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
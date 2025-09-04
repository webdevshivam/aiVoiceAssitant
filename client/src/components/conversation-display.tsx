import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Download, Trash2, Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Message } from "@shared/schema";

interface ConversationDisplayProps {
  messages: Message[];
  onSendMessage?: (message: string) => void;
  onClearConversation?: () => void;
  onExportConversation?: () => void;
  isAiThinking?: boolean;
}

export function ConversationDisplay({ 
  messages, 
  onSendMessage, 
  onClearConversation, 
  onExportConversation,
  isAiThinking = false 
}: ConversationDisplayProps) {
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSendText = () => {
    if (textInput.trim() && onSendMessage) {
      onSendMessage(textInput);
      setTextInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 text-primary mr-2" />
            Live Conversation
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onExportConversation}
              data-testid="button-export-conversation"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearConversation}
              data-testid="button-clear-conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Conversation Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto mb-4" data-testid="conversation-container">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversation yet. Start by clicking the microphone or typing a message.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`conversation-bubble rounded-lg p-3 ${
                  message.role === "user" ? "user" : "ai"
                }`}
                data-testid={`message-${message.role}-${index}`}
              >
                <div className="flex items-start space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" 
                      ? "bg-primary-foreground/20" 
                      : "bg-primary"
                  }`}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">
                      {message.role === "user" ? "Customer" : "AI Sales Assistant"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === "user" 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    }`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* AI Thinking Indicator */}
          {isAiThinking && (
            <div className="conversation-bubble ai rounded-lg p-3" data-testid="ai-thinking">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">AI Sales Assistant</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Fallback */}
        <div className="pt-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message (fallback mode)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-text-message"
            />
            <Button onClick={handleSendText} data-testid="button-send-text">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

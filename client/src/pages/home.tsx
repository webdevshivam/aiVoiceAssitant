import { useState, useEffect, useCallback } from "react";
import { SetupPanel } from "@/components/setup-panel";
import { VoiceInterface } from "@/components/voice-interface";
import { ConversationDisplay } from "@/components/conversation-display";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mic } from "lucide-react";
import type { Message } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [salesPrompt, setSalesPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState<Date | null>(null);
  const [conversationTime, setConversationTime] = useState("00:00");
  const [isProcessing, setIsProcessing] = useState(false);

  // Update conversation timer
  useEffect(() => {
    if (!conversationActive || !conversationStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - conversationStartTime.getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setConversationTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [conversationActive, conversationStartTime]);

  // Reset timer when conversation starts
  useEffect(() => {
    if (conversationActive && !conversationStartTime) {
      setConversationStartTime(new Date());
    } else if (!conversationActive) {
      setConversationStartTime(null);
      setConversationTime("00:00");
    }
  }, [conversationActive, conversationStartTime]);

  const chatMutation = useMutation({
    mutationFn: async ({ message, salesPrompt, apiKey }: { message: string; salesPrompt: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        salesPrompt,
        apiKey
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        role: "ai",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      // Use speech synthesis to speak the AI response
      if (window.speakAIResponse) {
        window.speakAIResponse(data.response);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
    },
  });

  const handleVoiceInput = useCallback((transcript: string) => {
    if (!transcript.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: transcript,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (!apiKey || !salesPrompt) {
      toast({
        title: "Configuration required",
        description: "Please set your API key and sales prompt before starting a conversation.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    chatMutation.mutate({ message: transcript, salesPrompt, apiKey });
  }, [apiKey, salesPrompt, chatMutation, toast]);

  const handleTextMessage = useCallback((message: string) => {
    handleVoiceInput(message);
  }, [handleVoiceInput]);

  const handlePlayAudio = useCallback((text: string) => {
    // Audio playback is handled by speech synthesis in VoiceInterface
    console.log("Playing audio for:", text);
  }, []);

  const handleClearConversation = useCallback(() => {
    setMessages([]);
    setConversationActive(false);
    toast({
      title: "Conversation cleared",
      description: "The conversation history has been cleared.",
    });
  }, [toast]);

  const handleExportConversation = useCallback(() => {
    if (messages.length === 0) {
      toast({
        title: "No conversation to export",
        description: "Start a conversation first before exporting.",
      });
      return;
    }

    const conversationData = {
      title: `Sales Conversation - ${new Date().toLocaleDateString()}`,
      messages,
      salesPrompt,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-conversation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation exported",
      description: "Your conversation has been downloaded as a JSON file.",
    });
  }, [messages, salesPrompt, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Voice Sales Assistant</h1>
                <p className="text-sm text-muted-foreground">Intelligent Voice-Powered Sales Conversations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Panel */}
          <div className="lg:col-span-1">
            <SetupPanel
              salesPrompt={salesPrompt}
              apiKey={apiKey}
              onSalesPromptChange={setSalesPrompt}
              onApiKeyChange={setApiKey}
            />
          </div>

          {/* Voice Interface and Conversation */}
          <div className="lg:col-span-2 space-y-6">
            <VoiceInterface
              onVoiceInput={handleVoiceInput}
              onPlayAudio={handlePlayAudio}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              conversationActive={conversationActive}
              setConversationActive={setConversationActive}
              conversationTime={conversationTime}
              messageCount={messages.length}
              isProcessing={isProcessing}
            />

            <ConversationDisplay
              messages={messages}
              onSendMessage={handleTextMessage}
              onClearConversation={handleClearConversation}
              onExportConversation={handleExportConversation}
              isAiThinking={isProcessing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Extend window object for speech synthesis function
declare global {
  interface Window {
    speakAIResponse?: (text: string) => void;
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

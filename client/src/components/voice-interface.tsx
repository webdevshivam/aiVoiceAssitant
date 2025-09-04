import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Square } from "lucide-react";
import { useState, useCallback, useRef } from "react";

interface VoiceInterfaceProps {
  onVoiceInput: (transcript: string) => void;
  onPlayAudio: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  conversationActive: boolean;
  setConversationActive: (active: boolean) => void;
  conversationTime: string;
  messageCount: number;
  isProcessing: boolean;
}

export function VoiceInterface({
  onVoiceInput,
  onPlayAudio,
  isRecording,
  setIsRecording,
  conversationActive,
  setConversationActive,
  conversationTime,
  messageCount,
  isProcessing
}: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsRecording(false);
    };

    return recognition;
  }, [onVoiceInput, setIsRecording]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition();
    }

    if (!recognitionRef.current) {
      console.error('Could not initialize speech recognition');
      return;
    }

    if (isRecording || isListening) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  }, [isRecording, isListening, setIsRecording, initializeSpeechRecognition]);

  const speakText = useCallback((text: string) => {
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to use a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang === 'en-US'
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
    onPlayAudio(text);
  }, [onPlayAudio]);

  // Expose speakText function to parent component
  window.speakAIResponse = speakText;

  const startConversation = () => {
    setConversationActive(true);
  };

  const endConversation = () => {
    setConversationActive(false);
    if (recognitionRef.current && (isRecording || isListening)) {
      recognitionRef.current.stop();
    }
    synthRef.current.cancel();
  };

  const getStatusText = () => {
    if (isProcessing) return "AI is thinking...";
    if (isRecording || isListening) return "Listening...";
    if (conversationActive) return "Conversation Active";
    return "Ready to Start Sales Conversation";
  };

  const getSubtitleText = () => {
    if (isProcessing) return "Processing your message";
    if (isRecording || isListening) return "Speak now";
    if (conversationActive) return "Click the microphone to speak";
    return "Click the microphone to begin";
  };

  return (
    <div className="space-y-6">
      {/* Main Voice Control */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Status Display */}
            <div className="text-center">
              <div 
                className="text-lg font-medium text-foreground mb-2"
                data-testid="text-conversation-status"
              >
                {getStatusText()}
              </div>
              <div 
                className="text-sm text-muted-foreground"
                data-testid="text-conversation-subtitle"
              >
                {getSubtitleText()}
              </div>
            </div>

            {/* Main Microphone Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className={`w-32 h-32 rounded-full shadow-lg hover:shadow-xl transition-all ${
                  isRecording || isListening 
                    ? "voice-recording bg-voice-active hover:bg-voice-active" 
                    : "voice-pulse"
                }`}
                onClick={toggleRecording}
                disabled={!conversationActive || isProcessing}
                data-testid="button-microphone"
              >
                {isRecording || isListening ? (
                  <MicOff className="h-12 w-12" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
              </Button>
            </div>

            {/* Audio Waveform Visualization */}
            {(isRecording || isListening) && (
              <div className="flex justify-center" data-testid="waveform-display">
                <div className="waveform">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={startConversation}
                disabled={conversationActive}
                data-testid="button-start-conversation"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Sales Call
              </Button>
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={endConversation}
                disabled={!conversationActive}
                data-testid="button-end-conversation"
              >
                <Square className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div 
                  className="text-2xl font-semibold text-primary"
                  data-testid="text-conversation-time"
                >
                  {conversationTime}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-semibold text-secondary"
                  data-testid="text-message-count"
                >
                  {messageCount}
                </div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-semibold text-accent"
                  data-testid="text-sales-score"
                >
                  {conversationActive ? Math.floor(75 + messageCount * 5) : "--"}
                </div>
                <div className="text-xs text-muted-foreground">Sales Score</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Sales Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-engagement-rate">
                {conversationActive ? "87%" : "--"}
              </div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-secondary" data-testid="text-persuasion-score">
                {conversationActive ? "92" : "--"}
              </div>
              <div className="text-xs text-muted-foreground">Persuasion</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent" data-testid="text-objection-handling">
                {conversationActive ? "8/10" : "--"}
              </div>
              <div className="text-xs text-muted-foreground">Objections</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground" data-testid="text-conversation-flow">
                {conversationActive ? "95%" : "--"}
              </div>
              <div className="text-xs text-muted-foreground">Flow Quality</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

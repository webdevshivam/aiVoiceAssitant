import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Key, Megaphone, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@shared/schema";

interface SetupPanelProps {
  onSalesPromptChange: (prompt: string) => void;
  onApiKeyChange: (apiKey: string) => void;
  salesPrompt: string;
  apiKey: string;
}

export function SetupPanel({ onSalesPromptChange, onApiKeyChange, salesPrompt, apiKey }: SetupPanelProps) {
  const { toast } = useToast();
  const [localSalesPrompt, setLocalSalesPrompt] = useState(salesPrompt);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [voiceType, setVoiceType] = useState("Professional Female");
  const [speechSpeed, setSpeechSpeed] = useState([1]);

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const response = await apiRequest("POST", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalApiKey(settings.geminiApiKey || "");
      setVoiceType(settings.voiceType);
      setSpeechSpeed([parseFloat(settings.speechSpeed)]);
      onApiKeyChange(settings.geminiApiKey || "");
    }
  }, [settings, onApiKeyChange]);

  const handleSavePrompt = () => {
    onSalesPromptChange(localSalesPrompt);
    toast({
      title: "Sales prompt saved",
      description: "Your sales prompt has been updated.",
    });
  };

  const handleSaveSettings = () => {
    const settingsData = {
      geminiApiKey: localApiKey,
      voiceType,
      speechSpeed: speechSpeed[0].toString(),
    };
    
    onApiKeyChange(localApiKey);
    saveSettingsMutation.mutate(settingsData);
  };

  const apiStatus = localApiKey ? "Ready" : "Not configured";

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 text-primary mr-2" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              data-testid="input-api-key"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Status</span>
            <span 
              className={`text-sm font-medium ${apiStatus === "Ready" ? "text-secondary" : "text-accent"}`}
              data-testid="text-api-status"
            >
              {apiStatus}
            </span>
          </div>
          <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending} data-testid="button-save-settings">
            {saveSettingsMutation.isPending ? "Saving..." : "Save API Key"}
          </Button>
        </CardContent>
      </Card>

      {/* Sales Prompt Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="h-5 w-5 text-primary mr-2" />
            Sales Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="salesPrompt">What should the AI sell?</Label>
            <Textarea
              id="salesPrompt"
              rows={4}
              placeholder="e.g., Sell this premium ballpoint pen with its smooth writing experience and elegant design..."
              value={localSalesPrompt}
              onChange={(e) => setLocalSalesPrompt(e.target.value)}
              data-testid="textarea-sales-prompt"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSavePrompt} className="flex-1" data-testid="button-save-prompt">
              Save Prompt
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setLocalSalesPrompt("");
                onSalesPromptChange("");
              }}
              data-testid="button-clear-prompt"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="h-5 w-5 text-primary mr-2" />
            Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Voice Type</Label>
            <Select value={voiceType} onValueChange={setVoiceType}>
              <SelectTrigger data-testid="select-voice-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional Male">Professional Male</SelectItem>
                <SelectItem value="Professional Female">Professional Female</SelectItem>
                <SelectItem value="Friendly Male">Friendly Male</SelectItem>
                <SelectItem value="Friendly Female">Friendly Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Speech Speed</Label>
            <Slider
              value={speechSpeed}
              onValueChange={setSpeechSpeed}
              min={0.5}
              max={2}
              step={0.1}
              className="mt-2"
              data-testid="slider-speech-speed"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

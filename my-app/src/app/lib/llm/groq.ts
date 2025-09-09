import { LLMProvider, ChatMessage, OnDelta } from './base';

export interface AdapterResponse {
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
  requestId: string;
}

interface GroqMessage {
  role: string;
  content: string;
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: GroqMessage;
    index: number;
    logprobs: null | unknown;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GroqStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  public readonly providerId: string = 'groq';

  constructor(
    apiKey: string,
    baseUrl = "https://api.groq.com/openai/v1/chat/completions",
    defaultModel = "llama-3.3-70b-versatile"
  ) {
    if (!apiKey) {
      throw new Error("GroqProvider requires an API key");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    console.log("Groq api implementations starts here");
  }

  /**
   * Convert application message format to Groq message format
   */
  private convertToGroqMessages(messages: ChatMessage[]): GroqMessage[] {
    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  /**
   * Health check for the Groq service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const keyToUse = this.apiKey;
      if (!keyToUse) return false;
      
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${keyToUse}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Groq health check failed:', error);
      return false;
    }
  }

  /**
   * Send chat completion request to Groq API
   */
  async getChatCompletion(
    messages: ChatMessage[],
    options: {
      apiKey?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<AdapterResponse> {
    try {
      const model = options.model || this.defaultModel;
      const keyToUse = this.apiKey;

      if (!keyToUse) {
        throw new Error('API key is required for Groq API');
      }
      
      const requestBody: GroqRequest = {
        model,
        messages: this.convertToGroqMessages(messages),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        stream: options.stream ?? false,
      };

      console.log(`Sending request to Groq API for model: ${model}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API Error: ${response.status}, ${errorText}`);
        throw new Error(`Groq API Error: ${response.status}, ${errorText}`);
      }

      const data: GroqResponse = await response.json();

      return {
        content: data.choices[0].message.content,
        tokenUsage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason,
        requestId: data.id,
      };
    } catch (error) {
      console.error('Error in Groq API call:', error);
      throw error;
    }
  }

  /**
   * Implementation of the chat method from LLMProvider interface
   */
  async chat(
    messages: ChatMessage[], 
    opts: { apiKey: string; model: string; maxTokens?: number }
  ): Promise<string> {
    const response = await this.getChatCompletion(messages, {
      apiKey: this.apiKey,
      model: opts.model,
      maxTokens: opts.maxTokens
    });
    
    return response.content;
  }

  /**
   * Stream chat completions from Groq API
   */
  async streamChat(
    messages: ChatMessage[],
    opts: { apiKey: string; model: string; maxTokens?: number },
    onDelta: OnDelta
  ): Promise<void> {
    try {
      const keyToUse = this.apiKey;
      const model = opts.model || this.defaultModel;
      console.log("KeyTOUSe", keyToUse);
      if (!keyToUse) {
        throw new Error('API key is required for Groq streaming');
      }
      
      console.log(`Starting Groq stream with model: ${model}`);
      
      const requestBody: GroqRequest = {
        model,
        messages: this.convertToGroqMessages(messages),
        temperature: 0.7,
        max_tokens: opts.maxTokens ?? 1024,
        stream: true,
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq streaming error: ${response.status}, ${errorText}`);
        throw new Error(`Groq streaming error: ${response.status}, ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Groq stream completed');
          break;
        }
        
        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines from the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line in the buffer
        
        for (const line of lines) {
          // Skip empty lines or "[DONE]" messages
          if (!line.trim() || line.includes('[DONE]')) continue;
          
          // Lines should start with "data: "
          if (!line.startsWith('data: ')) continue;
          
          try {
            // Parse the JSON
            const jsonData = line.substring(6); // Remove "data: " prefix
            if (!jsonData.trim()) continue;
            
            const chunk: GroqStreamChunk = JSON.parse(jsonData);
            
            // Extract and send content delta
            if (chunk.choices && chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              onDelta(content);
            }
          } catch (error) {
            console.error('Error parsing SSE chunk:', error, line);
          }
        }
      }
      
      console.log('Groq stream processing complete');
    } catch (error) {
      console.error('Error in Groq streaming:', error);
      throw error;
    }
  }
}

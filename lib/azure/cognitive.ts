// Azure Cognitive Services Integration for SAINTSAL™ Companions

interface AzureConfig {
  endpoint: string
  apiKey: string
  region: string
}

interface VoiceConfig {
  voiceName: string
  language: string
  format: string
}

interface DocumentAnalysis {
  text: string
  entities: any[]
  sentiment: number
  keyPhrases: string[]
}

export class AzureCognitiveServices {
  private config: AzureConfig
  
  constructor() {
    this.config = {
      endpoint: process.env.AZURE_COGNITIVE_ENDPOINT || '',
      apiKey: process.env.AZURE_COGNITIVE_KEY || '',
      region: process.env.AZURE_REGION || 'eastus'
    }
  }

  /**
   * Text-to-Speech (TTS) - Convert companion responses to speech
   */
  async textToSpeech(text: string, voiceConfig?: VoiceConfig): Promise<ArrayBuffer> {
    const defaultVoice = {
      voiceName: 'en-US-AriaNeural',
      language: 'en-US',
      format: 'audio-24khz-48kbitrate-mono-mp3'
    }
    
    const voice = { ...defaultVoice, ...voiceConfig }
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.language}">
        <voice name="${voice.voiceName}">
          <prosody rate="medium" pitch="medium">
            ${text}
          </prosody>
        </voice>
      </speak>
    `

    try {
      const response = await fetch(`${this.config.endpoint}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': voice.format,
          'User-Agent': 'SaintVisionAI-Companion'
        },
        body: ssml
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error('Text-to-Speech error:', error)
      throw error
    }
  }

  /**
   * Speech-to-Text (STT) - Convert user voice input to text
   */
  async speechToText(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch(`${this.config.endpoint}/speechtotext/v3.0/transcriptions`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`)
      }

      const result = await response.json()
      return result.displayText || result.text || ''
    } catch (error) {
      console.error('Speech-to-Text error:', error)
      throw error
    }
  }

  /**
   * Document Analysis - OCR, entity extraction, sentiment analysis
   */
  async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    try {
      const formData = new FormData()
      formData.append('document', file)

      // First, extract text using Form Recognizer
      const ocrResponse = await fetch(`${this.config.endpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2022-08-31`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey
        },
        body: formData
      })

      if (!ocrResponse.ok) {
        throw new Error(`OCR API error: ${ocrResponse.status}`)
      }

      const ocrResult = await ocrResponse.json()
      const extractedText = this.extractTextFromOCR(ocrResult)

      // Analyze text for entities and sentiment
      const analysisResult = await this.analyzeText(extractedText)

      return {
        text: extractedText,
        entities: analysisResult.entities,
        sentiment: analysisResult.sentiment,
        keyPhrases: analysisResult.keyPhrases
      }
    } catch (error) {
      console.error('Document analysis error:', error)
      throw error
    }
  }

  /**
   * Text Analysis - Entity recognition, sentiment, key phrases
   */
  async analyzeText(text: string): Promise<{ entities: any[], sentiment: number, keyPhrases: string[] }> {
    try {
      const requestBody = {
        documents: [{
          id: '1',
          language: 'en',
          text: text
        }]
      }

      // Entity Recognition
      const entitiesResponse = await fetch(`${this.config.endpoint}/text/analytics/v3.1/entities/recognition/general`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Sentiment Analysis
      const sentimentResponse = await fetch(`${this.config.endpoint}/text/analytics/v3.1/sentiment`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Key Phrase Extraction
      const keyPhrasesResponse = await fetch(`${this.config.endpoint}/text/analytics/v3.1/keyPhrases`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const [entitiesResult, sentimentResult, keyPhrasesResult] = await Promise.all([
        entitiesResponse.json(),
        sentimentResponse.json(),
        keyPhrasesResponse.json()
      ])

      return {
        entities: entitiesResult.documents[0]?.entities || [],
        sentiment: sentimentResult.documents[0]?.confidenceScores?.positive || 0,
        keyPhrases: keyPhrasesResult.documents[0]?.keyPhrases || []
      }
    } catch (error) {
      console.error('Text analysis error:', error)
      return { entities: [], sentiment: 0, keyPhrases: [] }
    }
  }

  /**
   * Custom Search - Bing Search API integration
   */
  async webSearch(query: string, companionContext?: string): Promise<any[]> {
    try {
      const searchQuery = companionContext 
        ? `${query} ${companionContext}` 
        : query

      const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(searchQuery)}&count=5`, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_KEY || this.config.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }

      const result = await response.json()
      return result.webPages?.value || []
    } catch (error) {
      console.error('Web search error:', error)
      return []
    }
  }

  /**
   * Emotional Calibration - Analyze text for emotional context (HACP™ specific)
   */
  async emotionalCalibration(text: string, conversationHistory?: string[]): Promise<{
    emotion: string
    confidence: number
    escalationLevel: number
    suggestedResponse: string
  }> {
    try {
      const contextualText = conversationHistory 
        ? [...conversationHistory, text].join(' ') 
        : text

      const analysis = await this.analyzeText(contextualText)
      
      // HACP™ proprietary emotional mapping
      const emotionMapping = this.mapSentimentToEmotion(analysis.sentiment, analysis.entities)
      
      return {
        emotion: emotionMapping.emotion,
        confidence: emotionMapping.confidence,
        escalationLevel: this.calculateEscalationLevel(emotionMapping),
        suggestedResponse: await this.generateContextualResponse(text, emotionMapping)
      }
    } catch (error) {
      console.error('Emotional calibration error:', error)
      return {
        emotion: 'neutral',
        confidence: 0.5,
        escalationLevel: 0,
        suggestedResponse: 'I understand. How can I help you with that?'
      }
    }
  }

  // Private helper methods

  private extractTextFromOCR(ocrResult: any): string {
    try {
      return ocrResult.analyzeResult?.content || ''
    } catch {
      return ''
    }
  }

  private mapSentimentToEmotion(sentiment: number, entities: any[]): { emotion: string, confidence: number } {
    // HACP™ emotional intelligence mapping
    const hasUrgentKeywords = entities.some((entity: any) => 
      ['urgent', 'emergency', 'asap', 'immediately'].includes(entity.text?.toLowerCase())
    )

    if (hasUrgentKeywords) {
      return { emotion: 'urgent', confidence: 0.9 }
    } else if (sentiment > 0.7) {
      return { emotion: 'positive', confidence: sentiment }
    } else if (sentiment < 0.3) {
      return { emotion: 'frustrated', confidence: 1 - sentiment }
    } else {
      return { emotion: 'neutral', confidence: 0.5 }
    }
  }

  private calculateEscalationLevel(emotionMapping: { emotion: string, confidence: number }): number {
    const escalationMap = {
      'urgent': 3,
      'frustrated': 2,
      'confused': 1,
      'neutral': 0,
      'positive': 0
    }
    
    return escalationMap[emotionMapping.emotion as keyof typeof escalationMap] || 0
  }

  private async generateContextualResponse(text: string, emotionMapping: { emotion: string, confidence: number }): string {
    const responseTemplates = {
      urgent: "I understand this is urgent. Let me prioritize this for you right away.",
      frustrated: "I can sense your frustration. Let me help resolve this quickly.",
      confused: "I see you might need some clarification. Let me break this down for you.",
      neutral: "I'm here to help. What would you like me to focus on?",
      positive: "Great to hear! How can I help you build on this?"
    }
    
    return responseTemplates[emotionMapping.emotion as keyof typeof responseTemplates] || 
           "I understand. How can I assist you with that?"
  }
}

// Export singleton instance
export const azureCognitive = new AzureCognitiveServices()
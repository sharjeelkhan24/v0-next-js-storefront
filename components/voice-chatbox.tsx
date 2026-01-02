"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Send, X, MessageSquare, Loader2 } from "lucide-react"

/**
 * Voice-enabled chatbox component with Whisper API for speech-to-text
 * and GPT API for responses. Appears bottom-right on all pages.
 * Enhanced with module-specific commands and transaction automation.
 */
export function VoiceChatbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/voice-chat" }),
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /**
   * Start recording audio from user's microphone
   * Handles browser permissions and MediaRecorder setup
   */
  const startRecording = async () => {
    try {
      setError(null)
      console.log("[v0] Starting audio recording...")

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("[v0] Audio chunk received:", event.data.size, "bytes")
        }
      }

      mediaRecorder.onstop = async () => {
        console.log("[v0] Recording stopped, processing audio...")
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await transcribeAudio(audioBlob)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      console.log("[v0] Recording started successfully")
    } catch (err) {
      console.error("[v0] Error starting recording:", err)
      setError("Failed to access microphone. Please check permissions.")
    }
  }

  /**
   * Stop recording and process the audio
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("[v0] Stopping recording...")
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  /**
   * Send audio to Whisper API for transcription
   * @param audioBlob - Recorded audio blob
   */
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setError(null)

    try {
      console.log("[v0] Sending audio to Whisper API...")
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Transcription failed")
      }

      const { text } = await response.json()
      console.log("[v0] Transcription received:", text)

      if (text && text.trim()) {
        setInputValue(text)
        // Auto-send the transcribed message
        sendMessage({ text })
        setInputValue("")
      }
    } catch (err) {
      console.error("[v0] Transcription error:", err)
      setError(err instanceof Error ? err.message : "Failed to transcribe audio")
    } finally {
      setIsTranscribing(false)
    }
  }

  /**
   * Handle manual text message submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && status !== "in_progress") {
      console.log("[v0] Sending text message:", inputValue)
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  return (
    <>
      {/* Floating chat button - bottom right */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          aria-label="Open voice chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Jarvis AI</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <Mic className="mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">Welcome to Jarvis</p>
                  <p className="mt-2 text-xs">Try saying:</p>
                  <p className="text-xs">"Show me cars under $20k"</p>
                  <p className="text-xs">"What are today's deals?"</p>
                  <p className="text-xs">"Find properties in Miami"</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
                          {part.text}
                        </p>
                      )
                    }
                    if (part.type === "tool-invocation") {
                      return (
                        <div key={index} className="mt-2 rounded border border-border bg-background/50 p-2 text-xs">
                          <p className="font-medium">🔧 {part.toolName}</p>
                          {part.result && (
                            <pre className="mt-1 overflow-x-auto text-xs">{JSON.stringify(part.result, null, 2)}</pre>
                          )}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}

            {status === "in_progress" && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Jarvis is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || status === "in_progress"}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Jarvis anything..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isRecording || isTranscribing || status === "in_progress"}
              />

              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || status === "in_progress"}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {isRecording && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Recording... Click mic to stop</p>
            )}
            {isTranscribing && <p className="mt-2 text-center text-xs text-muted-foreground">Transcribing audio...</p>}
          </div>
        </Card>
      )}
    </>
  )
}

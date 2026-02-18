'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function VoiceNotePage() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data)
      })

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      })

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    setTranscription('🎯 Transcription coming in Phase 2! For now, your voice note is recorded.')

    // In Phase 2, this will call ElevenLabs Speech-to-Text API
    // const formData = new FormData()
    // formData.append('file', audioBlob, 'voice-note.webm')
    // const response = await fetch('/api/transcribe', { method: 'POST', body: formData })
    // const data = await response.json()
    // setTranscription(data.transcription)

    setTimeout(() => {
      setIsProcessing(false)
    }, 1000)
  }

  const handleSave = async () => {
    if (!transcription) {
      alert('Please transcribe the audio first')
      return
    }

    setIsProcessing(true)

    // In Phase 2, this will save to database
    // await fetch('/api/voice-notes', {
    //   method: 'POST',
    //   body: JSON.stringify({ audioUrl: '...', transcription }),
    // })

    setTimeout(() => {
      setIsProcessing(false)
      alert('Voice note saved successfully!')
      router.push('/portal')
    }, 500)
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setTranscription('')
    audioChunksRef.current = []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voice Recording</h1>
              <p className="text-sm text-gray-600 mt-1">Record a voice note for your AI team</p>
            </div>
            <a
              href="/portal"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Recording Interface */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6">
              {isRecording ? (
                <div className="w-20 h-20 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <svg
                  className="w-16 h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {isRecording && (
              <p className="text-red-600 font-semibold animate-pulse mb-4">Recording...</p>
            )}

            {!audioBlob ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                }`}
              >
                {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                  ✓ Recording complete!
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetRecording}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    🔄 Record Again
                  </button>
                  <button
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : '📝 Transcribe'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transcription Result */}
          {transcription && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcription</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => router.push('/portal')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
                >
                  {isProcessing ? 'Saving...' : '💾 Save Voice Note'}
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How it works:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">1.</span>
                <span>Click "Start Recording" and speak your message to your AI team</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">2.</span>
                <span>Click "Stop Recording" when you're done</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">3.</span>
                <span>
                  Click "Transcribe" to convert your voice to text (uses ElevenLabs STT in Phase
                  2)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">4.</span>
                <span>Review the transcription and save - your AI agents will receive it!</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}

import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * VoiceInput — Web Speech API voice recognition
 */
export function VoiceInput({ onTranscript, className = '' }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className={`p-2 rounded-lg transition-all ${
        listening
          ? 'text-crimson-400 bg-crimson-700/20 border border-crimson-700/30 animate-pulse'
          : 'text-white/30 hover:text-white/60 hover:bg-white/5'
      } ${className}`}
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      title={listening ? 'Listening... tap to stop' : 'Voice input'}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}

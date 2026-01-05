import { useState, useEffect, useRef } from "react";

interface UseTextToSpeechProps {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
}

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  words: string[];
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSupported: boolean;
}

export function useTextToSpeech({
  text,
  lang = "bn-BD",
  rate = 0.9,
  pitch = 1,
}: UseTextToSpeechProps): UseTextToSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(-1);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  }, []);

  useEffect(() => {
    // Split text into words (simpler approach)
    const wordArray = text
      .split(/\s+/)
      .filter((word) => word.trim().length > 0);
    setWords(wordArray);
  }, [text]);

  const cleanup = () => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    setCurrentWordIndex(-1);
    currentIndexRef.current = -1;
  };

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    cleanup();
  };

  const play = () => {
    if (!isSupported || !text) {
      console.warn("Speech synthesis not supported or text is empty");
      return;
    }

    // Stop any ongoing speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to get Bengali voice, fallback to any available
    const voices = window.speechSynthesis.getVoices();
    const bengaliVoice = voices.find(
      (voice) => voice.lang.includes("bn") || voice.lang.includes("Bengali")
    );

    if (bengaliVoice) {
      utterance.voice = bengaliVoice;
    }

    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentWordIndex(0);
      currentIndexRef.current = 0;
      startTimeRef.current = Date.now();

      // Calculate average word duration based on speech rate
      const totalWords = words.length;
      const estimatedDuration = (text.length / (rate * 15)) * 1000; // Rough estimate
      const avgWordDuration = estimatedDuration / totalWords;

      // Highlight words progressively
      let index = 0;
      wordTimerRef.current = setInterval(() => {
        if (index < words.length) {
          setCurrentWordIndex(index);
          currentIndexRef.current = index;
          index++;
        } else {
          if (wordTimerRef.current) {
            clearInterval(wordTimerRef.current);
            wordTimerRef.current = null;
          }
        }
      }, avgWordDuration);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      cleanup();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
      cleanup();
    };

    utterance.onpause = () => {
      setIsPaused(true);
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
        wordTimerRef.current = null;
      }
    };

    utterance.onresume = () => {
      setIsPaused(false);
      // Resume word highlighting from current position
      const remainingWords = words.length - currentIndexRef.current;
      if (remainingWords > 0) {
        const totalWords = words.length;
        const estimatedDuration = (text.length / (rate * 15)) * 1000;
        const avgWordDuration = estimatedDuration / totalWords;

        let index = currentIndexRef.current;
        wordTimerRef.current = setInterval(() => {
          if (index < words.length) {
            setCurrentWordIndex(index);
            currentIndexRef.current = index;
            index++;
          } else {
            if (wordTimerRef.current) {
              clearInterval(wordTimerRef.current);
              wordTimerRef.current = null;
            }
          }
        }, avgWordDuration);
      }
    };

    // Load voices if not already loaded
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        const bengaliVoice = updatedVoices.find(
          (voice) => voice.lang.includes("bn") || voice.lang.includes("Bengali")
        );
        if (bengaliVoice && utterance) {
          utterance.voice = bengaliVoice;
        }
      };
    }

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (isSupported && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
        wordTimerRef.current = null;
      }
    }
  };

  const resume = () => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isPlaying,
    isPaused,
    currentWordIndex,
    words,
    play,
    pause,
    resume,
    stop,
    isSupported,
  };
}

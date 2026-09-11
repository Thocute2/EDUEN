/**
 * Audio playback and Text-to-Speech service
 * Uses API audio when available, falling back to the browser's native Web Speech API.
 */

class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Stop any current speech or audio playback
   */
  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Play pronunciation for a word or phrase
   */
  public play(
    text: string,
    audioUrl?: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      this.stop();

      // Case 1: Valid Audio URL available from Dictionary API
      if (audioUrl && audioUrl.trim().length > 0) {
        try {
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;

          audio.onplay = () => onStart?.();
          audio.onended = () => {
            onEnd?.();
            resolve();
          };
          audio.onerror = () => {
            // If audio file fails to load/play, fallback to Web Speech API
            this.fallbackSpeak(text, onStart, onEnd, resolve);
          };

          audio.play().catch(() => {
            this.fallbackSpeak(text, onStart, onEnd, resolve);
          });
          return;
        } catch {
          this.fallbackSpeak(text, onStart, onEnd, resolve);
          return;
        }
      }

      // Case 2: Fallback to Web Speech API
      this.fallbackSpeak(text, onStart, onEnd, resolve);
    });
  }

  private fallbackSpeak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    resolve?: () => void
  ): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      resolve?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92; // Slightly natural professional pacing

    // Try to pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      onEnd?.();
      resolve?.();
    };
    utterance.onerror = () => {
      onEnd?.();
      resolve?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechService = new SpeechService();

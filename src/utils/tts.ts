/**
 * Utility to make the client browser synthesize speech in EastAsian languages natively
 */
export function playNativeText(text: string, langCode: 'zh' | 'ja' | 'ko' | 'en', rate: number = 0.8) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this client browser environment.");
    return;
  }

  // Cancel any running voices instantly
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Set appropriate locale voice code
  switch (langCode) {
    case 'zh':
      utterance.lang = 'zh-CN';
      break;
    case 'ja':
      utterance.lang = 'ja-JP';
      break;
    case 'ko':
      utterance.lang = 'ko-KR';
      break;
    case 'en':
      utterance.lang = 'en-US';
      break;
    default:
      utterance.lang = 'en-US';
  }

  // Adjust vocal factors to match learner convenience
  utterance.pitch = 1.0;
  utterance.rate = rate; // Speak slow/medium/fast based on learner's selection

  // Find native speakers in system voices
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(utterance.lang.toLowerCase()));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

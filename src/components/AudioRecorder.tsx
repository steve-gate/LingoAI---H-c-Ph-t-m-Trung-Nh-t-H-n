import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, AlertCircle, Upload, Globe, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string, audioUrl: string) => void;
  langCode: 'zh' | 'ja' | 'ko' | 'en';
}

export default function AudioRecorder({ onRecordingComplete, langCode }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [useNoiseSuppression, setUseNoiseSuppression] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clear states when language or phrase changes
  useEffect(() => {
    return () => {
      stopRecordingAndCleanup();
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
      }
    };
  }, [langCode]);

  const stopRecordingAndCleanup = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    setError(null);
    setAudioUrl(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ thu âm từ micro hoặc bị chặn quyền trong iFrame.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: useNoiseSuppression,
          echoCancellation: useNoiseSuppression,
          autoGainControl: true
        } 
      });
      
      // Determine supported mime-type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Let browser choose standard format
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        try {
          // Convert audio to Base64 to send to server
          const base64 = await blobToBase64(audioBlob);
          onRecordingComplete(base64, url);
        } catch (err: any) {
          setError("Lỗi xử lý tệp ghi âm: " + err.message);
        }

        // Close mic tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 15) { // Limit recording to 15 seconds max
            stopRecordingAndCleanup();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.warn("[Lưu ý Ghi âm] Thiết bị chưa sẵn sàng hoặc bị chặn:", err.message || err);
      let errorMsg = "Không thể kết nối Micro: " + (err.message || "");
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = "Trình duyệt chặn cấp quyền sử dụng Micro. Hãy bấm nút mở tab mới góc trên cùng bên phải để chạy trực tiếp ứng dụng ngoài iFrame!";
      } else if (err.name === 'NotFoundError' || err.message?.includes('device not found') || err.message?.includes('Requested device not found')) {
        errorMsg = "Không tìm thấy thiết bị thu âm (Microphone). Bạn có thể tự mở tệp âm thanh ở khu vực bên dưới, hoặc bấm nút 'Mô phỏng Giọng AI 🌟' để rèn luyện thử nghiệm!";
      }
      setError(errorMsg);
    }
  };

  const stopRecording = () => {
    stopRecordingAndCleanup();
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (isPlayingBack) {
      playbackAudioRef.current?.pause();
      setIsPlayingBack(false);
    } else {
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      playbackAudioRef.current = audio;
      audio.play();
      setIsPlayingBack(true);

      audio.onended = () => {
        setIsPlayingBack(false);
      };
    }
  };

  const resetAudio = () => {
    setAudioUrl(null);
    setIsPlayingBack(false);
    setRecordingTime(0);
    setError(null);
  };

  // Process manual upload files
  const processAudioFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError("Vui lòng tải lên tài liệu định dạng âm thanh (.mp3, .wav, .m4a, .webm, .ogg)!");
      return;
    }
    setError(null);
    setAudioUrl(null);

    try {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);

      // Convert file into base64 to send to server evaluator
      const base64 = await blobToBase64(file);
      onRecordingComplete(base64, url);
    } catch (err: any) {
      setError("Hệ thống lỗi đọc tệp âm thanh: " + err.message);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAudioFile(e.target.files[0]);
    }
  };

  // Drag and drop events logic
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // High quality simulation demo handler for evaluation mode
  const handleSimulationMode = async () => {
    setError(null);
    setAudioUrl("simulated"); // Dummy url string

    // Create a 1-second muted silent/synthesized small WAV blob
    const sampleRate = 8000;
    const duration = 0.5;
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    /* Write WAV Header */
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const base64 = await blobToBase64(blob);
    onRecordingComplete(base64, url);
  };

  return (
    <div id="audio-recorder-module" className="flex flex-col items-center justify-center p-4 w-full">
      {error && (
        <div id="recorder-error" className="flex flex-col gap-2 text-rose-600 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs text-left w-full">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
          <div className="flex gap-2.5 mt-2 pt-2 border-t border-rose-200/40">
            <a 
              href={window.location.href} 
              target="_blank" 
              rel="noreferrer"
              className="px-2.5 py-1 bg-white text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100/50 shadow-xs transition inline-flex items-center gap-1 font-bold"
            >
              <Globe className="w-3 h-3" /> Mở Tab Riêng
            </a>
            <button 
              onClick={handleSimulationMode}
              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 shadow-xs transition font-bold"
            >
              Mô phỏng Giọng AI 🌟
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 w-full">
        <AnimatePresence mode="wait">
          {!audioUrl ? (
            <motion.div
              key="recording-controls"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              {isRecording ? (
                <div className="flex flex-col items-center gap-2">
                  {/* Live recording visual waves */}
                  <div className="flex items-end justify-center gap-1 h-10 w-40 px-3 py-1">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-rose-500 rounded-full"
                        animate={{
                          height: [12, Math.floor(Math.random() * 28) + 12, 12]
                        }}
                        transition={{
                          duration: 0.5 + i * 0.05,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  <span className="text-sm font-mono text-rose-600 font-medium animate-pulse">
                    Đang ghi âm... {recordingTime}s / 15s
                  </span>

                  <button
                    id="stop-rec-btn"
                    onClick={stopRecording}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-500 text-white hover:bg-rose-600 focus:outline-none shadow-lg transition"
                  >
                    <Square className="w-6 h-6 fill-white" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-5 justify-center w-full">
                  {/* 1. Mic Button */}
                  <div className="flex flex-col items-center gap-2 bg-indigo-50/10 border border-indigo-100/30 p-4 rounded-3xl w-full sm:w-1/2">
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">
                      Cực kỳ chuẩn xác bằng Microphone
                    </span>
                    
                    <button
                      id="start-rec-btn"
                      onClick={startRecording}
                      className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 focus:outline-none shadow-lg transition-all"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <span className="text-[10px] text-indigo-600/70 font-semibold mt-1">Cần cấp quyền Micro</span>
                    <button
                      onClick={() => setUseNoiseSuppression(!useNoiseSuppression)}
                      className={`mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border transition-colors ${
                        useNoiseSuppression 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Bật/tắt chế độ lọc tạp âm và chống vang bằng AI"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${useNoiseSuppression ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {useNoiseSuppression ? 'Đang lọc tạp âm' : 'Tắt lọc tạp âm'}
                    </button>
                  </div>

                  {/* 2. Drag & Drop File Zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerUploadClick}
                    className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-3xl border-2 border-dashed transition-all cursor-pointer w-full sm:w-1/2 min-h-[140px] ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50/40' 
                        : 'border-slate-200 hover:border-indigo-400 bg-slate-50/40 hover:bg-white'
                    }`}
                  >
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-600 animate-bounce' : 'text-slate-400'}`} />
                    <span className="text-[11px] text-slate-700 font-extrabold">Tải lên tệp phát âm</span>
                    <span className="text-[9.5px] text-slate-400 text-center leading-normal px-2">
                      Kéo thả hoặc Duyệt tệp âm thanh (.mp3, .wav, .m4a)
                    </span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept="audio/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="playback-controls"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-3.5 rounded-3xl shadow-xs"
            >
              {audioUrl !== 'simulated' ? (
                <button
                  id="playback-btn"
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-extrabold text-xs focus:outline-none transition"
                >
                  {isPlayingBack ? (
                    <>
                      <Pause className="w-4 h-4 fill-indigo-700 shrink-0" /> Dừng
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-indigo-700 shrink-0" /> Nghe lại giọng mình
                    </>
                  )}
                </button>
              ) : (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full font-bold">
                  🌟 Đang luyện bằng mô phỏng AI
                </span>
              )}

              <div className="hidden sm:block h-5 w-[1px] bg-slate-200" />

              <button
                id="recorder-reset-btn"
                onClick={resetAudio}
                className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-bold text-xs focus:outline-none transition"
                title="Luyện nói lại"
              >
                <RefreshCw className="w-4 h-4 shrink-0" /> Thử Lại Lượt Mới
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

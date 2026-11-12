import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, AlertCircle, RefreshCw, Radio } from 'lucide-react';

interface GeminiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatbot?: () => void;
}

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onOpenChatbot
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: 'مرحباً بك! أنا مساعد دكتورك الصوتي المباشر المدعوم بـ Gemini Live. تفضل بالحديث واطرح أي استفسار طبي أو عن كيفية الحجز وسأجيبك فوراً.',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [statusText, setStatusText] = useState('جاهز للاستماع');
  const [errorText, setErrorText] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Suggested voice prompts
  const SUGGESTIONS = [
    'عندي ألم في المعدة بعد الأكل، أحجز عند مين؟',
    'ما هي شروط الصيام لتحليل السكر التراكمي؟',
    'طفلي يعاني من حرارة مرتفعة منذ الصباح',
    'كيف أرفع صورة تحليل أو روشتة في حسابي؟',
  ];

  // Helper to speak response in Arabic
  const speakText = (text: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Handle server communication
  const sendQueryToServer = async (userVoiceText: string) => {
    setStatusText('جارٍ التفكير الطبي الذكي...');
    setIsSpeaking(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userVoiceText,
          messages: transcript.map((t) => ({
            role: t.role,
            text: t.text,
          })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'عذراً، لم أستطع تكوين إجابة حالياً، هل يمكنك تكرار السؤال؟';

      setTranscript((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setStatusText('يتحدث الآن...');
      speakText(reply);
    } catch (err: any) {
      console.error('Voice query error:', err);
      const fallback = 'أهلاً بك! مساعد دكتورك يعمل على مدار الساعة. ننصح دائماً بحجز موعد مع الطبيب المختص لفحص حالتك بدقة.';
      setTranscript((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallback,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakText(fallback);
    } finally {
      setTimeout(() => {
        if (!isListening) {
          setStatusText('جاهز للاستماع');
        }
      }, 1500);
    }
  };

  // Initialize Speech Recognition
  const startListening = () => {
    setErrorText('');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorText('متصفحك لا يدعم التعرف على الصوت المباشر عبر الميكروفون. يمكنك كتابة استفسارك في المحادثة النصية.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('يستمع إليك الآن... تحدث بوضوح');
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const speechText = lastResult[0].transcript;

        if (lastResult.isFinal) {
          setIsListening(false);
          setTranscript((prev) => [
            ...prev,
            {
              role: 'user',
              text: speechText,
              time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          sendQueryToServer(speechText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        setStatusText('توقف الاستماع');
        if (event.error !== 'no-speech') {
          setErrorText('حدث خطأ في استقبال الصوت، يرجى التأكد من صلاحية الميكروفون.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Error starting voice recognition:', err);
      setIsListening(false);
      setErrorText('تعذر تشغيل الميكروفون. يرجى السماح للتطبيق باستخدام الميكروفون.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatusText('تم إيقاف الاستماع');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Setup WebSocket connection to Gemini Live when modal is opened
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsListening(false);
      setIsSpeaking(false);
      return;
    }

    setIsConnected(true);
    setStatusText('جاهز للاستماع • اضغط على الميكروفون وتحدث');

    // Attempt connecting to Live WebSocket
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/gemini/live`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Live Voice] Connected to Gemini Live API');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'text' && data.text) {
            setTranscript((prev) => [
              ...prev,
              {
                role: 'assistant',
                text: data.text,
                time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            speakText(data.text);
          }
        } catch {
          // ignore
        }
      };

      ws.onerror = () => {
        console.warn('[Live Voice] WebSocket live fallback active');
      };

      wsRef.current = ws;
    } catch (e) {
      console.warn('WS Init notice:', e);
    }

    return () => {
      window.speechSynthesis?.cancel();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-500/30 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0f2a44] via-teal-900 to-[#0f2a44] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl">
                  المحادثة الصوتية المباشرة (Gemini Live)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Live API
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                تحدث صوتياً واحصل على توجيه فوري للتخصصات الطبية والفحوصات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title={isAudioMuted ? 'إلغاء كتم الصوت' : 'كتم الردود الصوتية'}
            >
              {isAudioMuted ? <VolumeX className="w-5 h-5 text-rose-300" /> : <Volume2 className="w-5 h-5 text-teal-300" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Visualizer Central Stage */}
        <div className="p-6 bg-gradient-to-b from-teal-950/20 to-transparent flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800 shrink-0">
          
          {/* Animated Glowing Mic Circle */}
          <div className="relative flex items-center justify-center my-3">
            {/* Outer Soundwave Rings */}
            {(isListening || isSpeaking) && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-teal-500/20 animate-ping" />
                <div className="absolute w-44 h-44 rounded-full bg-cyan-500/10 animate-pulse" />
              </>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white scale-105 shadow-rose-500/40'
                  : isSpeaking
                  ? 'bg-gradient-to-br from-amber-500 to-teal-500 text-white scale-105 shadow-teal-500/40'
                  : 'bg-gradient-to-br from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white shadow-teal-600/30'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-10 h-10 animate-bounce" />
                  <span className="text-[10px] font-bold mt-1">يستمع...</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10" />
                  <span className="text-[10px] font-bold mt-1">اضغط للتحدث</span>
                </>
              )}
            </button>
          </div>

          {/* Sound Bars Visualizer Simulation */}
          <div className="flex items-center gap-1.5 h-8 my-2">
            {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 80, 50].map((h, idx) => (
              <span
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-rose-500 animate-pulse'
                    : isSpeaking
                    ? 'bg-teal-400 animate-pulse'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{
                  height: (isListening || isSpeaking) ? `${Math.max(12, Math.round(h * Math.random()))}px` : '6px',
                }}
              />
            ))}
          </div>

          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {statusText}
          </p>

          {errorText && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
            نماذج أسئلة صوتية سريعة (اضغط للتجربة الفورية):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript((prev) => [
                    ...prev,
                    {
                      role: 'user',
                      text: q,
                      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                  sendQueryToServer(q);
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Live Conversation Transcript Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-[200px]">
          {transcript.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-800 dark:bg-teal-900/40 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {isUser ? 'أنت' : 'دكتورك'}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 opacity-70 ${isUser ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Switch to Chatbot & Medical Disclaimer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>إرشادات طبية وتوجيهية استرشادية، لا تغني عن فحص الطبيب المعالج.</span>
          </div>

          {onOpenChatbot && (
            <button
              onClick={() => {
                onClose();
                onOpenChatbot();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>الانتقال للمحادثة الكتابية</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

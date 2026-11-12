import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System instruction for Egyptian medical platform assistant
const MEDICAL_SYSTEM_INSTRUCTION = `
أنت "المستشار الطبي الذكي" و"مساعد دكتورك الصوتي" التابع لتطبيق (احجز عند دكتورك) في مصر.
مهامك الرئيسية:
1. الإجابة عن استفسارات المرضى بأسلوب ودود، مطمئن، واحترافي باللغة العربية (فصحى مبسطة أو لهجة مصرية مهذبة).
2. مساعدة المريض في فهم الأعراض الشائعة وتوجيهه للتخصص الطبي الأنسب للحجز (مثل: باطنة، أطفال، عظام، جلدية، نساء وتوليد، أسنان، أنف وأذن، قلب، معامل تحاليل).
3. شرح الفحوصات والتحاليل الطبية الشائعة وإرشاداتها (مثل شروط الصيام لتحاليل السكر والدهون، أهمية صورة الدم الكاملة CBC، إلخ).
4. مساعدة المريض في كيفية استخدام التطبيق وحجز الأطباء والمعامل وإدارة الروشتات والسجل الطبي.
5. التذكير والتأكيد دائماً بأن جميع الإرشادات استرشادية فقط ولا تغني عن استشارة وفحص الطبيب المختص أو زيارة الطوارئ في الحالات الحرجة.
`;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Multi-Turn Text Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages = [], message = '' } = req.body;

    if (!message && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    if (!ai) {
      return res.json({
        reply:
          'أهلاً بك في منصة (احجز عند دكتورك)! أنا مساعدك الطبي الذكي. يرجى التأكد من إضافة مفتاح Gemini API في إعدادات التطبيق لتفعيل الذكاء الاصطناعي بشكل كامل. في هذه الأثناء، يمكنك تصفح العيادات والمعامل وحجز موعدك مباشرة من القائمة أدناه.',
      });
    }

    // Build contents array formatted for @google/genai
    const contents: any[] = [];
    for (const msg of messages) {
      if (msg.role && msg.text) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    if (message && (!contents.length || contents[contents.length - 1].parts[0].text !== message)) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text || 'عذراً، لم أستطع تكوين إجابة حالياً. هل ترغب في إعادة صياغة السؤال؟',
    });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({
      error: err.message || 'حدث خطأ أثناء معالجة المحادثة الطبية الذكية',
    });
  }
});

// WebSocket Server for Gemini Live API (gemini-3.8-live)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Gemini Live] Client connected to live voice socket');

  if (!ai) {
    clientWs.send(
      JSON.stringify({
        text: 'مرحباً بك! خدمة المحادثة الصوتية جاهزة للمعاينة، يرجى ربط مفتاح Gemini API لتفعيل الصوت المباشر.',
        status: 'no_api_key',
      })
    );
    return;
  }

  let liveSession: any = null;

  try {
    liveSession = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          try {
            // Forward audio parts to client
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    audio: part.inlineData.data,
                  })
                );
              }
              if (part.text) {
                clientWs.send(
                  JSON.stringify({
                    type: 'text',
                    text: part.text,
                  })
                );
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
          } catch (sendErr) {
            console.error('[Gemini Live] Send error:', sendErr);
          }
        },
        onclose: () => {
          console.log('[Gemini Live] Live session closed by server');
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'مساعد دكتورك الصوتي متصل ومستعد للاستماع' }));

    clientWs.on('message', (rawData) => {
      try {
        const payload = JSON.parse(rawData.toString());
        if (payload.type === 'audio' && payload.audio) {
          liveSession.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.type === 'text' && payload.text) {
          liveSession.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (procErr) {
        console.error('[Gemini Live] Error forwarding input:', procErr);
      }
    });

    clientWs.on('close', () => {
      console.log('[Gemini Live] Client disconnected');
      try {
        if (liveSession && typeof liveSession.close === 'function') {
          liveSession.close();
        }
      } catch (cErr) {
        // ignore
      }
    });
  } catch (connErr: any) {
    console.error('[Gemini Live] Connection error:', connErr);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        error: connErr.message || 'تعذر بدء جلسة المحادثة الصوتية المباشرة',
      })
    );
  }
});

// Upgrade HTTP server to WebSocket for /api/gemini/live
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/api/gemini/live' || pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Vite middleware integration for full-stack SPA
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[Server] App running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

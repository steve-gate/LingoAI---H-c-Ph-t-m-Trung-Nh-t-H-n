import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const defaultAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function getAiClient(req: express.Request) {
  const customKey = req.headers['x-gemini-api-key'];
  if (customKey && typeof customKey === 'string') {
    return new GoogleGenAI({
      apiKey: customKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return defaultAi;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set higher size limit for client voice recordings (base64)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API 0: Test Custom API Key
  app.post("/api/test-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) return res.status(400).json({ error: "Missing API key" });
      
      const testAi = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const response = await testAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Reply with the word OK",
      });
      
      res.json({ success: true, response: response.text() });
    } catch (error: any) {
      console.error("API Key Test Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API 1: Evaluate pronunciation of user-submitted audio
  app.post("/api/evaluate", async (req, res) => {
    try {
      const ai = getAiClient(req);
      const { audio, phrase, language, pinyin } = req.body;
      if (!audio || !phrase || !language) {
        return res.status(400).json({ error: "Missing required parameters (audio, phrase, language)" });
      }

      let base64Data = audio;
      let mimeType = "audio/webm"; // Default fallback

      // Extract raw base64 data and mimeType if inside a Data URL format
      const matches = audio.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      console.log(`Evaluating pronunciation for phrase: "${phrase}" in language: ${language}, MimeType: ${mimeType}`);

      const systemInstruction = `Bạn là một chuyên gia ngôn ngữ học bản xứ xuất sắc và huấn luyện viên dạy phát âm tiếng Á Đông (Tiếng Trung, Tiếng Nhật, Tiếng Hàn) và Tiếng Anh dành cho học viên Việt Nam.
Nhiệm vụ của bạn là lắng nghe âm thanh ghi âm của người dùng, so sánh nó với cụm từ mục tiêu gốc, và phân tích phản hồi cực kỳ chi tiết bằng tiếng Việt.

Bạn CẦN chấm điểm và sinh dữ liệu đầy đủ cho các tính năng cao cấp sau:
1. FORCED ALIGNMENT (Đồng bộ thời gian): Với mỗi âm tiết (syllable) hoặc mỗi từ (word), hãy ước tính tương đối thời điểm phát âm bắt đầu và kết thúc trong tệp âm thanh (theo mili-giây, ví dụ: 200ms đến 650ms).
2. PHONEME SCORING (Điểm ngữ âm): Phân tích chi tiết từng âm tiết/từ thành các âm vị (consonant - phụ âm đầu, vowel - nguyên âm, tone - thanh điệu, hoặc padchim - phụ âm cuối) kèm theo điểm số từ 0 đến 100 riêng biệt.
3. CHINESE TONE SCORING (Thanh điệu tiếng Trung - zh): Cung cấp expectedTone (1,2,3,4 hoặc 5 cho khinh thanh) và actualTone cùng mảng 5 số biểu thị đường biểu diễn cao độ nhạc lý dự đoán (contourExpected và contourActual), ví dụ: thanh 1 là [5,5,5,5,5], thanh 4 là [5,4,3,2,1], thanh 2 là [3,3,4,4,5], thanh 3 là [2,1,1,2,4].
4. JAPANESE PITCH ACCENT (Ngữ điệu trầm bổng tiếng Nhật - ja): Nếu là tiếng Nhật, hãy phân tích từ vựng xem thuộc loại cấu trúc nào (Heiban, Atamadaka, Nakadaka, Odaka) và một mảng ký tự ['H', 'L', ...] chỉ rõ âm tiết nào cao (High) hay thấp (Low).
5. GAMIFICATION REWARDS (Hệ thống phần thưởng): Tính toán số điểm kinh nghiệm (xpEarned, thường từ 15 đến 45XP tùy vào điểm phát âm) và cấp phần thưởng danh hiệu bất ngờ nếu đạt điểm xuất sắc (ví dụ: "Phá băng thanh điệu", "Phát âm chuẩn Seoul").

Trả về kết quả ở định dạng JSON chuẩn xác theo cấu trúc sau:
{
  "overallScore": <number 0-100>,
  "accuracyScore": <number 0-100>,
  "intonationScore": <number 0-100>,
  "fluencyScore": <number 0-100>,
  "feedback": "<Tóm tắt nhận xét tổng thể phát âm bằng tiếng Việt ngắn gọn, động viên người học>",
  "syllableFeedback": [
    {
      "syllable": "<từng ký tự chữ cái/chữ Hán/Hiragana/Hangul/Từ tiếng Anh, ví dụ: '你' hoặc 'Nice'>",
      "phonetic": "<phiên âm đọc tương ứng, ví dụ: 'nǐ' hoặc 'naɪs'>",
      "score": <number 0-100>,
      "isCorrect": <boolean>,
      "issue": "<lỗi phát âm cụ thể hoặc lỗi thanh điệu, nếu phát âm tốt ghi trống ''>",
      "correction": "<mẹo điều chỉnh khẩu hình hoặc vị trí lưỡi bằng tiếng Việt để phát âm chuẩn xác, ví dụ: 'Mím chặt môi nhẹ rồi bật hơi bật âm t ở cuối'>",
      "startTimeMs": <number, thời gian bắt đầu tương đối tính bằng mili-giây, ví dụ: 240>,
      "endTimeMs": <number, thời gian kết thúc tương đối tính bằng mili-giây, ví dụ: 780>,
      "phonemes": [
        { "phoneme": "<ký tự âm vị, ví dụ: 'n'>", "score": <number 0-100>, "type": "consonant" },
        { "phoneme": "<ví dụ: 'i'>", "score": <number 0-100>, "type": "vowel" },
        { "phoneme": "<ví dụ: 'Thanh 3'>", "score": <number 0-100>, "type": "tone" }
      ],
      "chineseTone": {
        "expectedTone": "1",
        "actualTone": "1",
        "contourExpected": [3, 2, 1, 3, 5],
        "contourActual": [3, 2, 1, 2, 4],
        "description": "<mô tả bằng tiếng Việt, ví dụ: 'Thanh 3 đi xuống sâu rồi móc nhẹ lên ở đuôi'>"
      }
    }
  ],
  "improvedTips": "<Lời khuyên khắc phục nhược điểm cốt lõi và hướng dẫn luyện tập tiếp theo chuẩn xác bằng tiếng Việt>",
  "xpEarned": <number, điểm kinh nghiệm thưởng thêm từ 15 đến 50>,
  "achievementsAwarded": [
    {
      "id": "<id ví dụ: tone-master>",
      "title": "<Danh hiệu lý thú, ví dụ: 'Kẻ hủy diệt Thanh 4'>",
      "description": "<Mô tả vui tươi bằng tiếng Việt>",
      "icon": "<Tên icon viết hoa kiểu emoji, ví dụ: '🌟' hoặc '🔥'>"
    }
  ],
  "japanesePitchAccent": {
    "patternType": "Heiban",
    "contourExpected": ["L", "H", "H"],
    "contourActual": ["L", "H", "L"],
    "description": "Từ này có cao độ dâng cao ở âm tiết thứ hai và kéo bằng phẳng."
  }
}`;

      const textPart = `Hãy lắng nghe và phân tích tệp âm thanh ghi âm giọng nói của học viên Việt Nam dưới đây đối chiếu với cụm từ mục tiêu:
Cụm từ gốc (NativeText): "${phrase}"
Phân loại Ngôn ngữ (Language): ${language} (Mã code: zh = Trung, ja = Nhật, ko = Hàn, en = Anh)
Phiên âm gợi ý (Phonetic Guide): "${pinyin || ""}"

Hãy thực hiện đánh giá giọng nói này một cách nghiêm khắc nhưng xây dựng, sau đó xuất ra phản hồi JSON hoàn thiện khớp với Schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: textPart
          }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              accuracyScore: { type: Type.INTEGER },
              intonationScore: { type: Type.INTEGER },
              fluencyScore: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              syllableFeedback: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    syllable: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    isCorrect: { type: Type.BOOLEAN },
                    issue: { type: Type.STRING },
                    correction: { type: Type.STRING },
                    startTimeMs: { type: Type.INTEGER },
                    endTimeMs: { type: Type.INTEGER },
                    phonemes: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          phoneme: { type: Type.STRING },
                          score: { type: Type.INTEGER },
                          type: { type: Type.STRING }
                        },
                        required: ["phoneme", "score", "type"]
                      }
                    },
                    chineseTone: {
                      type: Type.OBJECT,
                      properties: {
                        expectedTone: { type: Type.STRING },
                        actualTone: { type: Type.STRING },
                        contourExpected: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        contourActual: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        description: { type: Type.STRING }
                      },
                      required: ["expectedTone", "actualTone", "contourExpected", "contourActual", "description"]
                    }
                  },
                  required: ["syllable", "phonetic", "score", "isCorrect", "issue", "correction", "startTimeMs", "endTimeMs"]
                }
              },
              improvedTips: { type: Type.STRING },
              xpEarned: { type: Type.INTEGER },
              achievementsAwarded: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    icon: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "icon"]
                }
              },
              japanesePitchAccent: {
                type: Type.OBJECT,
                properties: {
                  patternType: { type: Type.STRING },
                  contourExpected: { type: Type.ARRAY, items: { type: Type.STRING } },
                  contourActual: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING }
                },
                required: ["patternType", "contourExpected", "description"]
              }
            },
            required: ["overallScore", "accuracyScore", "intonationScore", "fluencyScore", "feedback", "syllableFeedback", "improvedTips", "xpEarned"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không nhận được dữ liệu phản hồi từ mô hình AI.");
      }

      const result = JSON.parse(responseText);
      res.json(result);

    } catch (error: any) {
      console.error("Lỗi đánh giá phát âm phía server:", error);
      res.status(500).json({ error: "Có lỗi xảy ra khi phân tích phát âm qua AI: " + error.message });
    }
  });

  // API 2: Generate personalized roadmap
  app.post("/api/roadmap", async (req, res) => {
    try {
      const ai = getAiClient(req);
      const { language, level, goal } = req.body;
      if (!language || !level || !goal) {
        return res.status(400).json({ error: "Missing required parameters (language, level, goal)" });
      }

      console.log(`Generating roadmap for language: ${language}, level: ${level}, goal: ${goal}`);

      const systemInstruction = `Bạn là một nhà biên soạn giáo án ngôn ngữ Á Đông và Tiếng Anh xuất sắc.
Nhiệm vụ của bạn là thiết kế một lộ trình học tập và luyện phát âm cá nhân hóa kéo dài đúng 5 ngày dựa trên các tham số được cung cấp bằng tiếng Việt.

Thông số đầu vào:
- Ngôn ngữ: ${language} (zh = Tiếng Trung, ja = Tiếng Nhật, ko = Tiếng Hàn, en = Tiếng Anh)
- Trình độ: ${level} (Moi_Bat_Dau = Mới bắt đầu, Trung_Cap = Trung cấp, Nang_Cao = Nâng cao)
- Mục tiêu: ${goal} (Giao_Tiep_Hang_Ngay = Giao tiếp hàng ngày, Cong_Viec_Thuong_Mai = Công việc thương mại, Du_Lich_Kham_Pha = Du lịch khám phá, Khao_Thi_Chung_Chi = Khảo thí / Thi chứng chỉ như HSK/JLPT/TOPIK/IELTS/TOEIC)

Yêu cầu cụ thể của lộ trình:
- Lộ trình phải gồm 5 ngày (Day 1 đến Day 5).
- Mỗi ngày tập trung vào một chủ đề thiết thực, cung cấp 3 từ hoặc cụm từ thực tiễn để học viên luyện nghe dịch và thực hành luyện phát âm AI.
- Mẹo ngữ cảnh (contextTip) hữu ích cho học sinh Việt Nam khi phát âm hoặc giao tế.

Bạn phải phản hồi đúng cấu trúc JSON sau:
{
  "language": "<tên tiếng Việt đầy đủ, ví dụ: Tiếng Trung Quốc hoặc Tiếng Anh>",
  "targetLanguageCode": "<mã ngôn ngữ: zh, ja, ko, en>",
  "level": "<trình độ tiếng Việt tương thích>",
  "goal": "<mục tiêu tiếng Việt tương thích>",
  "title": "<Tiêu đề lộ trình hấp dẫn, truyền động lực lôi cuốn thiết kế riêng cho người Việt>",
  "summary": "<Tóm tắt mục tiêu đạt được sau 5 ngày học đầy nhiệt huyết>",
  "days": [
    {
      "dayNumber": <number 1-5>,
      "topic": "<Chủ đề của ngày, ví dụ: Chào hỏi công sở>",
      "description": "<mô tả tóm tắt nội dung ngày học>",
      "lessons": [
        {
          "id": "<id tự sinh duy nhất ví dụ: d1-l1>",
          "title": "<Tên bài học hoặc tựa đề từ/cụm từ, ví dụ: 'Xin vui lòng giúp đỡ'>",
          "type": "<loại bài học: 'vocabulary' hoặc 'phrase'>",
          "nativeText": "<Từ vựng/Câu gốc tiếng bản xứ, ví dụ: 'Nice to meet you'>",
          "phonetic": "<Phiên âm đọc chuẩn xác: pinyin cho Trung, romaji cho Nhật, romanization cho Hàn, phiên âm quốc tế IPA cho Anh, ví dụ: 'naɪs tu miːt juː'>",
          "translation": "<Dịch nghĩa tiếng Việt tự nhiên chuẩn xác>",
          "contextTip": "<Mẹo phát âm hoặc lưu ý văn hóa hay cho câu nói này>"
        }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hãy sinh lộ trình học tiếng ${language === 'zh' ? 'Trung' : language === 'ja' ? 'Nhật' : language === 'ko' ? 'Hàn' : 'Anh'} cấp độ ${level} mục tiêu ${goal} và trả về đúng định dạng JSON được quy định tự động.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              targetLanguageCode: { type: Type.STRING },
              level: { type: Type.STRING },
              goal: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    topic: { type: Type.STRING },
                    description: { type: Type.STRING },
                    lessons: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          type: { type: Type.STRING },
                          nativeText: { type: Type.STRING },
                          phonetic: { type: Type.STRING },
                          translation: { type: Type.STRING },
                          contextTip: { type: Type.STRING }
                        },
                        required: ["id", "title", "type", "nativeText", "phonetic", "translation", "contextTip"]
                      }
                    }
                  },
                  required: ["dayNumber", "topic", "description", "lessons"]
                }
              }
            },
            required: ["language", "targetLanguageCode", "level", "goal", "title", "summary", "days"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không nhận được phản hồi lộ trình học từ Gemini.");
      }

      const result = JSON.parse(responseText);
      res.json(result);

    } catch (error: any) {
      console.error("Lỗi tạo lộ trình phía server:", error);
      res.status(500).json({ error: "Có lỗi xảy ra khi tạo lộ trình học tập: " + error.message });
    }
  });

  // API 3: AI Scenario Roleplay Chat Conversation partner
  app.post("/api/chat", async (req, res) => {
    try {
      const ai = getAiClient(req);
      const { language, scenario, message, history } = req.body;
      if (!language || !scenario || !message) {
        return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc (language, scenario, message)" });
      }

      console.log(`AI Chat Roleplay: scenario=${scenario}, lang=${language}`);

      const systemInstruction = `Bạn là một trợ lý ảo bản ngữ và giáo viên dạy phản xạ ngoại ngữ xuất sắc (Tiếng Trung, Tiếng Nhật, Tiếng Hàn, Tiếng Anh) dành cho học viên Việt Nam.
Nhiệm vụ của bạn là nhập vai giao tiếp trong ngữ cảnh được cung cấp:
- Ngữ cảnh giao tiếp (scenario): "${scenario}" (như 'restaurant': nhà hàng, 'hotel': khách sạn, 'airport': sân bay, 'cafe': quán cà phê)
- Ngôn ngữ chính (language): "${language}" (zh = Tiếng Trung, ja = Tiếng Nhật, ko = Tiếng Hàn, en = Tiếng Anh)

Hãy trả lời tin nhắn mới nhất của người dùng chuẩn văn phong giao tiếp bản xứ của ngữ cảnh đó.
Bạn cần phản hồi bằng định dạng JSON bao gồm:
1. "replyText": Lời hồi đáp bằng ngôn ngữ gốc dứt khoát tự nhiên.
2. "pinyin": Phiên âm Latinh đọc đầy đủ (Pinyin cho Trung, Romaji cho Nhật, Romanization cho Hàn, phiên âm IPA cho Anh).
3. "translation": Bản dịch tiếng Việt tự nhiên và trôi chảy nhất.
4. "feedback": Nhận xét hoặc lời khuyên phát âm, văn cảnh ngắn gọn bằng tiếng Việt giúp học viên giao tiếp tốt hơn từ chính câu nói của họ.

Lịch sử trò chuyện trước đó để bạn nắm thông tin mạch giao tiếp:
${JSON.stringify(history || [])}

Bạn phải phản hồi đúng cấu trúc JSON sau:
{
  "replyText": "<hồi đáp bản xứ>",
  "pinyin": "<phiên âm đọc tương ứng>",
  "translation": "<bản dịch tiếng Việt>",
  "feedback": "<nhận xét tinh gọn bằng tiếng Việt>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Người dùng nói trong bối cảnh ${scenario}: "${message}". Hãy phản hồi đóng vai của bạn và xuất ra định dạng JSON.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: { type: Type.STRING },
              pinyin: { type: Type.STRING },
              translation: { type: Type.STRING },
              feedback: { type: Type.STRING }
            },
            required: ["replyText", "pinyin", "translation", "feedback"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không nhận được phản hồi chat từ Gemini.");
      }

      const result = JSON.parse(responseText);
      res.json(result);

    } catch (error: any) {
      console.error("Lỗi AI Roleplay Chat:", error);
      res.status(500).json({ error: "Lỗi tương tác phòng hội thoại: " + error.message });
    }
  });

  // API 4: AI Grammar Structural Analyzer & Word Breakdown
  app.post("/api/explain", async (req, res) => {
    try {
      const ai = getAiClient(req);
      const { text, language } = req.body;
      if (!text || !language) {
        return res.status(400).json({ error: "Thiếu thông tin phân tích (text, language)" });
      }

      console.log(`Explaining grammar/breakdown: text="${text}", lang=${language}`);

      const systemInstruction = `Bạn là một nhà ngôn ngữ học xuất sắc chuyên biên dịch và giải nghĩa ngữ pháp các ngôn ngữ Đông Á (Nhật, Trung, Hàn) và Tiếng Anh cho học viên Việt Nam học tập khẩu ngữ.
Nhiệm vụ của bạn là lấy một từ hoặc một mẫu câu tiếng ${language === 'zh' ? 'Trung' : language === 'ja' ? 'Nhật' : language === 'ko' ? 'Hàn' : 'Anh'} và giải thích cặn kẽ nó bằng tiếng Việt.

Phần phản hồi CẦN có dạng JSON khớp với định dạng sau:
1. "breakdown": Phân rã câu thành các thành phần cấu tạo nhỏ hơn (từ vựng, trợ từ, đuôi động từ). Với mỗi thành phần cần có:
   - "token": chữ gốc (ví dụ: "はじめ" hoặc "Nice")
   - "pinyin": phiên âm (ví dụ: "hajime" hoặc "naɪs")
   - "translation": dịch nghĩa tiếng Việt (ví dụ: "bắt đầu/lần đầu" hoặc "Thật tuyệt")
   - "role": vai trò ngữ pháp (ví dụ: "Danh từ", "Trợ từ", "Chủ ngữ", "Tính từ")
2. "grammarNotes": Danh sách các điểm ngữ pháp cần lưu ý trong câu. Với mỗi điểm ngữ pháp:
   - "title": Tên cấu trúc ngữ pháp
   - "explanation": Giải thích chi tiết cách dùng và ý nghĩa bằng tiếng Việt dễ hiểu.
3. "pronunciationTips": Một đoạn văn ngắn mẹo phát âm bản xứ cực chất bằng tiếng Việt.

Phản hồi chuẩn JSON theo cấu trúc:
{
  "breakdown": [
    { "token": "...", "pinyin": "...", "translation": "...", "role": "..." }
  ],
  "grammarNotes": [
    { "title": "...", "explanation": "..." }
  ],
  "pronunciationTips": "<mẹo phát âm tiếng Việt>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hãy phân tích từ/câu: "${text}" bằng tiếng ${language}. Trả về dạng JSON chuẩn rành mạch.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    token: { type: Type.STRING },
                    pinyin: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    role: { type: Type.STRING }
                  },
                  required: ["token", "translation", "role"]
                }
              },
              grammarNotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["title", "explanation"]
                }
              },
              pronunciationTips: { type: Type.STRING }
            },
            required: ["breakdown", "grammarNotes", "pronunciationTips"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không giải nghĩa được bằng Gemini.");
      }

      const result = JSON.parse(responseText);
      res.json(result);

    } catch (error: any) {
      console.error("Lỗi AI Breakdown giải nghĩa:", error);
      res.status(500).json({ error: "Lỗi phân tích cú pháp bài học: " + error.message });
    }
  });

  // Vite development / production static server setups
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server đang chạy trên http://0.0.0.0:${PORT}`);
  });
}

startServer();

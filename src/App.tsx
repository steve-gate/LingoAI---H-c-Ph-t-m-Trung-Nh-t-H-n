import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Flame, Sparkles, BookOpen, Volume2, Globe, GraduationCap, 
  Target, Award, Calendar, ChevronRight, HelpCircle, AlertCircle, 
  Settings, CheckCircle2, User, Play, ArrowRight, RefreshCw, Star, Info,
  Search, BookMarked, Layers, Compass, Plus, Trash2, Download, Zap, Radio,
  FolderDown, Send, MessageSquare, Lock, ShieldAlert, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Roadmap, Lesson, EvaluationResult, UserProfile, UserStats } from './types';
import AudioRecorder from './components/AudioRecorder';
import PronunciationEvaluator from './components/PronunciationEvaluator';
import GamificationDashboard from './components/GamificationDashboard';
import { playNativeText } from './utils/tts';

// Robust, high-quality, pre-crafted default curriculums to ensure instant usability and fallback stability
const DEFAULT_ROADMAPS: Record<'zh' | 'ja' | 'ko' | 'en', Roadmap> = {
  zh: {
    language: "Tiếng Trung Quốc",
    targetLanguageCode: "zh",
    level: "Mới bắt đầu",
    goal: "Giao tiếp hàng ngày",
    title: "Chinh Phục Khẩu Ngữ Trung Hoa Căn Bản 🇨🇳",
    summary: "Rèn luyện ngữ điệu 4 thanh điệu chuẩn Trung ương, nắm gọn cụm từ giao thiệp hàng ngày và phản xạ phát âm chuẩn xác cho người mới.",
    days: [
      {
        dayNumber: 1,
        topic: "Chào hỏi nồng hậu (Greetings & Greet)",
        description: "Học các mẫu câu chào hỏi và cảm ơn cơ bản chuẩn âm điệu Bắc Kinh",
        lessons: [
          {
            id: "zh-d1-l1",
            title: "Xin chào bạn",
            type: "phrase",
            nativeText: "你好",
            phonetic: "Nǐ hǎo",
            translation: "Xin chào bạn",
            contextTip: "Quy tắc biến điệu: Khi hai thanh thứ 3 đứng cạnh nhau, âm thứ nhất đọc thành thanh 2 (ní hǎo) nhẹ nhàng giống dấu sắc Việt Nam."
          },
          {
            id: "zh-d1-l2",
            title: "Lời cảm ơn",
            type: "phrase",
            nativeText: "谢谢",
            phonetic: "Xièxie",
            translation: "Cám ơn bạn",
            contextTip: "Hạ giọng đột ngột ở từ 'Xiè' đầu tiên (thanh 4), sau đó thả nhẹ không dấu ở từ 'xie' thứ hai."
          },
          {
            id: "zh-d1-l3",
            title: "Đừng khách sáo",
            type: "phrase",
            nativeText: "不客气",
            phonetic: "Bù kèqì",
            translation: "Đừng khách sáo / Không có gì",
            contextTip: "Các âm 'kè' và 'qì' đều là thanh 4, phát âm dứt khoát từ lồng ngực khí quản đi từ cao xuống thấp."
          }
        ]
      },
      {
        dayNumber: 2,
        topic: "Tự giới thiệu bản thân (Introduction)",
        description: "Tập giới thiệu tên tuổi, xuất xứ là người Việt Nam",
        lessons: [
          {
            id: "zh-d2-l1",
            title: "Tôi là người Việt Nam",
            type: "phrase",
            nativeText: "我是越南人",
            phonetic: "Wǒ shì yuènán rén",
            translation: "Tôi là người Việt Nam",
            contextTip: "Từ 'shì' cần cong lưỡi vừa phải đặt đầu lưỡi chạm vào phần trên của hàm. Từ 'rén' hơi rung họng giống lai âm r d."
          },
          {
            id: "zh-d2-l2",
            title: "Tên tôi là...",
            type: "phrase",
            nativeText: "我叫",
            phonetic: "Wǒ jiào...",
            translation: "Tôi tên là...",
            contextTip: "Hơi đọc ngân đều chữ 'Wǒ', sau đó nhấn đột ngột ở âm 'jiào' nhanh lẹ."
          }
        ]
      },
      {
        dayNumber: 3,
        topic: "Mua sắm thường nhật (Daily Shopping)",
        description: "Hỏi giá cả cơ bản khi đi chợ hoặc ghé siêu thị tiện ích",
        lessons: [
          {
            id: "zh-d3-l1",
            title: "Bao nhiêu tiền thế?",
            type: "phrase",
            nativeText: "多少钱",
            phonetic: "Duōshǎo qián",
            translation: "Bao nhiêu tiền?",
            contextTip: "Âm 'Duō' cao và bằng phẳng giọng. Âm 'qián' đi kéo nhẹ lên như âm hỏi hay dấu sắc từ tốn."
          },
          {
            id: "zh-d3-l2",
            title: "Đắt quá rồi",
            type: "phrase",
            nativeText: "太贵了",
            phonetic: "Tài guì le",
            translation: "Mắc quá rồi đó!",
            contextTip: "Từ 'Tài' nhấn mạnh giảm âm, từ 'guì' dứt khoát và kết thúc thảnh thơi ở 'le'."
          }
        ]
      },
      {
        dayNumber: 4,
        topic: "Hỏi đường và Địa điểm (Directions)",
        description: "Yêu cầu chỉ đường đến bốt công cộng hay nhà vệ sinh",
        lessons: [
          {
            id: "zh-d4-l1",
            title: "Nhà vệ sinh ở đâu?",
            type: "phrase",
            nativeText: "洗手间在哪里",
            phonetic: "Xǐshǒujiān zài nǎlǐ",
            translation: "Nhà vệ sinh nằm ở chỗ nào vậy?",
            contextTip: "Tránh ngắt nhịp giữa chừng. Phát âm liền mạch 'Xǐ-shǒu-jiān' thanh thoát để người nghe dễ hình dung."
          }
        ]
      },
      {
        dayNumber: 5,
        topic: "Chào từ biệt cuối ngày (Farewell)",
        description: "Cách nói tạm biệt truyền thống lịch thiệp",
        lessons: [
          {
            id: "zh-d5-l1",
            title: "Hẹn gặp lại bạn",
            type: "phrase",
            nativeText: "再见",
            phonetic: "Zàijiàn",
            translation: "Tạm biệt / Hẹn gặp lại",
            contextTip: "Hạ hơi dứt khoát hai lần liên tiếp từ cao xuống thấp ở cả hai tự. Không uốn lưỡi quá căng âm."
          }
        ]
      }
    ]
  },
  ja: {
    language: "Tiếng Nhật Bản",
    targetLanguageCode: "ja",
    level: "Mới bắt đầu",
    goal: "Giao tiếp hàng ngày",
    title: "Chinh Phục Nhịp Điệu Nhật Ngữ Đời Thường 🇯🇵",
    summary: "Rèn luyện nhịp phách âm tiết (Mora), độ lướt trường âm và ngữ điệu trầm bổng (Pitch Accent) đặc thù của vùng Tokyo bản giáo.",
    days: [
      {
        dayNumber: 1,
        topic: "Nghi lễ cúi chào (Formal Greetings)",
        description: "Học các cụm từ lễ nghi chào hỏi cốt lõi tôn kính",
        lessons: [
          {
            id: "ja-d1-l1",
            title: "Rất vui gặp mặt",
            type: "phrase",
            nativeText: "はじめまして",
            phonetic: "Hajimemashite",
            translation: "Rất hân hạnh được gặp bạn",
            contextTip: "Phát âm bằng giọng bằng phẳng, hạ nhẹ cuối đuôi ở chữ 'te'. Tránh ngắt quãng hơi thở bất chợt."
          },
          {
            id: "ja-d1-l2",
            title: "Lời chào buổi trưa",
            type: "phrase",
            nativeText: "こんにちは",
            phonetic: "Konnichiwa",
            translation: "Xin chào (Buổi ngày thường)",
            contextTip: "Chữ 'n' là một phách độc lập riêng biệt (mora), cần ngân nhẹ ở khoang mũi khoảng n nửa nhịp."
          },
          {
            id: "ja-d1-l3",
            title: "Lời cảm ơn sâu sắc",
            type: "phrase",
            nativeText: "ありがとうございます",
            phonetic: "Arigatou gozaimasu",
            translation: "Xin cám ơn quý khách rất nhiều",
            contextTip: "Trường âm 'o' ở cuối từ 'Arigatou' kéo dài 2 phách. Âm 'su' cuối cùng đọc mướt gió, tắt âm 'u' dẹt miệng."
          }
        ]
      },
      {
        dayNumber: 2,
        topic: "Mục mua sắm tiện ích (Convenience Shop)",
        description: "Giao dịch nhanh tại Konbini Nhật Bản",
        lessons: [
          {
            id: "ja-d2-l1",
            title: "Cái này bao nhiêu tiền?",
            type: "phrase",
            nativeText: "これはいくらですか",
            phonetic: "Kore wa ikura desu ka",
            translation: "Món đồ này giá bao nhiêu tiền thế?",
            contextTip: "Nguyên âm 'r' của Nhật Bản lai giữa âm 'l' và 'đ' trong tiếng Việt. Gõ đầu lưỡi nhanh vào vòm vách họng."
          },
          {
            id: "ja-d2-l2",
            title: "Cho tôi xin cái này",
            type: "phrase",
            nativeText: "이를ください",
            phonetic: "Kore wo kudasai",
            translation: "Lấy cho tôi cái này",
            contextTip: "Từ 'kudasai' giữ tốc độ phát âm trôi chảy đều đặn, không nhấn bật từ đầu 'ku'."
          }
        ]
      },
      {
        dayNumber: 3,
        topic: "Chỉ dẫn hành trình (Finding Places)",
        description: "Cách hỏi vị trí của nhà ga, cửa tiệm đắt khách",
        lessons: [
          {
            id: "ja-d3-l1",
            title: "Nhà ga ở đâu?",
            type: "phrase",
            nativeText: "駅はどこですか",
            phonetic: "Eki wa doko desu ka",
            translation: "Nhà ga nằm ở đâu thế ạ?",
            contextTip: "Hạ giọng đều ở âm 'doko' rồi khẽ đi lên âm gió 'ka' khi kết thúc câu hỏi."
          },
          {
            id: "ja-d3-l2",
            title: "Nhà tắm công cộng",
            type: "vocabulary",
            nativeText: "温泉",
            phonetic: "Onsen",
            translation: "Suối nước nóng Onsen nổi danh",
            contextTip: "Độ dài phát âm gồm đúng 4 nhịp phách: O - N - SE - N. Ngân âm mũi 'n' khẽ."
          }
        ]
      },
      {
        dayNumber: 4,
        topic: "Lịch sự xin lối & Làm phiền (Polite Requests)",
        description: "Mở lời xin phiền cứu giúp trên tàu điện",
        lessons: [
          {
            id: "ja-d4-l1",
            title: "Xin lỗi đã phiền...",
            type: "phrase",
            nativeText: "すみません",
            phonetic: "Sumimasen",
            translation: "Xin thất lễ / Xin lỗi / Làm phiền một chút",
            contextTip: "Kéo âm mũi nhẹ ở chữ 'n' cuối. Phát âm chân thành ấm áp tăng 50% cơ may nhận chỉ đường nhiệt tình!"
          }
        ]
      },
      {
        dayNumber: 5,
        topic: "Lời chúc tối an lành (Farewell & Night)",
        description: "Chào tạm biệt cuối ngày đầy ắp kỳ vọng",
        lessons: [
          {
            id: "ja-d5-l1",
            title: "Hẹn sớm gặp lại bạn",
            type: "phrase",
            nativeText: "また会いましょう",
            phonetic: "Mata aimashou",
            translation: "Hẹn gặp lại bạn nhé",
            contextTip: "Chữ 'aimashou' kéo dài âm cuối tròn hơi như 'o-o', không bật âm gió bẩn ở răng cắn."
          }
        ]
      }
    ]
  },
  ko: {
    language: "Tiếng Hàn Quốc",
    targetLanguageCode: "ko",
    level: "Mới bắt đầu",
    goal: "Giao tiếp hàng ngày",
    title: "Làm Chủ Cách Nói Tiếng Hàn Chuẩn Seoul 🇰🇷",
    summary: "Luyện rèn các âm bật hơi dữ dội, âm căng cứng lưệu, nối âm phụ âm cuối (Padchim) và kết hợp ngữ điệu tự nhiên của giới trẻ Hàn Quốc.",
    days: [
      {
        dayNumber: 1,
        topic: "Lời chào thân thiện (Core Greetings)",
        description: "Chào hỏi căn bản theo cấu trúc kính ngữ tôn trọng",
        lessons: [
          {
            id: "ko-d1-l1",
            title: "Kính chào tôn kính",
            type: "phrase",
            nativeText: "안녕하세요",
            phonetic: "Annyeonghaseyo",
            translation: "Xin kính chào quý khách / Xin chào bạn",
            contextTip: "Hạ nhẹ giọng đều ở từ 'yo' cuối câu để thể hiện sự dịu dàng và thành tín mạ mị."
          },
          {
            id: "ko-d1-l2",
            title: "Lời cảm ơn sâu xa",
            type: "phrase",
            nativeText: "감사합니다",
            phonetic: "Gamsahamnida",
            translation: "Xin chân thành cám ơn",
            contextTip: "Biến âm đặc biệt: Chữ 'hap' có phụ âm cuối 'p' đứng trước 'ni' nên biến âm kéo thành hạt âm mũi nghe tựa 'ham'."
          },
          {
            id: "ko-d1-l3",
            title: "Thật lòng xin lỗi",
            type: "phrase",
            nativeText: "죄송합니다",
            phonetic: "Joesonghamnida",
            translation: "Tôi chân thành xin lỗi",
            contextTip: "Nguyên âm 'Joe' mở tròn và dẹt mướt sang hai cạnh môi, tương tự biến âm 'p' thành 'm' lịch lãm."
          }
        ]
      },
      {
        dayNumber: 2,
        topic: "Giới thiệu bản thân (Introduction)",
        description: "Học cách tự bạch danh xưng và quốc hiệu Việt Nam",
        lessons: [
          {
            id: "ko-d2-l1",
            title: "Tôi là người Việt Nam",
            type: "phrase",
            nativeText: "저는 베트남 사람입니다",
            phonetic: "Jeoneun beteunam saram imnida",
            translation: "Tôi là người Việt Nam",
            contextTip: "Chú ý nối âm nhanh của 'beteunam' giữ đầu lưỡi thăng bằng, tiếp tục biến âm 'p' thành 'm' tại đuôi 'imnida'."
          },
          {
            id: "ko-d2-l2",
            title: "Rất vui quen biết bạn",
            type: "phrase",
            nativeText: "반가워요",
            phonetic: "Bangawoyo",
            translation: "Rất vui mừng khi được làm quen bạn",
            contextTip: "Nhấn tự do ở từ 'Ban', hạ nhẹ dần 'ga-wo-yo' lướt đều không thô ráp."
          }
        ]
      },
      {
        dayNumber: 3,
        topic: "Gọi đồ ăn Hàn Quốc (Ordering Food)",
        description: "Khám phá phong cách gọi món sành sỏi tại nhà hàng",
        lessons: [
          {
            id: "ko-d3-l1",
            title: "Món này ngon quá xá",
            type: "phrase",
            nativeText: "이거 맛있어요",
            phonetic: "Igeo masisseoyo",
            translation: "Món đồ này ngon quá!",
            contextTip: "Quy tắc nối phụ âm kép: Chữ 'mas' có 's' đẩy thẳng hơi nối sang nguyên âm kế 'iss' tạo âm nối 'ma-si-sseo-yo'."
          },
          {
            id: "ko-d3-l2",
            title: "Hãy cho tôi kim chi",
            type: "phrase",
            nativeText: "김치 주세요",
            phonetic: "Gimchi juseyo",
            translation: "Vui lòng cho tôi xin một phần kim chi",
            contextTip: "Âm 'Gim' không phát âm quá nặng như chữ 'G' tiếng Anh, hãy đọc nhẹ nửa 'K' nửa 'G'."
          }
        ]
      },
      {
        dayNumber: 4,
        topic: "Mua sắm du lịch (Travel Shop)",
        description: "Thương lượng giá cả ở chợ dongdaemun",
        lessons: [
          {
            id: "ko-d4-l1",
            title: "Bao nhiêu tiền thế ạ?",
            type: "phrase",
            nativeText: "얼마예요",
            phonetic: "Eolmayeyo",
            translation: "Cái này giá trị bao nhiêu tiền thế ạ?",
            contextTip: "Âm 'Eol' cong nhẹ phần đầu lưỡi hướng lên trên để tạo âm đuôi 'l' bản ngữ tự nhiên."
          }
        ]
      },
      {
        dayNumber: 5,
        topic: "Tạm biệt và Lên đường (Goodbye)",
        description: "Lời chúc ở lại hay ra về trong tiếng Hàn văn minh",
        lessons: [
          {
            id: "ko-d5-l1",
            title: "Chúc người ở lại an lành",
            type: "phrase",
            nativeText: "안녕히 계세요",
            phonetic: "Annyeonghi gyeseyo",
            translation: "Chào tạm biệt nhé (Dành cho người ra đi nói với người ở lại)",
            contextTip: "Chú ý phát âm dứt khoát âm 'gye'. Thể hiện sự kính trọng đúng chất làn sóng Hallyu."
          }
        ]
      }
    ]
  },
  en: {
    language: "Tiếng Anh",
    targetLanguageCode: "en",
    level: "Mới bắt đầu",
    goal: "Giao tiếp hàng ngày",
    title: "Chinh Phục Giao Tiếp Tiếng Anh Trôi Chảy 🇺🇸🇬🇧",
    summary: "Rèn luyện phát âm chuẩn IPA, ngữ điệu nhấn nhá tự nhiên và từ vựng thông dụng để học nhanh khẩu âm tự nhiên.",
    days: [
      {
        dayNumber: 1,
        topic: "Chào hỏi và Làm quen (Greetings & Warm-up)",
        description: "Học các cách chào hỏi lịch sự và tự nhiên như người bản xứ",
        lessons: [
          {
            id: "en-d1-l1",
            title: "Rất vui được gặp bạn",
            type: "phrase",
            nativeText: "Nice to meet you",
            phonetic: "naɪs tu miːt juː",
            translation: "Rất vui được gặp bạn",
            contextTip: "Đọc nối âm 'meet' và 'you' thành âm nhẹ 'mee-chù' để nghe thật tự nhiên."
          },
          {
            id: "en-d1-l2",
            title: "Bạn khỏe không?",
            type: "phrase",
            nativeText: "How has your day been",
            phonetic: "haʊ hæz jɔː deɪ biːn",
            translation: "Ngày hôm nay của bạn thế nào rồi?",
            contextTip: "Nhấn mạnh vào từ 'day' và 'been', lên giọng nhẹ ở cuối câu để thể hiện sự quan tâm thân mật."
          },
          {
            id: "en-d1-l3",
            title: "Cảm ơn rất nhiều",
            type: "phrase",
            nativeText: "Thank you so much",
            phonetic: "θæŋk juː soʊ mʌtʃ",
            translation: "Cảm ơn bạn rất nhiều",
            contextTip: "Đặt đầu lưỡi giữa hai hàm răng khi phát âm âm 'th' trong từ 'Thank'. Âm 'ch' ở cuối từ 'much' phát nhẹ nhàng hơi gió."
          }
        ]
      },
      {
        dayNumber: 2,
        topic: "Tự giới thiệu xuất thân (Introduce Yourself)",
        description: "Giới thiệu tên tuổi, gốc gác và nghề nghiệp đơn giản",
        lessons: [
          {
            id: "en-d2-l1",
            title: "Tôi đến từ Việt Nam",
            type: "phrase",
            nativeText: "I am from Vietnam",
            phonetic: "aɪ æm frʌm viˌɛtˈnɑːm",
            translation: "Tôi đến từ Việt Nam",
            contextTip: "Nhấn trọng âm rõ ở từ 'Vietnam' vào âm tiết thứ hai. Hãy giữ giọng ngân vang vừa phải."
          },
          {
            id: "en-d2-l2",
            title: "Tôi đang cố gắng học tốt tiếng Anh",
            type: "phrase",
            nativeText: "I am learning English",
            phonetic: "aɪ æm ˈlɜːrnɪŋ ˈɪŋɡlɪʃ",
            translation: "Tôi đang học tiếng Anh",
            contextTip: "Chú ý âm 'sh' /ʃ/ ở cuối từ 'English', chu môi tròn và đẩy hơi mạnh ra ngoài."
          }
        ]
      },
      {
        dayNumber: 3,
        topic: "Gọi món tại nhà hàng (Order food like a Pro)",
        description: "Các cấu trúc gọi món lịch thiệp tại tiệm ăn hoặc quán nước",
        lessons: [
          {
            id: "en-d3-l1",
            title: "Tôi muốn gọi món...",
            type: "phrase",
            nativeText: "I would like to order",
            phonetic: "aɪ wʊd laɪk tu ˈɔːrdər",
            translation: "Tôi muốn đặt/gọi món...",
            contextTip: "Cụm câu 'I would like' thường viết tắt và đọc là 'I'd like' /aɪd laɪk/ lướt nhẹ."
          }
        ]
      }
    ]
  }
};

export default function App() {
  // --- Persistent Storage Hook ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lingua_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: "Khánh Linh",
      language: "ja", // default
      level: "Moi_Bat_Dau",
      goal: "Giao_Tiep_Hang_Ngay"
    };
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lingua_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.xp !== undefined && parsed.level !== undefined) {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      completedLessonIds: [],
      scoreHistory: [],
      streak: 5,
      lastPracticedDate: null,
      xp: 120,
      level: 1,
      badges: ["Tân binh Học giả"],
      dailyQuests: [
        { id: "quest-1", description: "Luyện phát âm đạt trên 80 điểm", target: 1, progress: 0, done: false, rewardXp: 30 },
        { id: "quest-2", description: "Hoàn thành bài luyện mới ngày hôm nay", target: 1, progress: 0, done: false, rewardXp: 40 },
        { id: "quest-3", description: "Luyện âm chuẩn ngữ điệu (Intonation > 75%)", target: 1, progress: 0, done: false, rewardXp: 35 }
      ]
    };
  });

  const [customLessons, setCustomLessons] = useState<Record<'zh' | 'ja' | 'ko' | 'en', Lesson[]>>(() => {
    const saved = localStorage.getItem('lingua_custom_lessons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.zh && parsed.ja && parsed.ko && parsed.en) return parsed;
      } catch (e) {}
    }
    
    // Fallback: Flatten default roadmaps into flat lists
    const initial: Record<'zh' | 'ja' | 'ko' | 'en', Lesson[]> = {
      zh: [],
      ja: [],
      ko: [],
      en: []
    };
    
    (['zh', 'ja', 'ko', 'en'] as const).forEach(lang => {
      DEFAULT_ROADMAPS[lang].days.forEach(day => {
        day.lessons.forEach(lesson => {
          initial[lang].push({
            ...lesson,
            id: lesson.id || `${lang}-${day.dayNumber}-${Math.random().toString(36).substr(2, 5)}`
          });
        });
      });
    });
    
    return initial;
  });

  // State triggers
  const [activeLang, setActiveLang] = useState<'zh' | 'ja' | 'ko' | 'en'>(userProfile.language);
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    const fallbackList = { zh: [] as Lesson[], ja: [] as Lesson[], ko: [] as Lesson[], en: [] as Lesson[] };
    (['zh', 'ja', 'ko', 'en'] as const).forEach(lang => {
      DEFAULT_ROADMAPS[lang].days.forEach(day => {
        day.lessons.forEach(lesson => {
          fallbackList[lang].push(lesson);
        });
      });
    });
    return fallbackList.ja[0] || {
      id: "placeholder",
      title: "Chưa có từ vựng",
      type: "vocabulary",
      nativeText: "...",
      phonetic: "...",
      translation: "Hãy thêm từ mới bằng nút bên trái!",
      contextTip: "Nhập từ vựng bạn muốn học và thực hành phát âm."
    };
  });

  // Search and additions states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'vocabulary' | 'phrase'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addNativeText, setAddNativeText] = useState('');
  const [addPhonetic, setAddPhonetic] = useState('');
  const [addTranslation, setAddTranslation] = useState('');
  const [addType, setAddType] = useState<'vocabulary' | 'phrase'>('vocabulary');
  const [addContextTip, setAddContextTip] = useState('');

  // Anki direct sync States
  const [ankiStatus, setAnkiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isAddingToAnki, setIsAddingToAnki] = useState(false);
  const [showAnkiImportModal, setShowAnkiImportModal] = useState(false);
  const [ankiDecks, setAnkiDecks] = useState<string[]>([]);
  const [selectedAnkiDeck, setSelectedAnkiDeck] = useState<string>('');
  const [isFetchingDecks, setIsFetchingDecks] = useState(false);
  const [isImportingCards, setIsImportingCards] = useState(false);

  // API Keys Management State
  const [apiKeys, setApiKeys] = useState<{key: string, name: string, status: 'untested' | 'valid' | 'invalid' | 'testing'}[]>(() => {
    try {
      const saved = localStorage.getItem('linguai_api_keys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeApiKey, setActiveApiKey] = useState<string>(() => {
    return localStorage.getItem('linguai_active_api_key') || '';
  });
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [newApiValue, setNewApiValue] = useState('');

  useEffect(() => {
    localStorage.setItem('linguai_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);
  
  useEffect(() => {
    localStorage.setItem('linguai_active_api_key', activeApiKey);
  }, [activeApiKey]);

  const getApiHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeApiKey) {
      headers['x-gemini-api-key'] = activeApiKey;
    }
    return headers;
  };

  // Live assessment triggers
  const [currentRecordedBase64, setCurrentRecordedBase64] = useState<string | null>(null);
  const [currentRecordedUrl, setCurrentRecordedUrl] = useState<string | null>(null);
  const [activeEvaluation, setActiveEvaluation] = useState<EvaluationResult | null>(null);

  // Dynamic loaders
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationStateMsg, setEvaluationStateMsg] = useState<string>("");
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  
  // Custom Settings Profile modal triggers
  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ ...userProfile });

  // Advanced Integrated Technology States: Workspace Tab, Playback Rate, AI Chat, and Spaced Repetition SRS
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'lessons' | 'roleplay'>('lessons');
  const [ttsRate, setTtsRate] = useState<number>(0.8);
  const [chatScenario, setChatScenario] = useState<'restaurant' | 'hotel' | 'cafe' | 'airport'>('restaurant');
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [isAnalyzingGrammar, setIsAnalyzingGrammar] = useState(false);
  const [showGrammarBreakdown, setShowGrammarBreakdown] = useState(false);
  const [grammarExplanation, setGrammarExplanation] = useState<{
    breakdown: { token: string; pinyin: string; translation: string; role: string }[];
    grammarNotes: { title: string; explanation: string }[];
    pronunciationTips: string;
  } | null>(null);

  const [chatMessages, setChatMessages] = useState<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    pinyin?: string;
    translation?: string;
    feedback?: string;
    timestamp: Date;
  }[]>([]);

  const [srsData, setSrsData] = useState<Record<string, { intervalDays: number; easeFactor: number; nextReviewDate: string; stage: number }>>(() => {
    try {
      const saved = localStorage.getItem('linguai_srs_data');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('linguai_srs_data', JSON.stringify(srsData));
  }, [srsData]);

  // Screen-time Web Limit and Focus Blocker States
  const [isWebLockerActivated, setIsWebLockerActivated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('linguai_web_locker_active');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [webMinutesRemaining, setWebMinutesRemaining] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('linguai_web_minutes_left');
      return saved ? parseInt(saved, 10) : 15;
    } catch {
      return 15;
    }
  });

  useEffect(() => {
    localStorage.setItem('linguai_web_locker_active', String(isWebLockerActivated));
  }, [isWebLockerActivated]);

  useEffect(() => {
    localStorage.setItem('linguai_web_minutes_left', String(webMinutesRemaining));
  }, [webMinutesRemaining]);

  const [lockerTargetScore, setLockerTargetScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('linguai_locker_target_score');
      return saved ? parseInt(saved, 10) : 80;
    } catch {
      return 80;
    }
  });

  const [lockerRewardMinutes, setLockerRewardMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('linguai_locker_reward_minutes');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [blacklistedWebsites, setBlacklistedWebsites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('linguai_locker_blacklist');
      return saved ? JSON.parse(saved) : ["facebook.com", "youtube.com", "tiktok.com", "instagram.com"];
    } catch {
      return ["facebook.com", "youtube.com", "tiktok.com", "instagram.com"];
    }
  });

  const [newBlacklistInput, setNewBlacklistInput] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('linguai_locker_target_score', String(lockerTargetScore));
  }, [lockerTargetScore]);

  useEffect(() => {
    localStorage.setItem('linguai_locker_reward_minutes', String(lockerRewardMinutes));
  }, [lockerRewardMinutes]);

  useEffect(() => {
    localStorage.setItem('linguai_locker_blacklist', JSON.stringify(blacklistedWebsites));
  }, [blacklistedWebsites]);

  // Handle countdown interval (1 minute decrement) when lock mode is active
  useEffect(() => {
    if (!isWebLockerActivated || webMinutesRemaining <= 0) return;

    const intervalId = setInterval(() => {
      setWebMinutesRemaining(prev => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isWebLockerActivated, webMinutesRemaining]);

  // SCENARIO WELCOME MESSAGES
  const SCENARIO_WELCOME_MESSAGES: Record<'zh' | 'ja' | 'ko' | 'en', Record<string, { text: string; pinyin: string; translation: string }>> = {
    zh: {
      restaurant: { text: "欢迎光临！请问您几位？想点点儿什么？", pinyin: "Huānyíng guānglín! Qǐngwèn nín jǐ wèi? Xiǎng diǎndiǎnr shénme?", translation: "Chào mừng quý khách! Xin hỏi có quý khách đi mấy người ạ? Quý khách muốn gọi món gì?" },
      hotel: { text: "您好，欢迎来到北京饭店。请问您有预订吗？", pinyin: "Nínhǎo, huānyíng láidào Běijīng Fàndiàn. Qǐngwèn nín yǒu yùdìng ma?", translation: "Xin chào, chào mừng đến khách sạn Bắc Kinh. Xin hỏi quý khách đã đặt phòng trước chưa ạ?" },
      cafe: { text: "您好！今天想喝点什么 coffee？我们这里 Latte 很受欢迎。", pinyin: "Nínhǎo! Jīntiān xiǎng hē diǎnr shénme kāfēi? Wǒmen zhèlǐ nátiě hěn shòu huānyíng.", translation: "Xin chào! Hôm nay bạn muốn dùng cà phê gì? Ở đây Latte của chúng tôi rất được ưa chuộng." },
      airport: { text: "您好，请出示您的护照和机票。您有行李要托运吗？", pinyin: "Nínhǎo, qǐng chūshì nín de hùzhào hé jīpiào. Nín yǒu xínglǐ yào tuōyùn ma?", translation: "Xin chào, vui lòng xuất trình hộ chiếu và vé máy bay. Quý khách có hành lý cần ký gửi không?" }
    },
    ja: {
      restaurant: { text: "いらっしゃいませ！何名様ですか？ご注文はお決まりですか？", pinyin: "Irasshaimase! Nanmei-sama desu ka? Go-chūmon wa o-kimari desu ka?", translation: "Kính chào quý khách! Quý khách đi mấy người ạ? Mình đã chọn món xong chưa?" },
      hotel: { text: "いらっしゃいませ。本日ご宿泊のご予約はございますか？", pinyin: "Irasshaimase. Honjitsu go-shukuhaku no go-yoyaku wa gozaimasu ka?", translation: "Kính chào quý khách. Không biết hôm nay mình đã có phòng đặt trước chưa ạ?" },
      cafe: { text: "こんにちは！ご注文は何にいたしますか？季節限定 của quán đang có Matcha Latte rất ngon đấy.", pinyin: "Konnichiwa! Go-chūmon wa nan ni itashimasu ka? Kisetsu-gentei no matcha rate ga osusume desu yo.", translation: "Xin chào! Bạn muốn order gì ạ? Latte trà xanh đặc biệt của quán đang được đề xuất đấy." },
      airport: { text: "こんにちは。パスポートと航空券をご提示ください。お預けになる手荷物はございますか？", pinyin: "Konnichiwa. Pasupōto to kōkūken o go-teishi kudasai. O-azuke ni naru tenimotsu wa gozaimasu ka?", translation: "Xin chào. Xin vui lòng xuất trình hộ chiếu và vé máy bay. Quý khách có hành lý nào cần ký gửi không?" }
    },
    ko: {
      restaurant: { text: "어서 오세요! 몇 분이세요? 주문하시겠습니까?", pinyin: "Eoseo oseyo! Myeot bun-iseyo? Jumun-hasigessneun-ga-yo?", translation: "Chào mừng quý khách! Quý khách đi mấy người ạ? Mình muốn gọi món chưa?" },
      hotel: { text: "안녕하세요, 서울 호텔입니다. 예약하셨습니까?", pinyin: "Annyeonghaseyo, Seoul hotel-imnida. Yeyak-hasyeossseumnika?", translation: "Xin chào, đây là khách sạn Seoul. Quý khách đã đặt phòng trước chưa ạ?" },
      cafe: { text: "안녕하세요! 어떤 음료로 드릴까요? 저희 가게는 아메리카노가 맛있습니다.", pinyin: "Annyeonghaseyo! Eotteon eumryoro deurilkka-yo? Jeohui gagenun americano-ga mas-isseumnida.", translation: "Xin chào! Quý khách muốn dùng thức uống gì? Quán chúng tôi có Americano rất ngon ạ." },
      airport: { text: "안녕하세요. 여권과 항공권을 보여주십시오. 위탁할 수하물이 있으십니까?", pinyin: "Annyeonghaseyo. Yeogwon-gwa hanggonggwon-eul boyeojusipsio. Witak-hal suhamul-i iseusimnika?", translation: "Xin chào. Vui lòng xuất trình hộ chiếu và vé máy bay. Bạn có hành lý ký gửi nào không?" }
    },
    en: {
      restaurant: { text: "Good evening! Welcome to our restaurant. How many people are in your party?", pinyin: "ɡʊd ˈiːvnɪŋ! ˈwɛlkəm tu ˈaʊər ˈrɛstərənt. haʊ ˈmɛni ˈpiːpəl ɑːr ɪn jɔːr ˈpɑːrti?", translation: "Chào buổi tối! Chào mừng quý khách đến nhà hàng của chúng tôi. Quý khách đi đoàn mấy người ạ?" },
      hotel: { text: "Hello, welcome to our hotel. Do you have a reservation under your name?", pinyin: "həˈloʊ, ˈwɛlkəm tu ˈaʊər hoʊˈtɛl. duː juː hæv ə ˌrɛzərˈveɪʃən ˈʌndər jɔːr neɪm?", translation: "Xin chào, chào mừng đến khách sạn của chúng tôi. Quý khách đã đặt phòng trước dưới tên mình chưa ạ?" },
      cafe: { text: "Hi there! What can I get started for you today? I highly recommend our iced mocha latte.", pinyin: "haɪ ðɛr! wʌt kæn aɪ ɡɛt ˈstɑːrtɪd fɔːr juː təˈdeɪ? aɪ ˈhaɪli ˌrɛkəˈmɛnd ˈaʊər aɪst ˈmoʊkə ˈlɑːteɪ.", translation: "Chào bạn! Hôm nay bạn muốn order món gì để khởi đầu ngày mới? Mình đề xuất món iced mocha latte nhé." },
      airport: { text: "Hello, may I see your passport and flight ticket, please? Do you have any bags to check in?", pinyin: "həˈloʊ, meɪ aɪ siː jɔːr ˈpæspɔːrt ænd flaɪt ˈtɪkət, pliːz? duː juː hæv ˈɛni bæɡz tu tʃɛk ɪn?", translation: "Xin chào, tôi có thể xem hộ chiếu và vé máy bay của quý khách không ạ? Quý khách có hành lý nào cần ký gửi không?" }
    }
  };

  // Populate first chat message based on language and scenario selection change
  useEffect(() => {
    const welcome = SCENARIO_WELCOME_MESSAGES[activeLang]?.[chatScenario];
    if (welcome) {
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: welcome.text,
          pinyin: welcome.pinyin,
          translation: welcome.translation,
          feedback: 'Bắt đầu cuộc trò chuyện đóng vai! Trình AI đang sẵn sàng trò chuyện cùng bạn.',
          timestamp: new Date()
        }
      ]);
    }
  }, [activeLang, chatScenario]);

  // Handler to analyze grammar breakdown via API post
  const handleAnalyzeGrammarWithAI = async () => {
    if (!activeLesson || activeLesson.id === 'placeholder') return;
    setIsAnalyzingGrammar(true);
    setErrorText(null);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          text: activeLesson.nativeText,
          language: activeLang
        })
      });
      if (!response.ok) {
        throw new Error(`Server returned code: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setGrammarExplanation(data);
      setShowGrammarBreakdown(true);
    } catch (err: any) {
      console.error(err);
      setErrorText(`❌ Không phân tích được ngữ pháp: ${err.message}`);
    } finally {
      setIsAnalyzingGrammar(false);
    }
  };

  // Handler to post a Chat Scene message to backend/api/chat
  const handleSendChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsgText = chatInput;
    setChatInput('');
    setIsChatSending(true);

    const newUserMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      text: userMsgText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMsg]);

    try {
      const formattedHistory = chatMessages.slice(-8).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          language: activeLang,
          scenario: chatScenario,
          message: userMsgText,
          history: formattedHistory
        })
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai' as const,
          text: data.replyText,
          pinyin: data.pinyin,
          translation: data.translation,
          feedback: data.feedback,
          timestamp: new Date()
        }
      ]);

      // Award bonus engagement points
      setStats(prev => ({
        ...prev,
        xp: prev.xp + 20
      }));

      // Speak replying native text aloud automatically
      playNativeText(data.replyText, activeLang, ttsRate);

    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ai' as const,
          text: `⚠️ Phòng hội thoại mất kết nối: ${err.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Handler to score and set Spaced Repetition (SRS) recall scheduling parameters
  const handleSrsReview = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeLesson || activeLesson.id === 'placeholder') return;

    const now = new Date();
    let intervalDays = 1;
    let stage = 1;
    let easeFactor = 2.5;

    const existing = srsData[activeLesson.id];
    if (existing) {
      easeFactor = existing.easeFactor || 2.5;
      stage = existing.stage || 0;
    }

    if (rating === 'again') {
      intervalDays = 0;
      stage = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'hard') {
      intervalDays = existing ? Math.max(1, Math.round(existing.intervalDays * 1.2)) : 1;
      stage = stage + 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 'good') {
      intervalDays = existing ? Math.max(2, Math.round(existing.intervalDays * easeFactor)) : 3;
      stage = stage + 1;
    } else if (rating === 'easy') {
      intervalDays = existing ? Math.max(4, Math.round(existing.intervalDays * easeFactor * 1.3)) : 7;
      stage = stage + 1;
      easeFactor = easeFactor + 0.15;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(now.getDate() + intervalDays);

    setSrsData(prev => ({
      ...prev,
      [activeLesson.id]: {
        lessonId: activeLesson.id,
        intervalDays,
        easeFactor,
        nextReviewDate: nextReviewDate.toISOString(),
        stage
      }
    }));

    const rewardCoins = rating === 'easy' ? 25 : rating === 'good' ? 15 : rating === 'hard' ? 8 : 4;
    setStats(prev => ({
      ...prev,
      xp: prev.xp + rewardCoins
    }));

    alert(`🎴 Thẻ ôn tập được xếp lịch thành công!\n- Đánh giá: ${rating.toUpperCase()}\n- Chu kỳ tiếp theo: Hạn sau ${intervalDays} ngày.\n- Thưởng thêm: +${rewardCoins} XP 🌟`);
  };

  // Sync state changes to storage
  useEffect(() => {
    localStorage.setItem('lingua_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('lingua_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('lingua_custom_lessons', JSON.stringify(customLessons));
  }, [customLessons]);

  // Local AnkiConnect verification check
  const checkAnkiConnect = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'version', version: 6 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result === 6) {
          setAnkiStatus('connected');
          return;
        }
      }
      setAnkiStatus('disconnected');
    } catch (e) {
      setAnkiStatus('disconnected');
    }
  };

  useEffect(() => {
    checkAnkiConnect();
    const interval = setInterval(checkAnkiConnect, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keep state variables synchronized when toggling main languages
  useEffect(() => {
    const lessons = customLessons[activeLang];
    if (lessons && lessons.length > 0) {
      setActiveLesson(lessons[0]);
    } else {
      setActiveLesson({
        id: "placeholder",
        title: "Chưa có từ vựng",
        type: "vocabulary",
        nativeText: "...",
        phonetic: "...",
        translation: "Hãy thêm từ mới bằng nút bên trái!",
        contextTip: "Nhập từ vựng bạn muốn học và thực hành phát âm."
      });
    }
    // Update main user language preference
    setUserProfile(p => ({ ...p, language: activeLang }));
    // Clear last pronunciation test
    setCurrentRecordedBase64(null);
    setCurrentRecordedUrl(null);
    setActiveEvaluation(null);
    setErrorText(null);
    setGrammarExplanation(null);
    setShowGrammarBreakdown(false);
  }, [activeLang, customLessons]);

  // Handle lesson selected from sidebar
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    // Reset assessment state
    setCurrentRecordedBase64(null);
    setCurrentRecordedUrl(null);
    setActiveEvaluation(null);
    setErrorText(null);
    setGrammarExplanation(null);
    setShowGrammarBreakdown(false);
  };

  // Speaks aloud the standard native phrase
  const handlePlayModelTTS = () => {
    if (!activeLesson) return;
    playNativeText(activeLesson.nativeText, activeLang, ttsRate);
  };

  // Called from AudioRecorder.tsx when user finishes speaking
  const handleRecordingDone = (base64Audio: string, audioUrl: string) => {
    setCurrentRecordedBase64(base64Audio);
    setCurrentRecordedUrl(audioUrl);
    setErrorText(null);
    setActiveEvaluation(null); // Clear previous evaluation of different recorded audio clip
  };

  // Trigger evaluation post to express server /api/evaluate
  const handleEvaluateAudioWithAI = async () => {
    if (!currentRecordedBase64 || !activeLesson) return;
    setIsEvaluating(true);
    setEvaluationStateMsg("Đang truyền tải tệp âm thanh thu âm sang server...");
    setErrorText(null);

    // Pulse coaching tips during slow request times
    const loadingSentences = [
      "AI đang lắng nghe cấu trúc âm tiết bính âm và cao độ...",
      "Đang so sánh phổ tần giọng nói của bạn với mô hình người bản ngữ...",
      "Đang phân tích độ trôi chảy, nhịp lặng phách âm tiết...",
      "Gần xong! Đang xuất mẹo tạo hình khẩu hình chi tiết bằng tiếng Việt..."
    ];
    let step = 0;
    const interval = setInterval(() => {
      if (step < loadingSentences.length) {
        setEvaluationStateMsg(loadingSentences[step]);
        step++;
      }
    }, 2800);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          audio: currentRecordedBase64,
          phrase: activeLesson.nativeText,
          language: activeLang,
          pinyin: activeLesson.phonetic
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server báo lỗi mã trạng thái ${response.status}`);
      }

      const evalResult: EvaluationResult = await response.json();
      setActiveEvaluation(evalResult);

      // Award additional internet time based on customizable target score and reward minutes
      if (evalResult.overallScore >= lockerTargetScore) {
        setWebMinutesRemaining(prev => prev + lockerRewardMinutes);
        setTimeout(() => {
          alert(`🎉 TUYỆT VỜI! Phát âm đạt ${evalResult.overallScore} điểm (đạt mục tiêu ≥ ${lockerTargetScore}đ). Bạn được cộng thêm +${lockerRewardMinutes} phút sử dụng web tự do! Học càng nhiều, mở càng nhiều!`);
        }, 500);
      }

      // Handle statistics updates based on score with full gamification system
      setStats(prev => {
        let newCompletedList = [...prev.completedLessonIds];
        if (!newCompletedList.includes(activeLesson.id)) {
          newCompletedList.push(activeLesson.id);
        }

        // Streak logical check
        let dailyStreak = prev.streak;
        const todayStr = new Date().toDateString();
        if (prev.lastPracticedDate !== todayStr) {
          dailyStreak = prev.streak + 1;
        }

        // Calculate XP updates
        const xpGained = evalResult.xpEarned ?? 20;
        let finalXp = (prev.xp ?? 120) + xpGained;

        // Quests tracker details
        const updatedQuests = (prev.dailyQuests ?? [
          { id: "quest-1", description: "Luyện phát âm đạt trên 80 điểm", target: 1, progress: 0, done: false, rewardXp: 30 },
          { id: "quest-2", description: "Hoàn thành bài luyện mới ngày hôm nay", target: 1, progress: 0, done: false, rewardXp: 40 },
          { id: "quest-3", description: "Luyện âm chuẩn ngữ điệu (Intonation > 75%)", target: 1, progress: 0, done: false, rewardXp: 35 }
        ]).map(q => {
          if (q.done) return q;

          let termProgress = q.progress;
          if (q.id === "quest-1" && evalResult.overallScore >= 80) {
            termProgress = Math.min(q.progress + 1, q.target);
          }
          if (q.id === "quest-2") {
            termProgress = Math.min(q.progress + 1, q.target);
          }
          if (q.id === "quest-3" && evalResult.intonationScore >= 75) {
            termProgress = Math.min(q.progress + 1, q.target);
          }

          const newlyDone = termProgress >= q.target;
          if (newlyDone) {
            finalXp += q.rewardXp;
          }

          return {
            ...q,
            progress: termProgress,
            done: newlyDone
          };
        });

        // Level ups
        let calculatedLevel = prev.level ?? 1;
        while (finalXp >= calculatedLevel * 200) {
          calculatedLevel += 1;
          setTimeout(() => {
            alert(`🌟 CHÚC MỪNG LEVEL UP! Bạn đã xuất sắc thăng cấp lên Đẳng Cấp ${calculatedLevel}! Hãy tiếp tục phát huy khả năng luyện phát âm ngoại ngữ của bạn.`);
          }, 350);
        }

        // Medal badges unlocking logic
        let newBadges = [...(prev.badges ?? ["Tân binh Học giả"])];
        if (activeLang === 'zh' && evalResult.overallScore >= 80 && !newBadges.includes("Vua Thanh điệu Bắc Kinh")) {
          newBadges.push("Vua Thanh điệu Bắc Kinh");
        }
        if (activeLang === 'ja' && evalResult.overallScore >= 80 && !newBadges.includes("Sứ giả Ngữ điệu Tokyo")) {
          newBadges.push("Sứ giả Ngữ điệu Tokyo");
        }
        if (activeLang === 'ko' && evalResult.overallScore >= 80 && !newBadges.includes("Chiến thần Phản xạ Seoul")) {
          newBadges.push("Chiến thần Phản xạ Seoul");
        }
        if (activeLang === 'en' && evalResult.overallScore >= 80 && !newBadges.includes("Đại sứ Ngữ điệu London")) {
          newBadges.push("Đại sứ Ngữ điệu London");
        }

        return {
          ...prev,
          completedLessonIds: newCompletedList,
          scoreHistory: [
            ...prev.scoreHistory,
            { lessonId: activeLesson.id, score: evalResult.overallScore, date: new Date().toLocaleDateString() }
          ],
          streak: dailyStreak,
          lastPracticedDate: todayStr,
          xp: finalXp,
          level: calculatedLevel,
          badges: newBadges,
          dailyQuests: updatedQuests
        };
      });

    } catch (err: any) {
      console.error(err);
      setErrorText("Lỗi phân tích giọng nói: " + err.message);
    } finally {
      clearInterval(interval);
      setIsEvaluating(false);
    }
  };

  // Add a custom vocab / sentence to the active language collection
  const handleAddCustomLesson = (e: FormEvent) => {
    e.preventDefault();
    if (!addNativeText.trim() || !addTranslation.trim()) {
      alert("⚠️ Vui lòng nhập đầy đủ chữ bản xứ và nghĩa dịch tiếng Việt!");
      return;
    }

    const newID = `usr-${activeLang}-${Date.now()}`;
    const newLesson: Lesson = {
      id: newID,
      title: addType === 'vocabulary' ? 'Từ vựng mới' : 'Mẫu câu mới',
      type: addType,
      nativeText: addNativeText.trim(),
      phonetic: addPhonetic.trim() || '...',
      translation: addTranslation.trim(),
      contextTip: addContextTip.trim()
    };

    setCustomLessons(prev => {
      const updatedList = [newLesson, ...prev[activeLang]];
      return {
        ...prev,
        [activeLang]: updatedList
      };
    });

    setAddNativeText('');
    setAddPhonetic('');
    setAddTranslation('');
    setAddContextTip('');
    setShowAddForm(false);
    setActiveLesson(newLesson);

    alert(`✨ Đã thêm thành công: "${newLesson.nativeText}" vào sổ tay của bạn!`);
  };

  // Remove a vocab / sentence from active collection
  const handleDeleteLesson = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("❓ Bạn có thực sự muốn xóa mục từ này khỏi sổ tay của mình không?")) {
      return;
    }

    setCustomLessons(prev => {
      const updatedList = prev[activeLang].filter(item => item.id !== lessonId);
      
      if (activeLesson.id === lessonId) {
        setTimeout(() => {
          if (updatedList.length > 0) {
            setActiveLesson(updatedList[0]);
          } else {
            setActiveLesson({
              id: "placeholder",
              title: "Chưa có từ vựng",
              type: "vocabulary",
              nativeText: "...",
              phonetic: "...",
              translation: "Hãy thêm từ mới bằng nút bên trái!",
              contextTip: "Nhập từ vựng bạn muốn học và thực hành phát âm."
            });
          }
        }, 50);
      }

      return {
        ...prev,
        [activeLang]: updatedList
      };
    });
  };

  // 1-Click Sync current word to local computer Anki Desktop (using AnkiConnect)
  const handlePushToAnki = async () => {
    if (!activeLesson || activeLesson.id === 'placeholder') {
      alert("⚠️ Hãy chọn hoặc thêm từ vựng/câu trước khi đồng bộ!");
      return;
    }
    
    setIsAddingToAnki(true);
    try {
      const langText = activeLang === 'ja' ? 'Tiếng Nhật' : activeLang === 'zh' ? 'Tiếng Trung' : activeLang === 'ko' ? 'Tiếng Hàn' : 'Tiếng Anh';
      const deckName = `LinguAI - ${langText}`;
      
      const createResponse = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createDeck',
          version: 6,
          params: { deck: deckName }
        })
      });
      
      if (!createResponse.ok) {
        throw new Error("Không thể khởi tạo bộ thẻ trên Anki App.");
      }

      const frontHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 25px;">
          <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; font-weight: bold; margin-bottom: 8px;">${activeLesson.type === 'vocabulary' ? 'TỪ VỰNG' : 'MẪU CÂU'} (${langText})</div>
          <div style="font-size: 38px; font-weight: bold; color: #1e293b; margin-bottom: 12px;">${activeLesson.nativeText}</div>
          <div style="font-size: 18px; font-style: italic; color: #4f46e5; font-family: monospace;">${activeLesson.phonetic}</div>
        </div>
      `;
      
      const backHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 25px; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 22px; font-weight: bold; color: #0f172a; margin-bottom: 10px;">${activeLesson.translation}</div>
          ${activeLesson.contextTip ? `<div style="font-size: 13px; color: #e11d48; background: #fff5f5; border: 1px solid #ffe4e6; padding: 10px 14px; border-radius: 8px; max-width: 320px; margin: 15px auto 0;">💡 <b>Mẹo phát âm:</b> ${activeLesson.contextTip}</div>` : ''}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 25px;">Được đồng bộ tự động từ ứng dụng rèn giọng <b>LinguAI</b></div>
        </div>
      `;

      const addResponse = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addNote',
          version: 6,
          params: {
            note: {
              deckName: deckName,
              modelName: "Basic",
              fields: {
                Front: frontHTML,
                Back: backHTML
              },
              options: {
                allowDuplicate: false,
                duplicateScope: "deck"
              },
              tags: ["linguai", activeLang]
            }
          }
        })
      });

      const addData = await addResponse.json();
      if (addData.error) {
        if (addData.error.toLowerCase().includes("duplicate")) {
          alert(`ℹ️ Thẻ cho sinh viên học "${activeLesson.nativeText}" đã tồn tại trong Anki của bạn!`);
        } else {
          throw new Error(addData.error);
        }
      } else {
        alert(`🎉 Đã truyền thành công thẻ rèn giọng "${activeLesson.nativeText}" sang Anki App của bạn!`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`❌ Không thể đồng bộ trực tiếp: ${e.message}\n\nHướng dẫn kết nối:\n1. Bảo đảm phần mềm Anki đã được chạy trên máy tính của bạn.\n2. Cài đặt tiện ích mở rộng (add-on) AnkiConnect bằng cách mở Anki Desktop > Tools > Add-ons > Get Add-ons và nhập mã: 2055492159.\n3. Khởi động lại Anki và nhấn kiểm tra kết nối lại.`);
    } finally {
      setIsAddingToAnki(false);
    }
  };

  // Helper function to strip HTML tags from Anki fields values
  const stripHTML = (html: string): string => {
    if (!html) return '';
    let text = html.replace(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
    text = text.replace(/<br\s*\/?>/gi, ' ');
    text = text.replace(/<[^>]+>/g, '');
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  // Fetch list of all decks from local desktop Anki app via AnkiConnect
  const handleFetchAnkiDecks = async () => {
    setIsFetchingDecks(true);
    try {
      const response = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deckNames',
          version: 6
        })
      });
      if (!response.ok) {
        throw new Error(`Kiểm tra AnkiConnect lỗi: status ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const decks: string[] = data.result || [];
      setAnkiDecks(decks);
      if (decks.length > 0) {
        const langLabel = activeLang === 'zh' ? 'Trung' : activeLang === 'ja' ? 'Nhật' : 'Hàn';
        const bestDeck = decks.find((d: string) => d.includes(langLabel) || d.includes('LinguAI')) || decks[0];
        setSelectedAnkiDeck(bestDeck);
      }
      setAnkiStatus('connected');
    } catch (err: any) {
      console.error(err);
      setAnkiStatus('disconnected');
      alert(`❌ Không thể lấy danh sách Decks từ Anki!\n\nHãy đảm bảo bản dịch / ứng dụng Anki của bạn đang mở ở chế độ hoạt động bình thường trên máy tính.\nCơ chế lỗi: ${err.message}`);
    } finally {
      setIsFetchingDecks(false);
    }
  };

  // Import cards from selected Anki deck into our local customLessons list
  const handleImportFromAnkiDeck = async () => {
    if (!selectedAnkiDeck) {
      alert("⚠️ Vui lòng chọn một bộ thẻ (deck) cần nhập!");
      return;
    }
    setIsImportingCards(true);
    try {
      // 1. Find notes in selected deck
      const findResponse = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'findNotes',
          version: 6,
          params: { query: `deck:"${selectedAnkiDeck}"` }
        })
      });
      if (!findResponse.ok) {
        throw new Error(`AnkiConnect lỗi: status ${findResponse.status}`);
      }
      const findData = await findResponse.json();
      if (findData.error) {
        throw new Error(findData.error);
      }
      const noteIds: number[] = findData.result || [];
      if (noteIds.length === 0) {
        alert(`Bộ thẻ "${selectedAnkiDeck}" của bạn hiện đang trống.`);
        setIsImportingCards(false);
        return;
      }

      // 2. Load detail cards
      const infoResponse = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notesInfo',
          version: 6,
          params: { notes: noteIds }
        })
      });
      if (!infoResponse.ok) {
        throw new Error("Không lấy được chi tiết thẻ rèn giọng");
      }
      const infoData = await infoResponse.json();
      if (infoData.error) {
        throw new Error(infoData.error);
      }
      const notes = infoData.result || [];
      const importedLessons: Lesson[] = [];

      notes.forEach((note: any) => {
        if (!note.fields) return;

        // Retrieve field values in custom sorted order
        const sortedFields = Object.entries(note.fields)
          .map(([name, fObj]: [string, any]) => ({
            name,
            value: stripHTML(fObj.value || ''),
            order: fObj.order || 0
          }))
          .sort((a, b) => a.order - b.order);

        if (sortedFields.length === 0) return;

        const frontText = sortedFields[0].value;
        if (!frontText) return;

        // Fallback translation
        const backText = sortedFields[1]?.value || 'Chưa có chú giải';

        // Try to find phonetic field or use the third one
        const phoneticField = sortedFields.find(f => 
          /phonetic|pinyin|reading|kana|furigana|pronunciation|roman|hanyu/i.test(f.name)
        );

        let phoneticText = phoneticField ? phoneticField.value : '';
        if (!phoneticText && sortedFields.length > 2) {
          phoneticText = sortedFields[2].value;
        }

        // Remaining elements go to context
        const additionalTips = sortedFields
          .slice(3)
          .map(f => `${f.name}: ${f.value}`)
          .join(' | ');

        const cardId = `anki-${note.noteId || Math.random().toString(36).substr(2, 6)}`;
        const isPhrase = frontText.length > 12;

        importedLessons.push({
          id: cardId,
          title: isPhrase ? "Mẫu câu nhập từ Anki" : "Từ vựng nhập từ Anki",
          type: isPhrase ? 'phrase' : 'vocabulary',
          nativeText: frontText,
          phonetic: phoneticText || '...',
          translation: backText,
          contextTip: additionalTips ? `[Anki: ${additionalTips}]` : `Nhập từ bộ thẻ "${selectedAnkiDeck}" của Anki`
        });
      });

      if (importedLessons.length === 0) {
        alert("⚠️ Không tìm thấy thẻ hợp lệ nào trong bộ thẻ đã chọn.");
        setIsImportingCards(false);
        return;
      }

      setCustomLessons(prev => {
        const currentLangLessons = prev[activeLang] || [];
        const existingTexts = new Set(currentLangLessons.map(l => l.nativeText.trim()));
        
        // Filter out duplicates
        const uniqueImported = importedLessons.filter(item => !existingTexts.has(item.nativeText.trim()));
        const mergedList = [...uniqueImported, ...currentLangLessons];
        
        setTimeout(() => {
          if (uniqueImported.length > 0) {
            setActiveLesson(uniqueImported[0]);
          }
          alert(`🎉 Nhập khẩu hoàn tất!\n- Tổng cộng thẻ đọc được: ${importedLessons.length}\n- Thẻ mới thêm vào: ${uniqueImported.length}\n- Thẻ bị trùng lặp lược bỏ: ${importedLessons.length - uniqueImported.length}`);
        }, 120);

        return {
          ...prev,
          [activeLang]: mergedList
        };
      });

      setShowAnkiImportModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`❌ Lỗi đồng bộ thẻ từ Anki: ${err.message}`);
    } finally {
      setIsImportingCards(false);
    }
  };

  // Export entire word deck of currently selected language as Tab-Delimited .txt Ready for Anki Import
  const handleExportToAnkiTXT = () => {
    const list = customLessons[activeLang];
    const langText = activeLang === 'ja' ? 'Nhat' : activeLang === 'zh' ? 'Trung' : activeLang === 'ko' ? 'Han' : 'Anh';
    if (list.length === 0) {
      alert("Danh sách trống, vui lòng thêm từ vựng trước khi xuất thẻ!");
      return;
    }
    
    // Header for Anki showing types
    const lines = [
      "#separator:tab",
      "#html:true",
      "#tags:linguai export",
      "Front\tBack"
    ];

    list.forEach(item => {
      const frontHTML = `<div style='text-align: center; padding: 10px;'><span style='font-size: 11px; font-weight: bold; color: indigo; border: 1px solid indigo; padding: 2px 6px; border-radius: 4px;'>${item.type === 'vocabulary' ? 'Từ vựng' : 'Mẫu câu'}</span><h2 style='font-size: 32px; margin: 8px 0;'>${item.nativeText}</h2><p style='font-size: 18px; color: #4338ca;'><i>${item.phonetic}</i></p></div>`;
      const backHTML = `<div style='text-align: center; padding: 10px;'><h3 style='font-size: 20px; color: #0f172a;'>${item.translation}</h3>${item.contextTip ? `<p style='font-size: 12px; color: #be123c; margin-top: 10px;'>💡 Note: ${item.contextTip}</p>` : ''}</div>`;
      lines.push(`${frontHTML}\t${backHTML}`);
    });
    
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguai_anki_${langText}_import.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save changes to username / settings
  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setUserProfile({
      name: tempProfile.name || userProfile.name,
      language: tempProfile.language,
      level: tempProfile.level,
      goal: tempProfile.goal
    });
    setActiveLang(tempProfile.language);
    setShowCustomizeModal(false);
    alert("✨ Đã lưu cấu hình học viên!");
  };

  const handleNextLesson = () => {
    const list = customLessons[activeLang];
    if (list.length === 0) return;
    const idx = list.findIndex(l => l.id === activeLesson.id);
    if (idx >= 0 && idx < list.length - 1) {
      handleSelectLesson(list[idx + 1]);
    } else {
      alert("🎉 Bạn đã hoàn thành bài luyện tập cuối cùng trong sổ tay ngôn ngữ hiện tại!");
    }
  };

  return (
    <div id="clean-minimal-app-root" className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* 1. BRAND NAVIGATION HEADER */}
      <nav className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all shadow-sm">
        <div className="flex items-center gap-6 md:gap-10">
          {/* Logo */}
          <div className="text-2xl font-black tracking-tighter text-indigo-600 flex items-center gap-1.5 cursor-pointer" onClick={() => window.location.reload()}>
            <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            LINGU<span className="text-slate-400 font-medium">AI</span>
          </div>

          <button 
            onClick={() => setShowApiKeysModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-indigo-600 rounded-full text-xs font-bold transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quản lý API</span>
          </button>

          {/* EastAsian Languages Tab Switchers */}
          <div className="flex space-x-1 bg-slate-100/80 p-0.5 rounded-full border border-slate-200/50">
            <button
              onClick={() => setActiveLang('ja')}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full transition-all focus:outline-none ${
                activeLang === 'ja'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🇯🇵 Tiếng Nhật
            </button>
            <button
              onClick={() => setActiveLang('zh')}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full transition-all focus:outline-none ${
                activeLang === 'zh'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🇨🇳 Tiếng Trung
            </button>
            <button
              onClick={() => setActiveLang('ko')}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full transition-all focus:outline-none ${
                activeLang === 'ko'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🇰🇷 Tiếng Hàn
            </button>
            <button
              onClick={() => setActiveLang('en')}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full transition-all focus:outline-none ${
                activeLang === 'en'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🇺🇸 Tiếng Anh
            </button>
          </div>
        </div>

        {/* User Right Status Block */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Active Fire Streak */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform" title="Số ngày học tập liên tục của bạn!">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-amber-600 font-bold text-xs md:text-sm tracking-tight">{stats.streak} ngày</span>
          </div>

          {/* Level & XP block */}
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 bg-[#EEF2F6] rounded-full shadow-sm">
            <Award className="w-4 h-4 text-indigo-600" />
            <div className="flex flex-col text-left">
              <span className="text-indigo-800 font-extrabold text-[10px] leading-none">Cấp {stats.level ?? 1}</span>
              <div className="flex items-center gap-1 mt-0.5 animate-pulse">
                <div className="w-12 h-1 bg-indigo-200 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(((stats.xp ?? 0) % 200) / 2, 100)}%` }} />
                </div>
                <span className="text-[8px] font-mono font-bold text-indigo-500">{(stats.xp ?? 0) % 200}/200XP</span>
              </div>
            </div>
          </div>

          {/* User profile capsule */}
          <div 
            onClick={() => {
              setTempProfile({ ...userProfile });
              setShowCustomizeModal(true);
            }}
            className="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-full border border-transparent hover:border-slate-100 transition-all"
            title="Đổi lộ trình cá nhân hóa bằng AI"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-sm flex items-center justify-center text-xs font-black text-white uppercase tracking-wider transition-colors">
              {userProfile.name ? userProfile.name.slice(0, 2) : 'HV'}
            </div>
            <div className="hidden md:flex flex-col text-left mr-1">
              <span className="text-xs font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
                {userProfile.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Lv. {userProfile.level === 'Moi_Bat_Dau' ? 'Sơ cấp' : userProfile.level === 'Trung_Cap' ? 'Trung cấp' : 'Nâng cao'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. THREE-PANEL CORE SYSTEM CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1700px] w-full mx-auto px-4 md:px-6 lg:px-8 py-6 gap-6">
        
        {/* PANEL A: SỔ TAY CÁ NHÂN & KẾT NỐI ANKI (LEFT SIDEBAR) */}
        <aside className="w-full lg:w-96 bg-white border border-slate-100 p-6 rounded-3xl flex flex-col gap-5 shadow-sm overflow-hidden shrink-0">
          
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 mb-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full inline-block text-[10px] font-bold uppercase tracking-wider">
                Sổ tay cá nhân
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight block">TỪ VỰNG & MẪU CÂU</h2>
            </div>
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm shadow-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm mới
            </button>
          </div>

          {/* Search keywords & Type filters pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm chữ hoặc nghĩa dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-700 transition"
              />
            </div>
            
            <div className="flex gap-1.5">
              {[
                { type: 'all', label: 'Tất cả' },
                { type: 'vocabulary', label: 'Từ vựng' },
                { type: 'phrase', label: 'Mẫu câu' }
              ].map(pill => (
                <button
                  key={pill.type}
                  type="button"
                  onClick={() => setFilterType(pill.type as any)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border ${
                    filterType === pill.type
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliding Add Form (collapsible) */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddCustomLesson}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3 overflow-hidden text-left"
              >
                <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Nhập thông tin từ / câu
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Loại thẻ</label>
                    <select
                      value={addType}
                      onChange={(e) => setAddType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700"
                    >
                      <option value="vocabulary">Từ vựng</option>
                      <option value="phrase">Mẫu câu</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Phát âm / Pinyin</label>
                    <input
                      type="text"
                      placeholder="e.g. nǐ hǎo"
                      value={addPhonetic}
                      onChange={(e) => setAddPhonetic(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Chữ bản xứ (Nhật/Trung/Hàn) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 你好"
                    value={addNativeText}
                    onChange={(e) => setAddNativeText(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nghĩa dịch Tiếng Việt *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. xin chào bạn"
                    value={addTranslation}
                    onChange={(e) => setAddTranslation(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Ghi chú phát âm (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Biến điệu, ngữ điệu,..."
                    value={addContextTip}
                    onChange={(e) => setAddContextTip(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none text-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1.5 bg-slate-200/75 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-indigo-100"
                  >
                    Thêm ngay
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Words & sentences container list */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] lg:max-h-[380px] p-0.5 pr-1 border border-transparent hover:border-slate-50 rounded-2xl">
            {(() => {
              const list = customLessons[activeLang] || [];
              const filtered = list.filter(item => {
                const query = searchQuery.trim().toLowerCase();
                const matchQuery = !query || 
                  item.nativeText.toLowerCase().includes(query) || 
                  item.translation.toLowerCase().includes(query) || 
                  (item.phonetic && item.phonetic.toLowerCase().includes(query));
                
                const matchType = filterType === 'all' || item.type === filterType;
                return matchQuery && matchType;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10 px-4 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-100">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                    Không tìm thấy từ / câu nào phù hợp.
                  </div>
                );
              }

              return filtered.map((lesson) => {
                const isSelected = activeLesson.id === lesson.id;
                const isCompleted = stats.completedLessonIds.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full group/item text-left p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" title="Đã rèn phát âm thành công" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center text-[8px] font-bold ${isSelected ? 'border-indigo-400 text-indigo-500 bg-white' : 'border-slate-300 text-slate-400'}`} />
                      )}
                      
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold truncate leading-snug">{lesson.nativeText}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase ${lesson.type === 'phrase' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                            {lesson.type === 'phrase' ? 'Câu' : 'Từ'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{lesson.translation}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLesson(lesson.id, e)}
                        className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                        title="Xóa mục từ khỏi sổ tay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-indigo-500' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* 🎴 ANKI SYNC CARDS INTEGRATION PANEL */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-xs font-black tracking-tight uppercase">ĐỒNG BỘ THẺ ANKI</span>
              </div>
              
              {/* Anki status Badge */}
              <div className="flex items-center gap-1">
                {ankiStatus === 'checking' && (
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang dò...
                  </span>
                )}
                {ankiStatus === 'connected' && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Anki Connect Online
                  </span>
                )}
                {ankiStatus === 'disconnected' && (
                  <span className="text-[9px] bg-slate-800 text-slate-400 font-medium px-2 py-0.5 rounded-full">
                    Anki App Offline
                  </span>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Rèn phát âm bằng AI, sau đó lưu trực tiếp vào ứng dụng Anki của bạn để ghi nhớ dài hạn qua Spaced Repetition (Lặp lại ngắt quãng).
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Direct sync button using AnkiConnect API */}
              <button
                type="button"
                onClick={handlePushToAnki}
                disabled={isAddingToAnki || !activeLesson || activeLesson.id === 'placeholder'}
                className="py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                title="Đồng bộ 1-Click tự động sang bộ thẻ Anki Desktop"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Đẩy sang Anki</span>
              </button>

              {/* Offline backup export CSV/TXT button */}
              <button
                type="button"
                onClick={handleExportToAnkiTXT}
                disabled={!customLessons[activeLang] || customLessons[activeLang].length === 0}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                title="Xuất danh sách từ vựng thành file để nhập thủ công vào ứng dụng Anki của bạn (Mobile hoặc Desktop)"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Xuất file thẻ</span>
              </button>
            </div>

            {/* Pull/Fetch cards from Anki Deck list */}
            <button
              type="button"
              onClick={() => {
                setShowAnkiImportModal(true);
                handleFetchAnkiDecks();
              }}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-indigo-300 hover:text-indigo-200 transition flex items-center justify-center gap-1.5"
              title="Nhập danh sách từ vựng từ bất kỳ bộ thẻ Anki nào của bạn vào LinguAI"
            >
              <FolderDown className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
              <span>Lấy từ Deck Anki 📥</span>
            </button>
            
            {ankiStatus === 'disconnected' && (
              <div className="text-[9.5px] text-slate-500 leading-relaxed bg-slate-950/40 p-2 rounded-xl border border-slate-850 text-left">
                💡 <b>Mẹo 1-Click Sync:</b> Bật ứng dụng Anki trên máy tính để kết nối tự động. Nhập mã addon AnkiConnect <u>2055492159</u> và khởi động lại Anki. Bạn cũng có thể dùng nút <span className="text-slate-300">Xuất file thẻ</span> để nhập vào điện thoại.
              </div>
            )}
          </div>

        </aside>

        {/* PANEL B: CENTRAL WORKSPACE CLASSROOM (STUDY GROUND) */}
        <main className="flex-1 flex flex-col gap-6 justify-start min-w-0">
          
          {/* Top workspace select segment tabs */}
          <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/50 w-full shadow-inner">
            <button
              id="tab-notebook-btn"
              onClick={() => setActiveWorkspaceTab('lessons')}
              className={`flex-1 py-3 text-center rounded-xl text-xs font-black tracking-tight transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeWorkspaceTab === 'lessons'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/40 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              BÀI LUYỆN SỔ TAY CUỐN
            </button>
            <button
              id="tab-roleplay-btn"
              onClick={() => setActiveWorkspaceTab('roleplay')}
              className={`flex-1 py-3 text-center rounded-xl text-xs font-black tracking-tight transition-all duration-200 flex items-center justify-center gap-1.5 relative ${
                activeWorkspaceTab === 'roleplay'
                  ? 'bg-white text-pink-700 shadow-sm border border-slate-200/40 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Radio className="w-4 h-4 text-pink-500 animate-pulse" />
              PHÒNG HỘI THOẠI NHẬP VAI AI
              <span className="absolute top-1 right-2 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
            </button>
          </div>

          {activeWorkspaceTab === 'lessons' ? (
            <>
              {/* Main big display card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm flex flex-col items-center justify-between text-center min-h-[460px] relative overflow-hidden transition-all duration-300">
                
                {/* Top tiny metadata header */}
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <BookMarked className="w-4 h-4 text-indigo-500" />
                  <span>BÀI LUYỆN: {activeLesson.title}</span>
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  <span className="text-indigo-600">{activeLesson.type === 'phrase' ? 'Mẫu Câu' : 'Từ Vựng'}</span>
                </div>

                {/* Giant central scripts and translation widgets */}
                <div className="my-auto py-8 space-y-4 w-full">
                  {/* Native asian script letters */}
                  <h1 id="native-word-display" className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 my-2 select-all leading-normal drop-shadow-sm font-sans" title="Từ gốc bản địa">
                    {activeLesson.nativeText}
                  </h1>

                  {/* Phonetic guide standard */}
                  <div id="phonetic-word-display" className="text-xl md:text-2xl text-indigo-600 font-semibold tracking-wide font-mono bg-indigo-50/40 px-4 py-1.5 rounded-full inline-block">
                    {activeLesson.phonetic}
                  </div>

                  {/* Translation meanings */}
                  <p id="translation-display" className="text-slate-500 text-base md:text-lg max-w-lg mx-auto font-medium">
                    &ldquo;{activeLesson.translation}&rdquo;
                  </p>

                  {/* Culture note indicator */}
                  {activeLesson.contextTip && (
                    <div className="max-w-md mx-auto text-xs text-rose-600 bg-rose-50 border border-rose-100/55 p-3 rounded-xl mt-3 flex gap-2 items-start justify-center">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-left leading-normal">{activeLesson.contextTip}</span>
                    </div>
                  )}

                  {/* Spaced Repetition SRS indicators */}
                  {srsData[activeLesson.id] && (
                    <div className="mx-auto select-none mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-bold rounded-full shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Nhớ lặp lại ngắt quãng: Stage {srsData[activeLesson.id].stage} (Hạn ôn tiếp theo: {new Date(srsData[activeLesson.id].nextReviewDate).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                    </div>
                  )}
                </div>

                {/* Micro and sound play mechanics */}
                <div className="w-full pt-6 border-t border-slate-100 flex flex-col items-center gap-5">
                  
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                    {/* Standard Speaker native audio playback helper */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <button
                        id="tts-play-btn"
                        type="button"
                        onClick={handlePlayModelTTS}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition-all focus:outline-none shadow-sm group"
                        title="Nghe giọng chuẩn bản xứ phát âm"
                      >
                        <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>

                      {/* Customizable speed rate pill segment bar */}
                      <div className="flex bg-slate-200/50 p-0.5 rounded-xl text-[10px] font-bold text-slate-500">
                        {([0.5, 0.8, 1.0] as const).map(rate => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setTtsRate(rate)}
                            className={`px-2 py-1 rounded-lg transition-all ${
                              ttsRate === rate
                                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                                : 'hover:bg-slate-300/40 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {rate === 1.0 ? '1.0x' : rate === 0.8 ? '0.8x' : '0.5x chậm'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden md:block h-6 w-[1.5px] bg-slate-200" />

                    {/* Ghi âm module */}
                    <AudioRecorder 
                      onRecordingComplete={handleRecordingDone} 
                      langCode={activeLang}
                    />

                    {/* Customizable AI Grammar Analysis Triggers */}
                    <button
                      id="grammar-analyze-btn"
                      onClick={handleAnalyzeGrammarWithAI}
                      disabled={isAnalyzingGrammar || activeLesson.id === 'placeholder'}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-tight leading-4 shadow-sm flex items-center gap-1.5 transition-all outline-none"
                    >
                      {isAnalyzingGrammar ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                          Đang phân tích cú pháp...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          PHÂN TÍCH NGỮ PHÁP AI 🧬
                        </>
                      )}
                    </button>
                  </div>

                  {/* Submit to evaluation server button */}
                  {currentRecordedBase64 && !activeEvaluation && (
                    <motion.button
                      id="submit-evaluate-btn"
                      onClick={handleEvaluateAudioWithAI}
                      disabled={isEvaluating}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 w-full max-w-sm py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm tracking-tight shadow-lg shadow-indigo-100 active:scale-98 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-white animate-spin" />
                      ẨN DỤNG THU ÂM - CHẤM ĐIỂM AI PHÁT ÂM 🎙️
                    </motion.button>
                  )}
                </div>

                {/* Spaced Repetition (SRS) Memory Stage Rating Dock */}
                {activeLesson.id !== 'placeholder' && (
                  <div className="w-full mt-6 pt-4 border-t border-dashed border-slate-100 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">HỆ THỐNG SPACED REPETITION (ÔN TẬP NGẮT QUÃNG MEMORY DOCK)</span>
                    <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
                      <button
                        onClick={() => handleSrsReview('again')}
                        className="py-2.5 bg-rose-50 border border-rose-100/55 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center"
                        title="Không nhớ gì, học lại ngay lập tức"
                      >
                        <span className="text-xs">🔁</span>
                        <span>Quên (Again)</span>
                      </button>
                      <button
                        onClick={() => handleSrsReview('hard')}
                        className="py-2.5 bg-amber-50 border border-amber-100/55 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center"
                        title="Hơi khó, ôn lại sớm"
                      >
                        <span className="text-xs">🔴</span>
                        <span>Khó (1 Ngày)</span>
                      </button>
                      <button
                        onClick={() => handleSrsReview('good')}
                        className="py-2.5 bg-teal-50 border border-teal-100/55 hover:bg-teal-100 text-teal-700 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center"
                        title="Nhớ tốt, ôn lại sau vài ngày"
                      >
                        <span className="text-xs">🟢</span>
                        <span>Tốt (3 Ngày)</span>
                      </button>
                      <button
                        onClick={() => handleSrsReview('easy')}
                        className="py-2.5 bg-sky-50 border border-sky-100/55 hover:bg-sky-100 text-sky-700 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center"
                        title="Cực hữu ích, dễ nhớ, ôn sau 1 tuần"
                      >
                        <span className="text-xs">🔵</span>
                        <span>Dễ (7 Ngày)</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Elegant Loading spinner / pulsing layer while AI is grading */}
                <AnimatePresence>
                  {isEvaluating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 z-20"
                    >
                      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Đang phân tích phát âm...</h3>
                      <p id="eval-status-msg" className="text-sm text-slate-500 font-mono text-center max-w-sm animate-pulse">
                        {evaluationStateMsg}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Dynamic Grammatical Breakdown AI analysis card drawer */}
              {showGrammarBreakdown && grammarExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden text-left"
                >
                  <button
                    onClick={() => setShowGrammarBreakdown(false)}
                    className="absolute top-4 right-4 w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                  >
                    &times;
                  </button>

                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <h3 className="text-base font-black tracking-tight text-white uppercase">KẾT QUẢ PHÂN TÍCH CHI TIẾT NGỮ PHÁP & TỪ VỰNG AI</h3>
                  </div>

                  {/* 1. Breakdown Grid/Table list */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Phân rã thành phần câu (Breakdown Components):</span>
                    <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950 p-2 lg:p-4">
                      <table className="w-full text-xs text-left text-slate-300 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-black">
                            <th className="pb-2">Ký tự</th>
                            <th className="pb-2">Phiên âm</th>
                            <th className="pb-2">Dịch Nghĩa</th>
                            <th className="pb-2 text-right">Từ loại</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grammarExplanation.breakdown.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-900 last:border-0 hover:bg-slate-900/40">
                              <td className="py-2.5 font-bold text-indigo-400 text-sm">{item.token}</td>
                              <td className="py-2.5 text-pink-400 font-mono">{item.pinyin || '-'}</td>
                              <td className="py-2.5 text-slate-200">{item.translation}</td>
                              <td className="py-2.5 text-right text-slate-400">{item.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. Key Grammar Structure points */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Mẫu Cấu trúc & Điểm Ngữ pháp cốt lõi:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {grammarExplanation.grammarNotes.map((note, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                          <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 mb-1.5 uppercase">
                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" />
                            {note.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{note.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Speaking Accents / Pronunciation guidelines */}
                  <div className="bg-pink-950/20 border border-pink-900/30 p-4 rounded-xl">
                    <span className="text-xs font-black text-pink-400 block mb-1 uppercase tracking-wide">💡 MẸO KHẨU NGỮ ĐỌC ĐÚNG KHÍ CHẤT BẢN XỨ:</span>
                    <p className="text-xs text-pink-100 leading-normal font-medium">{grammarExplanation.pronunciationTips}</p>
                  </div>

                </motion.div>
              )}
            </>
          ) : (
            /* Roleplay Context classroom component */
            <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[580px] text-left relative overflow-hidden transition-all duration-300">
              
              {/* Scenario selector bar header */}
              <div className="border-b border-slate-100 pb-4 mb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-500 animate-pulse" />
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">PHÒNG ĐỐI THOẠI NHẬP VAI AI</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'restaurant', label: '🍕 Nhà hàng' },
                    { id: 'hotel', label: '🏨 Khách sạn' },
                    { id: 'cafe', label: '☕ Café☕' },
                    { id: 'airport', label: '✈️ Sân bay' }
                  ].map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => {
                        setChatScenario(scene.id as any);
                        setChatMessages([]);
                      }}
                      className={`py-2 text-[10px] md:text-xs font-extrabold rounded-xl border transition-all ${
                        chatScenario === scene.id
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-black'
                          : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {scene.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message dialog body container */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] min-h-[320px] p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-4 flex flex-col">
                <AnimatePresence initial={false}>
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                        }`}>
                          
                          {/* Main Native Asian text content script */}
                          <div className="flex items-start gap-2 justify-between">
                            <span className="font-sans font-bold text-base md:text-lg leading-snug break-all">
                              {msg.text}
                            </span>
                            {!isUser && msg.id !== 'welcome' && (
                              <button
                                type="button"
                                onClick={() => playNativeText(msg.text, activeLang, ttsRate)}
                                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 flex items-center justify-center shrink-0 transition ml-2"
                                title="Lắng nghe AI phát âm phản hồi này"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Romanized transcript if exists */}
                          {msg.pinyin && (
                            <p className="text-xs font-bold font-mono text-pink-500 mt-1 dark:text-pink-400">
                              {msg.pinyin}
                            </p>
                          )}

                          {/* Vietnamese translation transcript if exists */}
                          {msg.translation && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5 border-t border-slate-100 pt-1 border-dashed">
                              &ldquo;{msg.translation}&rdquo;
                            </p>
                          )}

                          {/* Coaching structural Feedback back from AI */}
                          {msg.feedback && (
                            <div className="mt-2 text-[10px] leading-relaxed font-bold bg-indigo-50/50 border border-indigo-100/30 text-indigo-700 p-2 rounded-lg">
                              🤖 Nhận xét AI: {msg.feedback}
                            </div>
                          )}

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isChatSending && (
                  <div className="flex justify-start w-full">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 max-w-[80%] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                      <span className="text-xs text-slate-400 font-semibold italic ml-1">AI đang suy nghĩ phản hồi...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Text Input submits area */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isChatSending}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-xs md:text-sm font-semibold text-slate-800 transition shadow-inner"
                  placeholder={`Phản hồi tiếng ${activeLang === 'zh' ? 'Trung' : activeLang === 'ja' ? 'Nhật' : activeLang === 'ko' ? 'Hàn' : 'Anh'} bối cảnh...`}
                />
                <button
                  type="submit"
                  disabled={isChatSending || !chatInput.trim()}
                  className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center transition shrink-0 outline-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

            </div>
          )}

          {/* Action indicator messages or dynamic notice boards */}
          {errorText && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-2.5 font-medium text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

        </main>

        {/* PANEL C: DETAILED SPECIFIC ANALYSIS DASHBOARD (RIGHT PANEL) */}
        <aside className="w-full lg:w-96 bg-white border border-slate-100 p-6 md:p-8 rounded-3xl flex flex-col overflow-y-auto max-h-[800px] lg:max-h-none shadow-sm">
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">KẾT QUẢ PHÂN TÍCH</h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase">Syllable AI</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {activeEvaluation ? (
                <motion.div
                  key="has-result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Embedded high fidelity analysis components */}
                  <PronunciationEvaluator 
                    result={activeEvaluation} 
                    langCode={activeLang} 
                  />

                  {/* Advance progression button */}
                  <div className="pt-4 mt-2">
                    <button
                      id="next-lesson-btn"
                      onClick={handleNextLesson}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm tracking-tight shadow-md flex items-center justify-center gap-2 hover:translate-x-0.5 transition-all text-center"
                    >
                      BÀI LUYỆN TIẾP THEO <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Volume2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-700">Chưa có kết quả thu giọng</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      Hãy nhấp vào icon Micro bên cột giữa để bắt đầu ghi âm phát âm câu nói này. Trình AI thông minh của LinguAI sẽ chỉ rõ lỗi âm tiết ngay lập tức!
                    </p>
                  </div>

                  {/* Standard guidelines indicators */}
                  <div className="w-full text-left space-y-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">MỤC TIÊU CỦA BẠN</div>
                    <div className="flex items-center gap-2 text-xs">
                      <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-slate-600 font-medium">Trình độ: <span className="font-bold text-slate-800">
                        {userProfile.level === 'Moi_Bat_Dau' ? 'Sơ cấp' : userProfile.level === 'Trung_Cap' ? 'Trung cấp' : 'Nâng cao'}
                      </span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-slate-600 font-medium">Mục tiêu: <span className="font-bold text-slate-800">
                        {userProfile.goal === 'Giao_Tiep_Hang_Ngay' ? 'Giao tiếp hằng ngày' : userProfile.goal === 'Cong_Viec_Thuong_Mai' ? 'Ưu thế thương mại' : userProfile.goal === 'Du_Lich_Kham_Pha' ? 'Văn hóa du lịch' : 'Khảo thí chứng chỉ'}
                      </span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GAMIFIED SCREEN-TIME WEB LOCKER CARD */}
          <div className="mt-6 border-t border-dashed border-slate-200 pt-6 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">HỌC ĐỂ MỞ WEB (TIME DISCIPLINE)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isWebLockerActivated ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {isWebLockerActivated ? '🔴 KHÓA CHỦ ĐỘNG' : '⚪ ĐANG TẮT CHẶN'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">Quỹ thời gian truy cập web:</span>
                <span className={`text-base font-black font-mono transition-colors ${webMinutesRemaining <= 3 ? 'text-rose-600 animate-pulse font-black' : 'text-indigo-700 font-black'}`}>
                  {webMinutesRemaining} phút
                </span>
              </div>

              {/* Progress Bar of active leisure time quota */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${webMinutesRemaining === 0 ? 'bg-slate-300' : webMinutesRemaining <= 3 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (webMinutesRemaining / 30) * 100)}%` }}
                />
              </div>

              {/* Interactive Target Score Modifier Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Yêu cầu điểm đạt để cộng phút:</span>
                  <span className="text-indigo-600 font-mono font-extrabold">{lockerTargetScore}% trở lên</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  step="5"
                  value={lockerTargetScore}
                  onChange={(e) => setLockerTargetScore(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Interactive Earned Minutes Per Practice Session */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Mỗi bài học mở khoá thêm:</span>
                  <span className="text-indigo-600 font-mono font-extrabold">{lockerRewardMinutes} phút (Mặc định: 3p)</span>
                </div>
                <div className="flex gap-1.5 select-none font-sans">
                  {([3, 5, 10, 15] as const).map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLockerRewardMinutes(mins)}
                      className={`flex-1 py-1 text-[10px] rounded-lg border font-bold transition-all ${
                        lockerRewardMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{mins} Phút
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal border-t border-indigo-100/40 pt-2.5">
                Khi chế độ khóa chạy, việc lọt điểm &ge; <strong>{lockerTargetScore}%</strong> sẽ tự động nạp tích lũy ôn tập <strong>+{lockerRewardMinutes} phút lướt web</strong>.
              </p>

              {/* Buttons to control and simulate */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsWebLockerActivated(!isWebLockerActivated);
                    if (!isWebLockerActivated && webMinutesRemaining === 0) {
                      setWebMinutesRemaining(lockerRewardMinutes);
                    }
                  }}
                  className={`py-2 text-[10px] font-black rounded-xl border transition-all ${
                    isWebLockerActivated 
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                      : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-xs'
                  }`}
                >
                  {isWebLockerActivated ? '📴 TẮT CHẾ ĐỘ' : '🔒 BẬT TỰ KHÓA'}
                </button>

                <button
                  type="button"
                  title="Nhấn để thiết lập thời gian về 0 để thử nghiệm giao diện khóa"
                  onClick={() => {
                    setWebMinutesRemaining(0);
                    setIsWebLockerActivated(true);
                  }}
                  className="py-2 bg-slate-900 hover:bg-slate-850 text-white text-[10px] font-extrabold rounded-xl shadow-xs transition"
                >
                  ⏳ KHÓA THỬ NGHIỆM
                </button>
              </div>
            </div>

            {/* Blocklist Manager */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 text-xs">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">DANH SÁCH TRANG WEB CHẶN (BLACKLOCKED)</span>
              
              <div className="flex flex-wrap gap-1">
                {blacklistedWebsites.map(site => (
                  <span key={site} className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200/80 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 transition">
                    <span>{site}</span>
                    <button 
                      type="button" 
                      onClick={() => setBlacklistedWebsites(prev => prev.filter(s => s !== site))}
                      className="text-slate-400 hover:text-red-500 font-extrabold text-[10px]"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input form to list */}
              <div className="flex gap-1.5 font-sans">
                <input
                  type="text"
                  placeholder="Thêm web (e.g. facebook.com)"
                  value={newBlacklistInput}
                  onChange={(e) => setNewBlacklistInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = newBlacklistInput.trim().toLowerCase();
                      if (val && !blacklistedWebsites.includes(val)) {
                        setBlacklistedWebsites(prev => [...prev, val]);
                        setNewBlacklistInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = newBlacklistInput.trim().toLowerCase();
                    if (val && !blacklistedWebsites.includes(val)) {
                      setBlacklistedWebsites(prev => [...prev, val]);
                      setNewBlacklistInput('');
                    }
                  }}
                  className="px-2 bg-indigo-50 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-black shrink-0"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Quick store with XP */}
            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Zap className="text-amber-500 w-3.5 h-3.5 fill-amber-500 shrink-0" />
                <span className="text-[11px]">Đổi 50 XP lấy {lockerRewardMinutes} phút thoải mái</span>
              </div>
              <button
                type="button"
                disabled={stats.xp < 50}
                onClick={() => {
                  if (stats.xp >= 50) {
                    setStats(prev => ({ ...prev, xp: prev.xp - 50 }));
                    setWebMinutesRemaining(prev => prev + lockerRewardMinutes);
                    alert(`🎁 Quy đổi thành công! Trừ 50 XP để đổi lại +${lockerRewardMinutes} phút sử dụng.`);
                  } else {
                    alert("⚠️ Bạn cần tối thiểu 50 XP để quy đổi phút nghỉ ngơi!");
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-lg font-bold text-[10px] text-indigo-600 shadow-xs transition disabled:opacity-50"
              >
                Quy Đổi
              </button>
            </div>

            {/* Browser Real Sandbox Guard Information guide banner */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-[10px] select-all font-mono leading-relaxed">
              <span className="text-indigo-400 font-extrabold uppercase text-[10px] block">🖥️ Ý TƯỞNG THỰC TẾ & BẢN CHẤT CHẶN:</span>
              <p className="text-slate-400 leading-normal">
                Do quy chuẩn bảo mật (Browser Sandbox), mã web không thể tự ý đóng tab trình duyệt khác của bạn. Để chặn thực sự {blacklistedWebsites.slice(0, 3).join(', ')}... hãy tạo một Chrome Extension nhỏ chứa mã nguồn dưới đây:
              </p>
              <div className="bg-black/40 p-2 rounded-lg text-[9px] text-indigo-300 max-h-36 overflow-y-auto">
                {"// extension background.js\n"}
                {"const BLOCKED = [" + blacklistedWebsites.map(s => `"${s}"`).join(', ') + "];\n"}
                {"chrome.webNavigation.onBeforeNavigate.addListener((d) => {\n"}
                {"  const url = new URL(d.url);\n"}
                {"  if (BLOCKED.some(site => url.hostname.includes(site))) {\n"}
                {"    // Check if remaining minutes are expired\n"}
                {"    const minsLeft = parseInt(localStorage.getItem('linguai_web_minutes_left') || '0', 10);\n"}
                {"    if (minsLeft <= 0) {\n"}
                {"      chrome.tabs.update(d.tabId, { url: '" + window.location.origin + "' });\n"}
                {"    }\n"}
                {"  }\n"}
                {"});"}
              </div>
              <p className="text-[9px] text-slate-500 italic">
                *(Vị thế tự giác cao: Khi hết giờ, ứng dụng LinguAI sẽ lập tức hiển thị màn hình khóa cưỡng chế đầy màn hình không cho bạn học tiếp cho tới khi vượt điểm mục tiêu!)*
              </p>
            </div>
          </div>

          {/* Gamification Dashboard Block */}
          <div className="mt-6 border-t border-dashed border-slate-200 pt-6">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">TIẾN TRÌNH THÀNH HOẠT</div>
            <GamificationDashboard stats={stats} />
          </div>

        </aside>

      </div>

      {/* 3. FOOTER SIGNATURES */}
      <footer className="py-4 border-t border-slate-100/80 bg-white text-center text-xs text-slate-400 font-medium mt-6">
        LinguAI &copy; {new Date().getFullYear()} &mdash; Đánh giá phát âm bằng AI thế hệ mới Trung - Nhật - Hàn chuẩn xác nhất.
      </footer>

      {/* 4. MODAL: ONSCREEN INTERACTIVE USER SETTINGS PROFILE FORM */}
      <AnimatePresence>
        {showCustomizeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-lg p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm"
              >
                &times;
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Thiết Lập Tài Khoản Rèn Giọng</h3>
                  <p className="text-xs text-slate-400">Điều chỉnh danh tính, ngôn ngữ học tập và mục tiêu</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* 1. Student Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tên của học viên</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm transition-all text-slate-800 font-medium"
                    placeholder="Nhập tên của bạn dòng..."
                  />
                </div>

                {/* 2. Choose Study target language */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ngôn ngữ cần rèn giọng</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { code: 'ja', label: '🇯🇵 Tiếng Nhật' },
                      { code: 'zh', label: '🇨🇳 Tiếng Trung' },
                      { code: 'ko', label: '🇰🇷 Tiếng Hàn' },
                      { code: 'en', label: '🇺🇸 Tiếng Anh' }
                    ].map((lOpt) => (
                      <button
                        key={lOpt.code}
                        type="button"
                        onClick={() => setTempProfile(p => ({ ...p, language: lOpt.code as any }))}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                          tempProfile.language === lOpt.code
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {lOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Choose Level */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Trình độ thực tại</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'Moi_Bat_Dau', label: 'Sơ Cấp' },
                      { val: 'Trung_Cap', label: 'Trung Cấp' },
                      { val: 'Nang_Cao', label: 'Nâng Cao' }
                    ].map((lv) => (
                      <button
                        key={lv.val}
                        type="button"
                        onClick={() => setTempProfile(p => ({ ...p, level: lv.val as any }))}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                          tempProfile.level === lv.val
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {lv.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Choose Goal */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Mục tiêu học tập hàng đầu</label>
                  <select
                    value={tempProfile.goal}
                    onChange={(e) => setTempProfile(p => ({ ...p, goal: e.target.value as any }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-700 transition"
                  >
                    <option value="Giao_Tiep_Hang_Ngay">Giao tiếp thường nhật hằng ngày</option>
                    <option value="Cong_Viec_Thuong_Mai">Ưu thế kinh doanh thương mại công sở</option>
                    <option value="Du_Lich_Kham_Pha">Du lịch văn hóa khám phá ẩm thực</option>
                    <option value="Khao_Thi_Chung_Chi">Luyện thi chứng chỉ quốc tế (JLPT/HSK/TOPIK)</option>
                  </select>
                </div>

                {/* Form Action buttons */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomizeModal(false)}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition"
                  >
                    Bỏ Qua
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lưu Thay Đổi
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL: FULL PULL/IMPORT FROM ANKI DECK DIALOG */}
      <AnimatePresence>
        {showAnkiImportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-left border border-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAnkiImportModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm"
              >
                &times;
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  <FolderDown className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">Lấy dữ liệu từ Deck Anki</h3>
                  <p className="text-xs text-slate-400">Chọn bộ thẻ (deck) rèn luyện trên ứng dụng Anki cục bộ</p>
                </div>
              </div>

              {isFetchingDecks ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">Đang liên kết với phần mềm Anki Desktop...</span>
                </div>
              ) : ankiDecks.length === 0 ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
                    ⚠️ <b>Không tìm thấy liên kết AnkiConnect:</b> Hệ thống không thể liên hệ được với Anki Desktop tại địa chỉ <code>http://localhost:8765</code>. Nhấn nút kiểm tra hoặc thiết lập để tiếp tục.
                  </div>
                  <div className="text-xs text-slate-500 space-y-2 border-l-2 border-slate-200 pl-3">
                    <p><b>Các bước xử lý nhanh:</b></p>
                    <p>1. Hãy chắc chắn phần mềm <b>Anki Desktop</b> đang khởi chạy trên máy của bạn.</p>
                    <p>2. Đảm bảo add-on <b>AnkiConnect</b> đã được cài đặt. Thêm bằng mã: <code>2055492159</code> trong mục <span className="font-semibold">Tools &gt; Add-ons &gt; Get Add-ons</span>.</p>
                    <p>3. Khởi động lại Anki Desktop rồi thử lại.</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => setShowAnkiImportModal(false)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleFetchAnkiDecks}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Thử kết nối lại
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Chọn bộ thẻ (Deck)</label>
                    <select
                      value={selectedAnkiDeck}
                      onChange={(e) => setSelectedAnkiDeck(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none text-xs text-slate-800 font-bold transition-all"
                    >
                      {ankiDecks.map((deck) => (
                        <option key={deck} value={deck}>
                          📦 {deck}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Phương thức hoạt động:</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      LinguAI tự động phân rã các thẻ trong bộ thẻ đã chọn. Mặt trước được trích lọc để luyện khẩu âm bằng AI, mặt sau dùng làm nghĩa đại diện. Dữ liệu mới sẽ được thêm ngay vào danh sách <b>Sổ tay từ {activeLang === 'zh' ? 'Trung' : activeLang === 'ja' ? 'Nhật' : activeLang === 'ko' ? 'Hàn' : 'Anh'}</b> của bạn!
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => setShowAnkiImportModal(false)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-500 transition"
                    >
                      Bỏ qua
                    </button>
                    <button
                      onClick={handleImportFromAnkiDeck}
                      disabled={isImportingCards}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition shadow-lg shadow-indigo-100"
                    >
                      {isImportingCards ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang nhập khẩu...
                        </>
                      ) : (
                        <>
                          <FolderDown className="w-3.5 h-3.5" /> Nhập từ vựng ngay
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN FOCUS WEB BLOCKER OVERLAY */}
      <AnimatePresence>
        {isWebLockerActivated && webMinutesRemaining === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-xl p-6 md:p-10 shadow-2xl relative text-left overflow-y-auto max-h-[90vh] space-y-6">
              
              {/* Alert symbol */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
                    MÀN HÌNH KHÓA TẬP TRUNG
                  </h2>
                  <p className="text-xs text-rose-400 font-bold uppercase tracking-widest leading-none mt-1">
                    🚫 Hết thời gian lướt web tự do trong ngày!
                  </p>
                </div>
              </div>

              {/* Explain */}
              <div className="space-y-2">
                <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                  Chế độ khóa tự giác đã được kích hoạt thành công trên LinguAI. Toàn bộ quyền truy cập vào các trang giải trí bạn chọn ({blacklistedWebsites.join(', ')}) đã tạm thời ngừng cung cấp để giúp bạn học tập trung tuyệt đối.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Để nhận thêm <strong>+{lockerRewardMinutes} phút</strong> lướt web tự do, hãy luyện phát âm chuẩn miệng câu chuẩn dưới đây đạt từ <strong>{lockerTargetScore} điểm trở lên</strong>. Học càng nhiều sẽ tích lũy được càng nhiều phút lướt mạng!
                </p>
              </div>

              {/* Active Lesson practice pod right inside the overlay */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 text-center">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block text-left">Bài học cần nói để nạp thời gian:</span>
                
                <h3 className="text-3xl font-black text-white leading-normal tracking-tight font-sans">
                  {activeLesson.nativeText}
                </h3>
                <p className="text-sm font-bold font-mono text-pink-400">
                  {activeLesson.phonetic}
                </p>
                <p className="text-xs text-slate-400 italic">
                  &ldquo;{activeLesson.translation}&rdquo;
                </p>

                {/* Recorder UI reuse inside lock screen */}
                <div className="pt-4 border-t border-slate-900 flex items-center justify-center gap-4">
                  
                  {/* Speaker */}
                  <button
                    type="button"
                    onClick={handlePlayModelTTS}
                    className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 hover:bg-indigo-950 hover:border-indigo-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Nghe chuẩn phát âm"
                  >
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                  </button>

                  <div className="w-[1px] h-6 bg-slate-800" />

                  {/* Mic */}
                  <AudioRecorder 
                    onRecordingComplete={handleRecordingDone} 
                    langCode={activeLang}
                  />

                  {/* AI score evaluating triggers */}
                  {currentRecordedBase64 && !activeEvaluation && (
                    <button
                      type="button"
                      onClick={handleEvaluateAudioWithAI}
                      disabled={isEvaluating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs tracking-tight rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-indigo-900"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Chấm điểm...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Gửi Chấm Điểm AI 🎙️
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Display evaluation result inline if exists */}
                {activeEvaluation && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-left text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Điểm số đạt được:</span>
                      <span className={`font-mono text-sm font-black ${activeEvaluation.overallScore >= lockerTargetScore ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {activeEvaluation.overallScore} / 100đ
                      </span>
                    </div>
                    {activeEvaluation.overallScore < lockerTargetScore ? (
                      <p className="text-[10px] text-red-400 leading-tight">
                        ⚠️ Chưa đạt mục tiêu {lockerTargetScore} điểm (Bạn đạt {activeEvaluation.overallScore}đ). Vui lòng nói lại to và rõ ràng hơn để mở khóa nhé!
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-400 leading-tight">
                        🎉 Tuyệt vời! Bạn đã vượt mục tiêu {lockerTargetScore} điểm. Được tặng +{lockerRewardMinutes} phút lướt web tự do!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Fast alternative actions: Redeem XP or Toggle off discipline locks with a warnings */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={stats.xp < 50}
                  onClick={() => {
                    if (stats.xp >= 50) {
                      setStats(prev => ({ ...prev, xp: prev.xp - 50 }));
                      setWebMinutesRemaining(lockerRewardMinutes);
                      alert(`🎁 Đã sử dụng 50 XP quy đổi lấy +${lockerRewardMinutes} phút lướt web! Hệ thống đã tự động được mở khóa.`);
                    }
                  }}
                  className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-black rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ĐỔI 50 XP LẤY +{lockerRewardMinutes} PHÚT
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsWebLockerActivated(false);
                    setWebMinutesRemaining(lockerRewardMinutes);
                    alert("📴 Chế độ tập trung khóa đã được tắt tạm thời. Hãy cố gắng tự giác hơn vào lần học tiếp theo!");
                  }}
                  className="py-3 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition border border-dashed border-slate-800"
                >
                  🔓 Tắt Khóa Tự Giác
                </button>
              </div>

              {/* Live status loading spinner inside screen */}
              {isEvaluating && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-[32px] flex flex-col items-center justify-center p-8 z-35 space-y-4">
                  <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono tracking-wide animate-pulse">{evaluationStateMsg}</p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys Modal */}
      <AnimatePresence>
        {showApiKeysModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 xl:p-0"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Quản lý API Keys</h2>
                    <p className="text-sm text-slate-500 font-medium">Thêm nhiều API Keys và xoay vòng sử dụng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiKeysModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Form Add */}
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Thêm API Mới</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Tên gợi nhớ (VD: Key 1)" 
                      value={newApiName}
                      onChange={(e) => setNewApiName(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Nhập API Key (AI Studio)" 
                      value={newApiValue}
                      onChange={(e) => setNewApiValue(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newApiName || !newApiValue) {
                        alert("Vui lòng nhập đủ Tên và API Key!");
                        return;
                      }
                      setApiKeys(prev => [...prev, { key: newApiValue, name: newApiName, status: 'untested' }]);
                      setNewApiName('');
                      setNewApiValue('');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào danh sách
                  </button>
                </div>

                {/* API List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Danh sách Keys</h3>
                  
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      Chưa có API Key nào được thêm. Hệ thống sẽ dùng key mặc định trên Server.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {apiKeys.map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${activeApiKey === item.key ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                              {activeApiKey === item.key && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black tracking-wider uppercase">
                                  Đang Dùng
                                </span>
                              )}
                              
                              {/* Status Badge */}
                              {item.status === 'valid' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black tracking-wider uppercase">Hoạt Động</span>}
                              {item.status === 'invalid' && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-black tracking-wider uppercase">Lỗi / Hết Hạn</span>}
                              {item.status === 'testing' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-black tracking-wider uppercase flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Đang Test</span>}
                            </div>
                            <div className="font-mono text-xs text-slate-500 truncate pr-4">
                              {item.key.substring(0, 8)}...{item.key.substring(item.key.length - 4)}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={async () => {
                                // Set testing status
                                const updated = [...apiKeys];
                                updated[idx].status = 'testing';
                                setApiKeys(updated);

                                try {
                                  const res = await fetch('/api/test-key', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ apiKey: item.key })
                                  });
                                  const data = await res.json();
                                  
                                  const finished = [...apiKeys];
                                  if (data.success) {
                                    finished[idx].status = 'valid';
                                    alert(`Test Thành Công! AI trả lời: ${data.response}`);
                                  } else {
                                    finished[idx].status = 'invalid';
                                    alert(`Key không hợp lệ: ${data.error}`);
                                  }
                                  setApiKeys(finished);
                                } catch (err: any) {
                                  const failed = [...apiKeys];
                                  failed[idx].status = 'invalid';
                                  setApiKeys(failed);
                                  alert(`Lỗi mạng: ${err.message}`);
                                }
                              }}
                              disabled={item.status === 'testing'}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-bold transition disabled:opacity-50"
                            >
                              Kiểm tra
                            </button>
                            
                            <button
                              onClick={() => {
                                if (activeApiKey === item.key) {
                                  setActiveApiKey('');
                                } else {
                                  setActiveApiKey(item.key);
                                }
                              }}
                              className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeApiKey === item.key ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                              {activeApiKey === item.key ? 'Gỡ Bỏ' : 'Sử Dụng'}
                            </button>

                            <button
                              onClick={() => {
                                const confirm = window.confirm("Bạn có chắc chắn xóa Key này?");
                                if (confirm) {
                                  const updated = apiKeys.filter((_, i) => i !== idx);
                                  setApiKeys(updated);
                                  if (activeApiKey === item.key) {
                                    setActiveApiKey('');
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowApiKeysModal(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors w-full sm:w-auto"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

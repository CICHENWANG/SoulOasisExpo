import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CommonActions, TabActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSkin } from '../../../app/providers/SkinProvider';
import { useStress } from '../../../app/providers/StressProvider';
import { chatApi } from '../../../services/chat/chatApi';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatHome'>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ChatSessionIndexItem = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

type ChatMode =
  | 'general'
  | 'stress'
  | 'sleep'
  | 'study'
  | 'relationship'
  | 'emotion'
  | 'breathing'
  | 'procrastination'
  | 'selfDoubt';

type ChatContext = {
  mode: ChatMode;
  step: number;
  lastScore?: number;
  lastQuestion?:
    | 'breathing_check'
    | 'impact'
    | 'controllable'
    | 'small_help'
    | 'sleep_type'
    | 'study_focus'
    | 'relationship_focus'
    | 'emotion_focus';
};

function id() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sessionStorageKey(sessionId: string) {
  return `chat:session:${sessionId}`;
}

const SESSIONS_INDEX_KEY = 'chat:sessions:index';

async function loadSessionIndex(): Promise<ChatSessionIndexItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.id === 'string')
      .map((x) => ({
        id: String(x.id),
        title: String(x.title ?? ''),
        preview: String(x.preview ?? ''),
        updatedAt: Number(x.updatedAt ?? 0),
      }))
      .filter((x) => x.id);
  } catch {
    return [];
  }
}

async function saveSessionIndex(list: ChatSessionIndexItem[]) {
  try {
    await AsyncStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(list));
  } catch {
  }
}

function buildPreview(list: ChatMessage[]) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const m = list[i];
    if (!m) continue;
    const cleaned = sanitizeChatMessageText(String(m.text ?? ''), m.role);
    if (cleaned) return cleaned.slice(0, 80);
  }
  return '';
}

async function upsertSessionIndex(item: ChatSessionIndexItem) {
  const list = await loadSessionIndex();
  const next = [item, ...list.filter((x) => x.id !== item.id)]
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, 50);
  await saveSessionIndex(next);
}

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

function sanitizeChatMessageText(text: string, role: ChatMessage['role']) {
  const cleaned = stripCjk(text ?? '').trim();
  if (cleaned) return cleaned;
  if (!text?.trim()) return '';
  return role === 'assistant' ? '[Non-English response removed]' : '[Non-English message removed]';
}

function ensureEnglishOrFallback(input: string | undefined | null, fallback: string) {
  const cleaned = stripCjk((input ?? '').toString()).trim();
  return cleaned ? cleaned : fallback;
}

function mockReply(text: string, ctx: ChatContext) {
  const t = text.trim();
  const lower = t.toLowerCase();

  const next: ChatContext = { ...ctx };

  const isHelp = /^help$/i.test(t);
  if (isHelp) {
    return {
      reply:
        'You can talk about:\n1) A 0-10 stress score (e.g., 7)\n2) Sleep: insomnia / trouble falling asleep / waking up early\n3) Study: homework / exams / pressure\n4) Relationships: boundaries / conflict / overthinking\n5) Emotions: sadness / overwhelm / burnout\nTip: tap the "+" button for topic suggestions / new chat / history / clear chat.',
      next,
    };
  }

  if (ctx.mode === 'stress' && ctx.step === 1) {
    if (ctx.lastQuestion === 'breathing_check') {
      const positive = /(better|a bit|relax|relaxed|calm|calmer|okay|ok|good|yes)/i.test(lower);
      const negative = /(no|not|worse|hard|harder|didn\s*'?t help|doesn\s*'?t help|nothing)/i.test(lower);

      next.lastQuestion = 'impact';
      next.step = 1;

      if (positive) {
        return {
          reply:
            'Nice—even a small shift matters. What is the one thing affecting you the most right now? One sentence is enough.',
          next,
        };
      }
      if (negative) {
        return {
          reply:
            "That's okay—sometimes it's hard to relax on demand. Let's switch gears: what is the one thing affecting you the most right now? We'll break it down together.",
          next,
        };
      }

      return {
        reply:
          "Got it. Let's focus on the situation itself: what is the one thing affecting you the most right now?",
        next,
      };
    }

    if (ctx.lastQuestion === 'small_help') {
      next.lastQuestion = 'impact';
      next.step = 1;
      return {
        reply: 'Sure. What is the one thing affecting you the most right now? One sentence is enough.',
        next,
      };
    }

    if (ctx.lastQuestion === 'impact') {
      next.step = 2;
      next.lastQuestion = 'controllable';
      return {
        reply:
          "Thanks for being specific. Let's split it into controllable vs. uncontrollable:\nA) What is one small part you can directly control?\nB) What parts are outside your control?\nYou can answer A or B first.",
        next,
      };
    }

    next.step = 1;
    next.lastQuestion = 'impact';
    return {
      reply:
        "Let's narrow it down:\n1) What's your stress level right now (0-10)?\n2) Or in one sentence: what's affecting you the most right now?",
      next,
    };
  }

  if (ctx.mode === 'stress' && ctx.step === 2) {
    next.mode = 'general';
    next.step = 0;
    next.lastQuestion = undefined;
    return {
      reply:
        "Great. Let's take one tiny action on the controllable part:\n1) Write 3 next steps (<10 minutes each)\n2) Do 2 rounds of breathing (inhale 4 / exhale 6)\n3) Say one kinder sentence to yourself\nWhich one do you want to try first?",
      next,
    };
  }

  if (ctx.mode === 'sleep' && ctx.step === 1) {
    next.step = 2;
    return {
      reply:
        'To be more precise, which one fits you best?\n1) Trouble falling asleep\n2) Waking up during the night / waking up too early\n3) Lots of dreams\nReply 1/2/3 or describe it in your own words.',
      next,
    };
  }

  if (ctx.mode === 'sleep' && ctx.step === 2) {
    next.step = 0;
    return {
      reply:
        'Thanks. Quick check:\n- What time do you usually go to bed, and roughly how long does it take to fall asleep?\n- In the 2 hours before bed, any caffeine or heavy screen time?\nAnswer either one.',
      next,
    };
  }

  if (ctx.mode === 'study' && ctx.step === 1) {
    next.step = 2;
    return {
      reply:
        "Let's structure it in 2 minutes:\n1) What's the most urgent task right now?\n2) What's the deadline?\n3) How long do you think it will take?\nYou can answer 1/2/3.",
      next,
    };
  }

  if (ctx.mode === 'study' && ctx.step === 2) {
    next.step = 0;
    return {
      reply:
        "Great. Let's make a tiny executable plan:\n- Break the task into 3 steps (15-25 minutes each)\n- Pick a starter action for step 1 (open the doc / outline / write the first sentence)\nWrite your 3 steps and I'll help you make them easier to complete.",
      next,
    };
  }

  if (ctx.mode === 'relationship' && ctx.step === 1) {
    next.step = 2;
    return {
      reply:
        "Pick a direction:\n1) You worry about what the other person thinks of you\n2) You are not sure how to express a boundary\n3) You tend to over-give in relationships\nReply 1/2/3 and we'll continue from there.",
      next,
    };
  }

  if (ctx.mode === 'relationship' && ctx.step === 2) {
    next.step = 0;
    return {
      reply:
        "Let's make it easier to express:\n- Fact: what happened (no judgment)\n- Feeling: I feel...\n- Need/boundary: I need... / I would like...\nWrite one sentence for the Fact and I'll help you craft the rest into a message you can send.",
      next,
    };
  }

  if (ctx.mode === 'emotion' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        'Thank you for sharing. Quick emotion check-in:\n1) Where do you feel it in your body? (chest / stomach / throat / head)\n2) Which label fits best: sadness / fear / anger / shame / exhaustion?\nYou can answer either one first.',
      next,
    };
  }

  if (ctx.mode === 'breathing' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        "Well done. Rate your tension from 0-10. If you'd like, also tell me: what are you most worried about right now?",
      next,
    };
  }

  if (ctx.mode === 'procrastination' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        'Procrastination is often about a high start-up cost, not laziness. Let\'s shrink it: turn your task into a 2-minute action (e.g., open the doc and write a title). What are you trying to do? I\'ll help you make a 2-minute version.',
      next,
    };
  }

  if (ctx.mode === 'selfDoubt' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        'I hear the self-doubt. Try this: write 1 tiny thing you did okay (even small) + 1 direction you are trying to improve. Want to share one of them?',
      next,
    };
  }

  if (/^(10|[0-9])$/.test(lower)) {
    const score = Number(lower);
    if (Number.isFinite(score) && score >= 0 && score <= 10) {
      next.mode = 'stress';
      next.step = 1;
      next.lastScore = score;
      if (score <= 3) {
        next.lastQuestion = 'small_help';
        return {
          reply: 'That sounds manageable. What is one small thing you want help with right now?',
          next,
        };
      }
      if (score <= 7) {
        next.lastQuestion = 'breathing_check';
        return {
          reply:
            "Thanks for the number. Let's do a 30-second reset: inhale 4s, hold 2s, exhale 6s. After that, do you feel any change?",
          next,
        };
      }
      next.lastQuestion = 'impact';
      return {
        reply:
          "That's a high score—I'm glad you're here. Let's shrink the target: what is the one thing affecting you the most today?",
        next,
      };
    }
  }

  if (/(sleep|insomnia|nightmare|dream)/i.test(lower)) {
    next.mode = 'sleep';
    next.step = 1;
    next.lastQuestion = 'sleep_type';
    return {
      reply:
        'I hear sleep has been hard. What type fits you best (trouble falling asleep / waking up at night / waking up early / lots of dreams)?',
      next,
    };
  }

  if (/(stress|anxiety|anxious|panic|nervous|tense)/i.test(lower)) {
    next.mode = 'stress';
    next.step = 1;
    next.lastQuestion = 'impact';
    return {
      reply:
        "It sounds like your stress/anxiety is high. Let's locate it quickly:\n1) What's your stress right now (0-10)?\n2) Or in one sentence: what's affecting you the most right now?",
      next,
    };
  }

  if (/(study|homework|exam|school|assignment|deadline)/i.test(lower)) {
    next.mode = 'study';
    next.step = 1;
    next.lastQuestion = 'study_focus';
    return {
      reply:
        "When study pressure is high, your brain stays in 'alarm mode'. What's hardest right now: not enough time, low efficiency, or worrying about the result?",
      next,
    };
  }

  if (/(relationship|friend|friends|classmate|partner|family|boundary|conflict|social)/i.test(lower)) {
    next.mode = 'relationship';
    next.step = 1;
    next.lastQuestion = 'relationship_focus';
    return {
      reply:
        'Relationships can be exhausting. Are you more stuck on "what do they think of me" or "I do not know how to set my boundary"?',
      next,
    };
  }

  if (/(sad|down|depressed|overwhelmed|cry|breakdown|upset|hurt|numb|burnout)/i.test(lower)) {
    next.mode = 'emotion';
    next.step = 1;
    next.lastQuestion = 'emotion_focus';
    return {
      reply:
        'It takes courage to say this. Does it feel more like sadness, or more like exhaustion/numbness? If you can, rate it 0-10.',
      next,
    };
  }

  if (/(breath|breathing|relax|relaxation|calm)/i.test(lower)) {
    next.mode = 'breathing';
    next.step = 1;
    return {
      reply:
        'Okay. Let\'s do a 1-minute breathing reset:\n- Inhale 4 seconds\n- Hold 2 seconds\n- Exhale 6 seconds\nRepeat 4 rounds.\nAfter that, where do you feel the most tension in your body?',
      next,
    };
  }

  if (/procrastinat/i.test(lower)) {
    next.mode = 'procrastination';
    next.step = 1;
    return {
      reply:
        "I hear you're stuck in procrastination. Let's not blame yourself—let's find the hardest first step. What do you want to finish but can't get started on?",
      next,
    };
  }

  if (/(self\s*-?doubt|not\s+good\s+enough|i\s*am\s*not\s*good\s*enough|i\s*'?m\s*not\s*good\s*enough|i\s*will\s*fail)/i.test(lower)) {
    next.mode = 'selfDoubt';
    next.step = 1;
    return {
      reply:
        'Self-doubt can be exhausting. What is the sentence you keep telling yourself lately? (e.g., "I\'m not good enough", "I\'ll fail", "I can\'t do it")',
      next,
    };
  }

  if (t.length <= 8) {
    return {
      reply:
        'I\'m here. Let\'s slow the breath: inhale 4 seconds, exhale 6 seconds. Want to do two rounds with me? (reply "yes" or "continue")',
      next,
    };
  }

  next.mode = 'general';
  next.step = 0;
  next.lastQuestion = undefined;
  return {
    reply:
      'Thanks for sharing. To understand you better: what part affects you the most, and what are you most worried might happen? (You can also type "help".)',
    next,
  };
}

export function ChatHomeScreen({ navigation, route }: Props) {
  const initialMessages = useMemo<ChatMessage[]>(
    () => [{ id: id(), role: 'assistant', text: "Hi, I'm here. What happened today?" }],
    [],
  );

  const sessionId = route.params?.sessionId ?? 'default';
  const sessionTitle = ensureEnglishOrFallback(route.params?.title, 'Chat');

  const { accessToken } = useAuth();
  const { stressScore } = useStress();

  const { skinSource } = useSkin();

  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [topicSuggestionsVisible, setTopicSuggestionsVisible] = useState(false);

  const messagesRef = useRef<ChatMessage[]>(initialMessages);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [chatCtx, setChatCtx] = useState<ChatContext>({ mode: 'general', step: 0 });

  const listRef = useRef<FlatList<ChatMessage> | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingFullTextRef = useRef<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const stopStreaming = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamingMessageIdRef.current = null;
    streamingFullTextRef.current = '';
    setIsStreaming(false);
  };

  useEffect(() => {
    const load = async () => {
      stopStreaming();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      try {
        const raw = await AsyncStorage.getItem(sessionStorageKey(sessionId));
        if (raw) {
          const parsed = JSON.parse(raw) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed
              .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
              .map((m) => ({
                ...m,
                text: sanitizeChatMessageText(String(m.text ?? ''), m.role),
              }))
              .filter((m) => !!m.text.trim());
            if (sanitized.length > 0) {
              messagesRef.current = sanitized;
              setMessages(sanitized);
              setInput('');
              setChatCtx({ mode: 'general', step: 0 });
              await upsertSessionIndex({
                id: sessionId,
                title: ensureEnglishOrFallback(sessionTitle, 'Chat'),
                preview: buildPreview(sanitized),
                updatedAt: Date.now(),
              });
              return;
            }
            setInput('');
            setChatCtx({ mode: 'general', step: 0 });
            return;
          }
        }
      } catch (e) {
      }

      messagesRef.current = initialMessages;
      setMessages(initialMessages);
      setInput('');
      setChatCtx({ mode: 'general', step: 0 });
      try {
        await AsyncStorage.setItem(sessionStorageKey(sessionId), JSON.stringify(initialMessages));
      } catch (e) {
      }

      await upsertSessionIndex({
        id: sessionId,
        title: ensureEnglishOrFallback(sessionTitle, 'Chat'),
        preview: buildPreview(initialMessages),
        updatedAt: Date.now(),
      });
    };

    void load();
  }, [initialMessages, sessionId, sessionTitle]);

  const createNewChat = () => {
    const newId = id();
    navigation.setParams({ sessionId: newId, title: 'Chat' });
  };

  const clearCurrentChat = () => {
    stopStreaming();
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    messagesRef.current = initialMessages;
    setMessages(initialMessages);
    setInput('');
    setChatCtx({ mode: 'general', step: 0 });

    AsyncStorage.setItem(sessionStorageKey(sessionId), JSON.stringify(initialMessages)).catch(() => {
    });
    void upsertSessionIndex({
      id: sessionId,
      title: ensureEnglishOrFallback(sessionTitle, 'Chat'),
      preview: buildPreview(initialMessages),
      updatedAt: Date.now(),
    });
  };

  const finalizeStreaming = () => {
    const msgId = streamingMessageIdRef.current;
    const full = streamingFullTextRef.current;
    if (msgId && full) {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, text: full } : m)));
    }
    stopStreaming();
  };

  const startStreaming = (assistantId: string, fullText: string) => {
    stopStreaming();
    const safeFullText = sanitizeChatMessageText(fullText, 'assistant');
    streamingMessageIdRef.current = assistantId;
    streamingFullTextRef.current = safeFullText;
    setIsStreaming(true);

    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: safeFullText.slice(0, i) } : m)),
      );
      if (i >= safeFullText.length) {
        stopStreaming();
      }
    }, 34);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isStreaming) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    saveTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem(sessionStorageKey(sessionId), JSON.stringify(messages)).catch(() => {
      });

      void upsertSessionIndex({
        id: sessionId,
        title: ensureEnglishOrFallback(sessionTitle, 'Chat'),
        preview: buildPreview(messages),
        updatedAt: Date.now(),
      });
    }, 220);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [isStreaming, messages, sessionId, sessionTitle]);

  const lastHint = useMemo(() => {
    if (isStreaming) return 'AI is typing…';
    if (messages.length <= 1) return 'Tip: tap "+" for topic suggestions / new chat / history.';
    const last = messages[messages.length - 1];
    if (!last) return '';
    return last.role === 'assistant' ? 'You can add more details.' : 'Thinking…';
  }, [isStreaming, messages]);

  const sendText = (raw: string) => {
    const text = stripCjk(raw).trim();
    if (!text) return;

    if (isStreaming) {
      finalizeStreaming();
    }

    const assistantId = id();
    const { reply: fallbackReply, next } = mockReply(text, chatCtx);
    setChatCtx(next);

    const prev = messagesRef.current;
    const userMessage: ChatMessage = { id: id(), role: 'user', text };
    const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', text: '' };
    const nextMessages = [...prev, userMessage, assistantMessage];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);

    void (async () => {
      try {
        const history = [...prev, userMessage]
          .filter((m) => !!m.text.trim())
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.text }));

        const reply = await chatApi.chat({
          token: accessToken,
          stressScore,
          mode: next.mode,
          messages: history,
        });

        startStreaming(assistantId, reply);
      } catch (e) {
        startStreaming(assistantId, fallbackReply);
      }
    })();
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendText(text);
    setInput('');
  };

  const openMore = () => {
    const options = ['Topic suggestions', 'New chat', 'Chat history', 'Clear chat', 'Cancel'];
    const handleSelect = (buttonIndex?: number) => {
      if (buttonIndex === 0) {
        setTopicSuggestionsVisible(true);
        return;
      }
      if (buttonIndex === 1) {
        createNewChat();
        return;
      }
      if (buttonIndex === 2) {
        navigation.navigate('ChatHistory');
        return;
      }
      if (buttonIndex === 3) {
        Alert.alert('Clear chat?', 'This will reset the current chat messages.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: () => clearCurrentChat() },
        ]);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 4,
          destructiveButtonIndex: 3,
        },
        handleSelect,
      );
      return;
    }

    Alert.alert('More', undefined, [
      { text: options[0], onPress: () => handleSelect(0) },
      { text: options[1], onPress: () => handleSelect(1) },
      { text: options[2], onPress: () => handleSelect(2) },
      { text: options[3], style: 'destructive', onPress: () => handleSelect(3) },
      { text: options[4], style: 'cancel' },
    ]);
  };

  const onBack = () => {
    const state: any = navigation.getState?.();
    const canPop = state?.type === 'stack' && typeof state.index === 'number' && state.index > 0;
    if (canPop) {
      navigation.popToTop();
    }

    const action = TabActions.jumpTo('HomeTab');
    let nav: any = navigation;

    for (let i = 0; i < 10 && nav; i += 1) {
      const s = nav.getState?.();
      const hasHomeTab =
        s?.routeNames?.includes?.('HomeTab') || s?.routes?.some?.((r: any) => r?.name === 'HomeTab');
      if (hasHomeTab) {
        const targetKey = s?.key;
        nav.dispatch?.({ ...action, target: targetKey });
        nav.jumpTo?.('HomeTab');
        nav.navigate?.('HomeTab');
        nav.dispatch?.(CommonActions.navigate({ name: 'HomeTab', params: { screen: 'Home' } }));
        return;
      }
      nav = nav.getParent?.();
    }

    let root: any = navigation;
    while (root?.getParent?.()) root = root.getParent();

    root?.dispatch?.(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            state: {
              index: 0,
              routes: [
                {
                  name: 'HomeTab',
                  state: {
                    index: 0,
                    routes: [{ name: 'Home' }],
                  },
                },
              ],
            },
          },
        ],
      }),
    );
  };

  const scrollToBottom = (animated = true) => {
    listRef.current?.scrollToEnd({ animated });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <Modal
        transparent
        animationType="fade"
        visible={topicSuggestionsVisible}
        onRequestClose={() => setTopicSuggestionsVisible(false)}
      >
        <Pressable
          accessibilityRole="button"
          style={styles.modalBackdrop}
          onPress={() => setTopicSuggestionsVisible(false)}
        >
          <Pressable
            accessibilityRole="none"
            style={styles.suggestionCard}
            onPress={() => {
            }}
          >
            <View style={styles.suggestionHeader}>
              <Image source={skinSource} style={styles.suggestionAvatar} />
              <Text style={styles.suggestionTitle}>
                Your mood looks a bit low. For the recent topic “final exam pressure”, you might ask:
              </Text>
            </View>

            {[
              '1. How can I stay focused while revising and not get distracted by anxiety?',
              '2. What can I do right now to reduce exam stress in 10 minutes?',
              '3. How do I make a realistic revision plan when I feel overwhelmed?',
            ].map((t) => (
              <Pressable
                key={t}
                accessibilityRole="button"
                onPress={() => {
                  setInput(t.replace(/^\d+\.\s*/, ''));
                  setTopicSuggestionsVisible(false);
                }}
                style={({ pressed }) => [styles.suggestionItem, pressed && styles.pressed]}
              >
                <Text style={styles.suggestionItemText}>{t}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => onBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backIcon}>{'‹'}</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {sessionTitle}
        </Text>

        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.body}>
          <View style={styles.mascotBg} pointerEvents="none">
            <Image source={skinSource} style={styles.mascotBgImg} resizeMode="contain" />
          </View>

          <FlatList
            ref={(r) => {
              listRef.current = r;
            }}
            data={messages}
            keyExtractor={(m) => m.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => scrollToBottom(false)}
            onLayout={() => scrollToBottom(false)}
            renderItem={({ item }) => {
              const isUser = item.role === 'user';
              return (
                <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}>
                  {!isUser ? <Image source={skinSource} style={styles.avatar} /> : null}
                  <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                    <Text style={styles.bubbleText}>{item.text || ' '}</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>

        <View style={[styles.composerOuter, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={(t) => setInput(stripCjk(t))}
              placeholder="Type a message..."
              placeholderTextColor="#B7B7B7"
              style={styles.textInput}
              returnKeyType="send"
              onSubmitEditing={send}
            />

            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={openMore}
              style={({ pressed }) => [styles.plusBtn, pressed && styles.pressed]}
            >
              <Text style={styles.plusText}>+</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={send}
              disabled={!input.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || pressed) && styles.sendBtnPressed,
              ]}
            >
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>{lastHint}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF2D4',
  },
  flex1: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  header: {
    position: 'relative',
    height: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBE3B1',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 11,
  },
  backIcon: {
    fontSize: 34,
    lineHeight: 34,
    color: '#2B1A0B',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 36,
    color: '#2B1A0B',
    fontWeight: '800',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  body: {
    flex: 1,
  },
  mascotBg: {
    position: 'absolute',
    alignSelf: 'center',
    width: 620,
    height: 620,
    bottom: 60,
    opacity: 0.22,
  },
  mascotBgImg: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 160,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  msgRowAi: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleAi: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  bubbleUser: {
    backgroundColor: '#FFE9B6',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2B1A0B',
  },
  composerOuter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2B1A0B',
    paddingVertical: 0,
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDEDED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '700',
    color: '#666666',
  },
  sendBtn: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 16,
    backgroundColor: '#F5B137',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnPressed: {
    opacity: 0.6,
  },
  sendText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9B4600',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(43,26,11,0.55)',
    paddingHorizontal: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  suggestionCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 18,
    padding: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  suggestionAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  suggestionTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#2B1A0B',
    fontWeight: '700',
  },
  suggestionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0C56E',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  suggestionItemText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2B1A0B',
    fontWeight: '700',
  },
});

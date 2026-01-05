import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
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
import { useSkin } from '../../../app/providers/SkinProvider';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatHome'>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
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

function mockReply(text: string, ctx: ChatContext) {
  const t = text.trim();

  const next: ChatContext = { ...ctx };

  const isHelp = t === '帮助' || t === 'help' || t === 'Help' || t === 'HELP';
  if (isHelp) {
    return {
      reply:
        '你可以聊这些：\n1) 输入 0-10 压力评分（例如 7）\n2) 睡眠：失眠/入睡/早醒\n3) 学习：作业/考试/压力\n4) 人际：关系/内耗/边界\n5) 情绪：低落/难过/崩溃\n也可以点右下角“+”选择【话题建议】或【引导模块】。',
      next,
    };
  }

  if (ctx.mode === 'stress' && ctx.step === 1) {
    if (ctx.lastQuestion === 'breathing_check') {
      const positive = /(有点|好些|放松|舒服|可以|变好)/.test(t);
      const negative = /(没有|不行|更糟|更难|没用)/.test(t);
      if (positive) {
        next.lastQuestion = 'impact';
        next.step = 1;
        return {
          reply:
            '很好，哪怕只有一点点变化也很重要。我们继续往下：现在最影响你的一件事是什么？用一句话描述就好。',
          next,
        };
      }
      if (negative) {
        next.lastQuestion = 'impact';
        next.step = 1;
        return {
          reply:
            '没关系，有时候当下很难立刻放松。我们换一种方式：现在最影响你的一件事是什么？先把它说清楚，我们再一起拆解。',
          next,
        };
      }
      next.lastQuestion = 'impact';
      next.step = 1;
      return {
        reply:
          '收到。先不纠结“有没有变化”，我们把注意力放到问题本身：现在最影响你的一件事是什么？',
        next,
      };
    }

    if (ctx.lastQuestion === 'small_help') {
      next.lastQuestion = 'impact';
      next.step = 1;
      return {
        reply:
          '好的。我们把它落到一个更具体的点：此刻最影响你的一件事是什么？（一句话即可）',
        next,
      };
    }

    if (ctx.lastQuestion === 'impact') {
      next.step = 2;
      next.lastQuestion = 'controllable';
      return {
        reply:
          '谢谢你说得这么具体。我们做个“可控/不可控”划分：\nA) 这件事里你能直接控制的一小部分是什么？\nB) 你无法控制的部分又是什么？\n你先回答 A 或 B 都可以。',
        next,
      };
    }

    next.step = 1;
    next.lastQuestion = 'impact';
    return {
      reply:
        '我们先把它聚焦一下：\n1) 你愿意给此刻压力打个 0-10 分吗？\n2) 或者先用一句话说：现在最影响你的一件事是什么？',
      next,
    };
  }

  if (ctx.mode === 'stress' && ctx.step === 2) {
    next.mode = 'general';
    next.step = 0;
    next.lastQuestion = undefined;
    return {
      reply:
        '很好。接下来我们只做“可控部分”的一个最小动作：\n1) 写下 3 个下一步（每个 < 10 分钟）\n2) 先做 2 轮呼吸（吸 4 / 呼 6）\n3) 给自己一句更温和的自我对话\n你想先选哪一个？',
      next,
    };
  }

  if (ctx.mode === 'sleep' && ctx.step === 1) {
    next.step = 2;
    return {
      reply:
        '明白。为了更精准：你更像是\n1) 入睡困难（躺下很久睡不着）\n2) 半夜醒来/早醒\n3) 做梦多\n回复 1/2/3 或直接描述都行。',
      next,
    };
  }

  if (ctx.mode === 'sleep' && ctx.step === 2) {
    next.step = 0;
    return {
      reply:
        '谢谢你。我们先做一个非常实用的排查：\n- 你一般几点上床？大概多久睡着？\n- 睡前 2 小时有没有咖啡/奶茶/高强度刷手机？\n你先回答其中一个就好。',
      next,
    };
  }

  if (ctx.mode === 'study' && ctx.step === 1) {
    next.step = 2;
    return {
      reply:
        '收到。我们用 2 分钟把它结构化：\n1) 你现在最紧急的 1 个任务是什么？\n2) 截止时间是什么时候？\n3) 你预计需要多长时间？\n按 1/2/3 回答即可。',
      next,
    };
  }

  if (ctx.mode === 'study' && ctx.step === 2) {
    next.step = 0;
    return {
      reply:
        '很好。我们做一个“最小可执行计划”：\n- 先把任务拆成 3 步（每步 15-25 分钟）\n- 先做第 1 步的“启动动作”（打开资料/列提纲/写第一段）\n你愿意把这 3 步写出来吗？我帮你一起改到更容易完成。',
      next,
    };
  }

  if (ctx.mode === 'relationship' && ctx.step === 1) {
    next.step = 2;
    return {
      reply:
        '我懂。先选一个方向：\n1) 你担心“对方怎么看你”\n2) 你不知道怎么表达边界\n3) 你在关系里总是过度付出\n回复 1/2/3，我们就沿着那条线继续。',
      next,
    };
  }

  if (ctx.mode === 'relationship' && ctx.step === 2) {
    next.step = 0;
    return {
      reply:
        '好，我们把表达变得更容易：\n- 事实：发生了什么（不评价）\n- 感受：我感到…\n- 需求/边界：我希望…/我需要…\n你把你的情况用一句“事实”写出来，我帮你把后两句补齐成一段可发送的话。',
      next,
    };
  }

  if (ctx.mode === 'emotion' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        '谢谢你。我们做个情绪识别的收尾：\n1) 这份情绪最像在身体哪个部位？（胸口/胃/喉咙/头）\n2) 它更像“委屈/难过/害怕/愤怒/疲惫”的哪一个？\n你先选一个回答即可。',
      next,
    };
  }

  if (ctx.mode === 'breathing' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        '做得很好。现在给它打个 0-10 分（紧张程度）。如果你愿意，也可以说一句：此刻你最担心的是什么？',
      next,
    };
  }

  if (ctx.mode === 'procrastination' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        '拖延很多时候不是懒，而是“启动成本太高”。我们做个最小化：\n把你要做的事改成一个 2 分钟动作（例如：打开文档写标题/收集 3 条资料）。\n你现在要做的事是什么？我帮你改成 2 分钟版本。',
      next,
    };
  }

  if (ctx.mode === 'selfDoubt' && ctx.step === 1) {
    next.step = 0;
    return {
      reply:
        '我听到你在自我怀疑。我们试一个练习：\n写下 1 件你做得还不错的小事（再小也行）+ 1 个你正在努力的方向。\n你愿意先写其中一个吗？',
      next,
    };
  }

  if (/^(10|[0-9])$/.test(t)) {
    const score = Number(t);
    if (Number.isFinite(score) && score >= 0 && score <= 10) {
      next.mode = 'stress';
      next.step = 1;
      next.lastScore = score;
      if (score <= 3) {
        next.lastQuestion = 'small_help';
        return {
          reply: '听起来压力还在可承受范围里。现在你最希望我帮你做的一件小事是什么？',
          next,
        };
      }
      if (score <= 7) {
        next.lastQuestion = 'breathing_check';
        return {
          reply:
            '谢谢你给出分数。我们先做个 30 秒的放松：吸气 4 秒，停 2 秒，呼气 6 秒。做完后你感觉有变化吗？',
          next,
        };
      }
      next.lastQuestion = 'impact';
      return {
        reply: '这个分数挺高的，辛苦你了。我们先把目标缩小：今天最影响你的一件事是什么？',
        next,
      };
    }
  }

  if (t.includes('睡') || t.includes('失眠') || t.includes('做梦')) {
    next.mode = 'sleep';
    next.step = 1;
    next.lastQuestion = 'sleep_type';
    return {
      reply:
        '我听到你在为睡眠困扰。我们先从类型开始（入睡困难/半夜醒来/早醒/做梦多），你更像哪一种？',
      next,
    };
  }

  if (t.includes('压力') || t.includes('焦虑') || t.includes('紧张')) {
    next.mode = 'stress';
    next.step = 1;
    next.lastQuestion = 'impact';
    return {
      reply:
        '我听到你压力/焦虑有点高。我们先快速定位：\n1) 你愿意给此刻压力打个 0-10 分吗？\n2) 或者用一句话说：现在最影响你的一件事是什么？',
      next,
    };
  }

  if (t.includes('学习') || t.includes('作业') || t.includes('考试')) {
    next.mode = 'study';
    next.step = 1;
    next.lastQuestion = 'study_focus';
    return {
      reply:
        '学习压力大的时候，大脑会一直处于“警报”状态。你现在最卡住的是时间不够、效率下降，还是对结果的担心？',
      next,
    };
  }

  if (t.includes('人际') || t.includes('关系') || t.includes('内耗') || t.includes('同学') || t.includes('朋友')) {
    next.mode = 'relationship';
    next.step = 1;
    next.lastQuestion = 'relationship_focus';
    return {
      reply:
        '在人际关系里内耗真的很累。你更在意的是“对方怎么看我”，还是“我不知道怎么表达我的边界”？',
      next,
    };
  }

  if (t.includes('低落') || t.includes('难过') || t.includes('不开心') || t.includes('崩溃')) {
    next.mode = 'emotion';
    next.step = 1;
    next.lastQuestion = 'emotion_focus';
    return {
      reply:
        '你能把这些说出来已经很不容易了。现在你的情绪更像是“委屈/难过”，还是“疲惫/麻木”？如果方便，给它打个 0-10 分。',
      next,
    };
  }

  if (t.includes('呼吸') || t.includes('放松')) {
    next.mode = 'breathing';
    next.step = 1;
    return {
      reply:
        '好，我们做 1 分钟呼吸放松：\n- 吸气 4 秒\n- 停 2 秒\n- 呼气 6 秒\n重复 4 轮。\n做完告诉我：你身体哪里最紧？',
      next,
    };
  }

  if (t.includes('拖延')) {
    next.mode = 'procrastination';
    next.step = 1;
    return {
      reply:
        '我听到你在被拖延困住。我们先不批评自己，先找到“最难开始的那一步”：你现在最想完成、但一直开始不了的事是什么？',
      next,
    };
  }

  if (t.includes('自我怀疑') || t.includes('不够好')) {
    next.mode = 'selfDoubt';
    next.step = 1;
    return {
      reply: '自我怀疑很折磨人。你最近最常出现的那句自我评价是什么？（例如“我不行/我不够好/我会失败”）',
      next,
    };
  }

  if (t.length <= 8)
    return {
      reply:
        '我在。我们先把呼吸放慢一点：吸气 4 秒，呼气 6 秒。你愿意跟我做两轮吗？（回复“好”或“继续”）',
      next,
    };

  next.mode = 'general';
  next.step = 0;
  next.lastQuestion = undefined;
  return {
    reply:
      '谢谢你愿意说出来。为了更了解你：这件事对你影响最大的部分是什么？你最担心会发生什么？（也可以回复“帮助”）',
    next,
  };
}

const TOPIC_SUGGESTIONS: Array<{ label: string; text: string }> = [
  { label: '压力评分', text: '我现在的压力大概是 7 分（0-10）。' },
  { label: '睡眠困扰', text: '我最近失眠，入睡很困难。' },
  { label: '焦虑紧张', text: '我最近总是很焦虑，脑子停不下来。' },
  { label: '情绪低落', text: '我最近很低落，提不起劲。' },
  { label: '学习/考试', text: '我最近学习压力很大，担心考不好。' },
  { label: '拖延', text: '我总在拖延，明明知道要做但就是开始不了。' },
  { label: '人际关系', text: '我和朋友/同学的关系让我很内耗。' },
  { label: '自我怀疑', text: '我总觉得自己不够好，容易自我怀疑。' },
  { label: '情绪爆发', text: '我最近容易崩溃/想哭，控制不住情绪。' },
  { label: '做个呼吸', text: '我现在有点难受，能带我做 1 分钟呼吸放松吗？' },
];

export function ChatHomeScreen({ navigation }: Props) {
  const initialMessages = useMemo<ChatMessage[]>(
    () => [{ id: id(), role: 'assistant', text: '你好，我在。你可以先说说今天发生了什么。' }],
    [],
  );

  const { skinSource } = useSkin();

  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');

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
    streamingMessageIdRef.current = assistantId;
    streamingFullTextRef.current = fullText;
    setIsStreaming(true);

    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: fullText.slice(0, i) } : m)),
      );
      if (i >= fullText.length) {
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

  const lastHint = useMemo(() => {
    if (isStreaming) return 'AI 正在输入…';
    if (messages.length <= 1)
      return '提示：点“+”选【话题建议/引导模块】；或输入 0-10 分数；也可发送“帮助”。';
    const last = messages[messages.length - 1];
    if (!last) return '';
    return last.role === 'assistant' ? '可以继续补充细节' : '我正在理解…';
  }, [isStreaming, messages]);

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    if (isStreaming) {
      finalizeStreaming();
    }

    const assistantId = id();
    const { reply, next } = mockReply(text, chatCtx);
    setChatCtx(next);

    setMessages((prev) => {
      const userMessage: ChatMessage = { id: id(), role: 'user', text };
      const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', text: '' };
      return [...prev, userMessage, assistantMessage];
    });

    startStreaming(assistantId, reply);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendText(text);
    setInput('');
  };

  const resetChat = () => {
    stopStreaming();
    setMessages(initialMessages);
    setInput('');
    setChatCtx({ mode: 'general', step: 0 });
  };

  const openMore = () => {
    const options = ['话题建议', '引导模块', 'AI形象', '历史对话', '语音沟通', '清空对话', '取消'];

    const openGuideModules = () => {
      const modules: Array<{ label: string; text: string; ctx: ChatContext }> = [
        { label: '情绪识别', text: '我想做情绪识别。', ctx: { mode: 'emotion', step: 1 } },
        { label: '压力拆解', text: '我想把压力拆解一下。', ctx: { mode: 'stress', step: 1 } },
        { label: '呼吸练习', text: '带我做 1 分钟呼吸放松。', ctx: { mode: 'breathing', step: 1 } },
        { label: '睡眠建议', text: '我想改善睡眠，给我一些建议。', ctx: { mode: 'sleep', step: 1 } },
        { label: '学习计划', text: '我想制定一个可执行的学习计划。', ctx: { mode: 'study', step: 1 } },
        { label: '人际边界', text: '我想练习怎么表达边界。', ctx: { mode: 'relationship', step: 1 } },
      ];

      const moduleOptions = [...modules.map((m) => m.label), '取消'];
      const cancelIndex = moduleOptions.length - 1;

      const handleModule = (i?: number) => {
        if (i == null) return;
        if (i < 0 || i >= modules.length) return;
        setChatCtx(modules[i].ctx);
        setInput(modules[i].text);
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: moduleOptions,
            cancelButtonIndex: cancelIndex,
          },
          handleModule,
        );
        return;
      }

      Alert.alert(
        '引导模块',
        '请选择一个模块自动填充到输入框',
        [...modules.map((m, idx) => ({ text: m.label, onPress: () => handleModule(idx) })),
        { text: '取消', style: 'cancel' }],
      );
    };

    const handleSelect = (buttonIndex?: number) => {
      if (buttonIndex === 0) {
        const topicOptions = [...TOPIC_SUGGESTIONS.map((t) => t.label), '取消'];
        const topicCancelIndex = topicOptions.length - 1;

        const handleTopic = (i?: number) => {
          if (i == null) return;
          if (i < 0 || i >= TOPIC_SUGGESTIONS.length) return;
          setInput(TOPIC_SUGGESTIONS[i].text);
        };

        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: topicOptions,
              cancelButtonIndex: topicCancelIndex,
            },
            handleTopic,
          );
          return;
        }

        Alert.alert(
          '话题建议',
          '请选择一个话题自动填充到输入框',
          [...TOPIC_SUGGESTIONS.slice(0, 6).map((t, idx) => ({
            text: t.label,
            onPress: () => handleTopic(idx),
          })), { text: '取消', style: 'cancel' }],
        );
        return;
      }

      if (buttonIndex === 1) {
        openGuideModules();
        return;
      }

      if (buttonIndex === 2) {
        navigation.navigate('Persona');
        return;
      }

      if (buttonIndex === 3) {
        navigation.navigate('ChatHistory');
        return;
      }

      if (buttonIndex === 4) {
        navigation.navigate('VoiceChat');
        return;
      }

      if (buttonIndex === 5) {
        Alert.alert('清空对话', '确定要清空当前对话吗？', [
          { text: '取消', style: 'cancel' },
          { text: '清空', style: 'destructive', onPress: resetChat },
        ]);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 6,
          destructiveButtonIndex: 5,
        },
        handleSelect,
      );
      return;
    }

    Alert.alert('更多', undefined, [
      { text: options[0], onPress: () => handleSelect(0) },
      { text: options[1], onPress: () => handleSelect(1) },
      { text: options[2], onPress: () => handleSelect(2) },
      { text: options[3], onPress: () => handleSelect(3) },
      { text: options[4], onPress: () => handleSelect(4) },
      { text: options[5], style: 'destructive', onPress: () => handleSelect(5) },
      { text: options[6], style: 'cancel' },
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

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => onBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backIcon}>{'‹'}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Chat</Text>

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
              onChangeText={setInput}
              placeholder="Please input here"
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
});

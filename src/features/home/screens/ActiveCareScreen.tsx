import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'ActiveCare'>;

type Task = {
  id: string;
  title: string;
  detail: string;
  category: '身体' | '情绪' | '社交' | '学习';
  done: boolean;
};

type Filter = 'all' | 'todo' | 'done';

const INITIAL: Task[] = [
  { id: 't1', title: '喝一杯温水', detail: '给身体一点补给。', category: '身体', done: false },
  { id: 't2', title: '站起来走 2 分钟', detail: '让注意力回到身体。', category: '身体', done: false },
  {
    id: 't3',
    title: '发一条关心给自己',
    detail: '例如：我已经很努力了。',
    category: '情绪',
    done: false,
  },
  { id: 't4', title: '给朋友/家人发个问候', detail: '保持连接，不必长谈。', category: '社交', done: false },
  { id: 't5', title: '整理桌面 3 分钟', detail: '用环境给自己一点秩序感。', category: '学习', done: false },
];

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ActiveCareScreen({}: Props) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>('all');
  const [energy, setEnergy] = useState<'低' | '中' | '高'>('中');
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newCategory, setNewCategory] = useState<Task['category']>('情绪');

  const doneCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === 'done') return tasks.filter((t) => t.done);
    if (filter === 'todo') return tasks.filter((t) => !t.done);
    return tasks;
  }, [tasks, filter]);

  const toggleDone = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (idToRemove: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== idToRemove));
  };

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    const detail = newDetail.trim() || '为自己做一件小事。';
    const next: Task = {
      id: id('task'),
      title,
      detail,
      category: newCategory,
      done: false,
    };
    setTasks((prev) => [next, ...prev]);
    setNewTitle('');
    setNewDetail('');
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>主动关怀</Text>
        <Text style={styles.subtitle}>用很小的行动，把自己照顾回来。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日清单</Text>
        <Text style={styles.muted}>{`完成 ${doneCount} / ${tasks.length}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="全部"
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onPress={() => setFilter('all')}
            style={styles.flex}
          />
          <PrimaryButton
            title="待完成"
            variant={filter === 'todo' ? 'primary' : 'ghost'}
            onPress={() => setFilter('todo')}
            style={styles.flex}
          />
          <PrimaryButton
            title="已完成"
            variant={filter === 'done' ? 'primary' : 'ghost'}
            onPress={() => setFilter('done')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>状态记录</Text>
        <Text style={styles.muted}>{`精力水平：${energy}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="低"
            variant={energy === '低' ? 'primary' : 'ghost'}
            onPress={() => setEnergy('低')}
            style={styles.flex}
          />
          <PrimaryButton
            title="中"
            variant={energy === '中' ? 'primary' : 'ghost'}
            onPress={() => setEnergy('中')}
            style={styles.flex}
          />
          <PrimaryButton
            title="高"
            variant={energy === '高' ? 'primary' : 'ghost'}
            onPress={() => setEnergy('高')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>新增一条关怀</Text>
        <TextField label="标题" value={newTitle} onChangeText={setNewTitle} placeholder="例如：洗个热水澡" />
        <View style={styles.spacer} />
        <TextField
          label="说明"
          value={newDetail}
          onChangeText={setNewDetail}
          placeholder="写一句更具体的提示（可选）"
        />
        <View style={styles.row}>
          <PrimaryButton
            title="身体"
            variant={newCategory === '身体' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('身体')}
            style={styles.flex}
          />
          <PrimaryButton
            title="情绪"
            variant={newCategory === '情绪' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('情绪')}
            style={styles.flex}
          />
          <PrimaryButton
            title="社交"
            variant={newCategory === '社交' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('社交')}
            style={styles.flex}
          />
          <PrimaryButton
            title="学习"
            variant={newCategory === '学习' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('学习')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton title="添加" onPress={addTask} />
      </Card>

      {visibleTasks.map((t) => (
        <Card key={t.id}>
          <View style={styles.taskTop}>
            <Text style={styles.badge}>{t.category}</Text>
            <PrimaryButton
              title="删除"
              variant="ghost"
              onPress={() => removeTask(t.id)}
              style={styles.smallBtn}
            />
          </View>
          <Text style={styles.taskTitle}>{t.title}</Text>
          <Text style={styles.taskDetail}>{t.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={t.done ? '已完成' : '标记完成'}
              variant={t.done ? 'primary' : 'ghost'}
              onPress={() => toggleDone(t.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>建议</Text>
        <Text style={styles.muted}>
          如果你现在精力较低，可以只完成 1 条关怀任务；完成本身就足够。
        </Text>
        <View style={styles.row}>
          <PrimaryButton
            title="恢复示例清单"
            variant="ghost"
            onPress={() => setTasks(INITIAL)}
            style={styles.flex}
          />
          <PrimaryButton
            title="全部标记完成"
            variant="ghost"
            onPress={() => setTasks((prev) => prev.map((x) => ({ ...x, done: true })))}
            style={styles.flex}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
  spacer: {
    height: 8,
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    color: colors.text,
    fontSize: 12,
    overflow: 'hidden',
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  taskDetail: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});

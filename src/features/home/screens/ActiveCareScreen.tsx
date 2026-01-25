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
  category: 'Body' | 'Emotion' | 'Social' | 'Study';
  done: boolean;
};

type Filter = 'all' | 'todo' | 'done';

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

const INITIAL: Task[] = [
  { id: 't1', title: 'Drink a glass of warm water', detail: 'Give your body some fuel.', category: 'Body', done: false },
  { id: 't2', title: 'Stand up and walk for 2 minutes', detail: 'Bring your attention back to your body.', category: 'Body', done: false },
  {
    id: 't3',
    title: 'Send yourself a kind message',
    detail: 'For example: "I did my best today."',
    category: 'Emotion',
    done: false,
  },
  {
    id: 't4',
    title: 'Send a quick check-in to a friend or family member',
    detail: 'Stay connected—no long talk needed.',
    category: 'Social',
    done: false,
  },
  {
    id: 't5',
    title: 'Tidy your desk for 3 minutes',
    detail: 'Let your space give you a bit of order.',
    category: 'Study',
    done: false,
  },
];

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ActiveCareScreen({}: Props) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>('all');
  const [energy, setEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newCategory, setNewCategory] = useState<Task['category']>('Emotion');

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
    const title = stripCjk(newTitle).trim();
    if (!title) return;
    const detail = stripCjk(newDetail).trim() || 'Do something small for yourself.';
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
        <Text style={styles.title}>Active Care</Text>
        <Text style={styles.subtitle}>Care for yourself with small, doable actions.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Today</Text>
        <Text style={styles.muted}>{`Completed ${doneCount} / ${tasks.length}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="All"
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onPress={() => setFilter('all')}
            style={styles.flex}
          />
          <PrimaryButton
            title="To do"
            variant={filter === 'todo' ? 'primary' : 'ghost'}
            onPress={() => setFilter('todo')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Done"
            variant={filter === 'done' ? 'primary' : 'ghost'}
            onPress={() => setFilter('done')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Check-in</Text>
        <Text style={styles.muted}>{`Energy level: ${energy}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="Low"
            variant={energy === 'Low' ? 'primary' : 'ghost'}
            onPress={() => setEnergy('Low')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Medium"
            variant={energy === 'Medium' ? 'primary' : 'ghost'}
            onPress={() => setEnergy('Medium')}
            style={styles.flex}
          />
          <PrimaryButton
            title="High"
            variant={energy === 'High' ? 'primary' : 'ghost'}
            onPress={() => setEnergy('High')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Add an item</Text>
        <TextField
          label="Title"
          value={newTitle}
          onChangeText={(t) => setNewTitle(stripCjk(t))}
          placeholder="e.g., take a hot shower"
        />
        <View style={styles.spacer} />
        <TextField
          label="Detail"
          value={newDetail}
          onChangeText={(t) => setNewDetail(stripCjk(t))}
          placeholder="Add a more specific note (optional)"
        />
        <View style={styles.row}>
          <PrimaryButton
            title="Body"
            variant={newCategory === 'Body' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('Body')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Emotion"
            variant={newCategory === 'Emotion' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('Emotion')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Social"
            variant={newCategory === 'Social' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('Social')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Study"
            variant={newCategory === 'Study' ? 'primary' : 'ghost'}
            onPress={() => setNewCategory('Study')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton title="Add" onPress={addTask} />
      </Card>

      {visibleTasks.map((t) => (
        <Card key={t.id}>
          <View style={styles.taskTop}>
            <Text style={styles.badge}>{t.category}</Text>
            <PrimaryButton
              title="Delete"
              variant="ghost"
              onPress={() => removeTask(t.id)}
              style={styles.smallBtn}
            />
          </View>
          <Text style={styles.taskTitle}>{t.title}</Text>
          <Text style={styles.taskDetail}>{t.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={t.done ? 'Done' : 'Mark done'}
              variant={t.done ? 'primary' : 'ghost'}
              onPress={() => toggleDone(t.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>Suggestion</Text>
        <Text style={styles.muted}>
          If your energy is low, just complete one item. Showing up is enough.
        </Text>
        <View style={styles.row}>
          <PrimaryButton
            title="Restore sample list"
            variant="ghost"
            onPress={() => setTasks(INITIAL)}
            style={styles.flex}
          />
          <PrimaryButton
            title="Mark all done"
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

import { Image } from 'expo-image';
import { useState } from 'react';
import { Button, Platform, StyleSheet, TextInput } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  // 这里是三个 state，用来存总金额 / 人数 / 结果
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSplit = () => {
    const totalNum = parseFloat(total);
    const peopleNum = parseInt(people, 10);

    if (isNaN(totalNum) || isNaN(peopleNum) || peopleNum <= 0) {
      setResult('请输入有效的金额和人数');
      return;
    }

    const each = (totalNum / peopleNum).toFixed(2);
    setResult(`每人应付：${each} €`);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome, CNMSBBBBB FUCK!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      {/* 这里是 AA 计算小工具 */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">AA 计算小工具</ThemedText>

        <ThemedText>总金额：</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={total}
          onChangeText={setTotal}
          placeholder="例如 120"
        />

        <ThemedText>人数：</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={people}
          onChangeText={setPeople}
          placeholder="例如 3"
        />

        <Button title="计算每人应付" onPress={handleSplit} />

        {result && (
          <ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>
            {result}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

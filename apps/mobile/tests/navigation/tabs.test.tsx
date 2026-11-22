import React, { useState } from 'react';
import { expect, jest, test } from '@jest/globals';
import { Pressable, Text } from 'react-native';
import { renderRouter, screen, fireEvent, testRouter } from 'expo-router/testing-library';
import { Stack } from 'expo-router';
import TabsLayout from '../../src/app/(tabs)/_layout';
import { primaryTabs } from '../../src/navigation/tabs';

jest.mock('../../src/components/morph-renderer', () => ({ MorphIcon: () => null }));
function HomeFixture() {
  const [count, setCount] = useState(0);
  return <Pressable accessibilityRole="button" accessibilityLabel="Increment" onPress={() => setCount(count + 1)}><Text>{`Home count ${count}`}</Text></Pressable>;
}
const context = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': HomeFixture,
  '(tabs)/explore': () => <Text>Explore fixture</Text>,
  '(tabs)/detection': () => <Text>AI fixture</Text>,
  '(tabs)/feed': () => <Text>Community fixture</Text>,
  '(tabs)/profile': () => <Text>Account fixture</Text>,
  'booking/payment': () => <Text>Payment fixture</Text>,
  'destination/[id]': () => <Text>Destination fixture</Text>,
};
test('single metadata source defines exactly five stable existing URLs', () => {
  expect(primaryTabs.map(tab => tab.route)).toEqual(['/', '/explore', '/detection', '/feed', '/profile']);
  expect(new Set(primaryTabs.map(tab => tab.id)).size).toBe(5);
});
test('real tab navigator retains mounted screen state when switching and supports history', async () => {
  await renderRouter(context);
  await fireEvent.press(screen.getByRole('button', { name: 'Increment' }));
  await testRouter.navigate('/explore');
  expect(screen.getByText('Explore fixture')).toBeTruthy();
  await testRouter.navigate('/');
  expect(screen.getByText('Home count 1')).toBeTruthy();
});
test('payment is a root stack route and cold deep-link params are preserved', async () => {
  const view = await renderRouter(context, { initialUrl: '/destination/101' });
  expect(view.getPathname()).toBe('/destination/101');
  expect(view.getSearchParams()).toMatchObject({ id: '101' });
  await testRouter.push('/booking/payment?reviewId=synthetic');
  expect(screen.getByText('Payment fixture')).toBeTruthy();
  expect(screen.queryByText('Explore fixture')).toBeNull();
  await testRouter.back('/destination/101');
});

test('Android-style history back returns to previous tab without resetting local state', async () => {
  await renderRouter(context);
  await fireEvent.press(screen.getByRole('button', { name: 'Increment' }));
  await testRouter.navigate('/explore');
  await testRouter.navigate('/feed');
  await testRouter.back('/explore');
  await testRouter.back('/');
  expect(screen.getByText('Home count 1')).toBeTruthy();
});

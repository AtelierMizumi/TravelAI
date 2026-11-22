import React from 'react';
import { expect, jest, test } from '@jest/globals';
import { Text } from 'react-native';
import { Stack, Tabs, useLocalSearchParams } from 'expo-router';
import { renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';
import { useResource } from '../../src/hooks/use-resource';
import { api } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({ api: jest.fn() }));
const request = jest.mocked(api);
function Resource() {
  const result = useResource<{ name: string }>('/synthetic', 0, true);
  return <Text>{result.data?.name || 'Loading fixture'}</Text>;
}
test('kept-alive tabs retain data while revalidating with the same server contract', async () => {
  request.mockReset();
  request.mockResolvedValueOnce({ name: 'Retained fixture' }).mockImplementation(() => new Promise(() => {}));
  await renderRouter({
    _layout: () => <Stack screenOptions={{ headerShown: false }} />,
    '(tabs)/_layout': () => <Tabs screenOptions={{ headerShown: false }}><Tabs.Screen name="index" /><Tabs.Screen name="other" /></Tabs>,
    '(tabs)/index': Resource,
    '(tabs)/other': () => <Text>Other tab</Text>,
  });
  await waitFor(() => expect(screen.getByText('Retained fixture')).toBeTruthy());
  await testRouter.navigate('/other');
  await testRouter.navigate('/');
  expect(screen.getByText('Retained fixture')).toBeTruthy();
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
});

function ScopedResource() {
  const { owner = 'one' } = useLocalSearchParams<{ owner: string }>();
  const result = useResource<{ name: string }>(`/synthetic/${owner}`, 0, true);
  return <Text>{result.data?.name || 'Loading changed scope'}</Text>;
}
test('changing resource scope clears retained data before revalidation completes', async () => {
  request.mockReset();
  request.mockResolvedValueOnce({ name: 'Previous scope' }).mockImplementation(() => new Promise(() => {}));
  await renderRouter({ index: ScopedResource });
  await waitFor(() => expect(screen.getByText('Previous scope')).toBeTruthy());
  await testRouter.navigate('/?owner=two');
  await waitFor(() => expect(screen.getByText('Loading changed scope')).toBeTruthy());
  expect(screen.queryByText('Previous scope')).toBeNull();
});

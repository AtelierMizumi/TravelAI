import React from 'react';
import { expect, test } from '@jest/globals';
import { Text } from 'react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

test('the SDK58 async router test harness mounts an isolated synthetic route', async () => {
  await renderRouter({ index: () => <Text>Synthetic route</Text> });
  expect(screen.getByText('Synthetic route')).toBeTruthy();
});

import { expect, jest, test } from '@jest/globals';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DepthStage } from '../../src/components/depth-stage';
import { DepthSurface } from '../../src/components/depth-surface';
import { Card, Screen } from '../../src/components/ui';
import { DestinationDeck } from '../../src/components/destination-deck';
import { uxPlaces } from '../fixtures/ux';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { usePathname: () => '/', Link: ({ children }: { children: React.ReactNode }) => typeof children === 'string' ? React.createElement(Text, null, children) : children };
});
jest.mock('../../src/context/auth', () => ({ useAuth: () => ({ user: null, loading: false }) }));
jest.mock('../../src/components/morph-renderer', () => ({ MorphIcon: () => null }));
jest.mock('../../src/components/image-credit', () => ({ ImageCredit: () => null }));

test('root canvas stays neutral and does not observe page-wide touch movement', async () => {
  await render(<DepthStage><Text>Content</Text></DepthStage>);
  expect(StyleSheet.flatten(screen.getByTestId('depth-camera').props.style)?.transform).toBeUndefined();
  expect(screen.getByTestId('depth-viewport').props.onTouchMove).toBeUndefined();
});
test('surfaces keep their content without pointer tilt or layout measurement', async () => {
  await render(<DepthSurface><Text>Surface</Text></DepthSurface>);
  const surface = screen.getByText('Surface').parent!;
  expect(surface.props.onPointerMove).toBeUndefined();
  expect(surface.props.onLayout).toBeUndefined();
});
test('shared screen retains protected content and no global scroll transform under G1 section motion', async () => {
  await render(<DepthStage><Screen title="Static" protected><Card><Text>Private</Text></Card></Screen></DepthStage>);
  let node = screen.getByText('Static').parent;
  while (node) { expect(StyleSheet.flatten(node.props.style)?.transform).toBeUndefined(); expect(node.props.onTouchMove).toBeUndefined(); node = node.parent; }
  expect(screen.getByText('Đăng nhập để tiếp tục.')).toBeTruthy();
  expect(screen.queryByText('Private')).toBeNull();
});
test('explicit deck navigation still selects the actual next destination', async () => {
  await render(<DestinationDeck places={uxPlaces} />);
  expect(screen.getByText('Điểm thử nghiệm A')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Điểm đến tiếp theo' }));
  expect(screen.getByText('Điểm thử nghiệm B')).toBeTruthy();
});

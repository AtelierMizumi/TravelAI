import { expect, test } from '@jest/globals';
import { sectionVisible } from '../../src/services/section-motion';

test('native section visibility requires entry inside the measured scroll viewport', () => {
  expect(sectionVisible(780, 200, 80, 700)).toBe(false);
  expect(sectionVisible(760, 200, 80, 700)).toBe(true);
  expect(sectionVisible(-100, 100, 80, 700)).toBe(false);
  expect(sectionVisible(100, 0, 80, 700)).toBe(false);
  expect(sectionVisible(100, 1800, 80, 700)).toBe(true);
});

import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MotionScroll } from '../../src/components/motion-scroll';
import { MotionEntry } from '../../src/components/motion-entry';

test('native opted-in section is readable, focus/touch bypass keeps child state and layout events never remount it', async () => {
  function Counter() {
    const [count, setCount] = useState(0);
    return <Pressable accessibilityRole="button" onPress={() => setCount(count + 1)}><Text>{`Section count ${count}`}</Text></Pressable>;
  }
  await render(<MotionScroll><MotionEntry section="important"><Counter /></MotionEntry></MotionScroll>);
  const section = screen.getByTestId('motion-section-important');
  await fireEvent(section, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 150 } } });
  await fireEvent(section, 'focusCapture');
  await fireEvent(section, 'touchStart');
  await fireEvent.press(screen.getByRole('button'));
  await fireEvent(section, 'layout', { nativeEvent: { layout: { x: 0, y: 120, width: 300, height: 150 } } });
  expect(screen.getByText('Section count 1')).toBeTruthy();
  expect(StyleSheet.flatten(section.props.style).opacity).toBe(1);
});

import { jest } from '@jest/globals';
import { MotionIcon } from '../../src/components/motion-icon';
import { MorphIcon } from '../../src/components/morph-renderer';
import { motionIcons } from '../../src/services/motion-icons';
jest.mock('../../src/components/morph-renderer', () => ({ MorphIcon: jest.fn(() => null) }));

test('interactive icon ignores touch hover and returns to idle after touch ends without bouncy morph', async () => {
  await render(<MotionIcon name="camera" />);
  const latest = () => jest.mocked(MorphIcon).mock.calls.at(-1)![0];
  const icon = screen.getByTestId('motion-icon-camera');
  await fireEvent(icon, 'pointerEnter', { nativeEvent: { pointerType: 'touch' } });
  expect(latest().icon).toEqual(motionIcons.camera[0]);
  await fireEvent(icon, 'pointerEnter', { nativeEvent: { pointerType: 'mouse' } });
  expect(latest().icon).toEqual(motionIcons.camera[1]);
  await fireEvent(icon, 'touchStart'); await fireEvent(icon, 'touchEnd');
  expect(latest().icon).toEqual(motionIcons.camera[0]);
  expect(latest().reducedMotion).toBe('always');
});

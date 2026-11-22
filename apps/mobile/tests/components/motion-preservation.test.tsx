import React, { useState } from 'react';
import { expect, test } from '@jest/globals';
import { Pressable, Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MotionEntry } from '../../src/components/motion-entry';

test('native long-list fallback has no decorative event handlers or transforms', async () => {
  await render(<MotionEntry><Text>Native list item</Text></MotionEntry>);
  const node = screen.getByText('Native list item').parent!;
  expect(node.props.style).toBeUndefined();
  expect(node.props.onScroll).toBeUndefined();
  expect(node.props.onLayout).toBeUndefined();
});
test('an entry wrapper rerender preserves child interaction state', async () => {
  function Counter() {
    const [count, setCount] = useState(0);
    return <Pressable accessibilityRole="button" onPress={() => setCount(count + 1)}><Text>{`Count ${count}`}</Text></Pressable>;
  }
  const view = await render(<MotionEntry kind="page"><Counter /></MotionEntry>);
  await fireEvent.press(screen.getByRole('button'));
  await view.rerender(<MotionEntry kind="page"><Counter /></MotionEntry>);
  expect(screen.getByText('Count 1')).toBeTruthy();
});

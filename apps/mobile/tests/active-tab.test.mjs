import test from 'node:test';
import assert from 'node:assert/strict';
import { activeTabScreen, hideBlurredTab, primaryTabs } from '../src/navigation/tabs.ts';

test('the home tab has no second segment and maps to index', () => {
  assert.equal(activeTabScreen(['(tabs)']), 'index');
});

test('every primary tab maps its route segment to its screen', () => {
  for (const tab of primaryTabs) {
    const segments = tab.screen === 'index' ? ['(tabs)'] : ['(tabs)', tab.screen];
    assert.equal(activeTabScreen(segments), tab.screen);
  }
});

test('a screen pushed outside the tabs reports no active tab', () => {
  assert.equal(activeTabScreen(['login']), null);
  assert.equal(activeTabScreen([]), null);
});

test('on web every tab but the active one is hidden', () => {
  for (const tab of primaryTabs) {
    for (const other of primaryTabs) {
      assert.equal(hideBlurredTab(other.screen, tab.screen, true), other.screen !== tab.screen);
    }
  }
});

test('nothing is hidden on native or while outside the tabs', () => {
  assert.equal(hideBlurredTab('explore', 'index', false), false);
  assert.equal(hideBlurredTab('explore', null, true), false);
});

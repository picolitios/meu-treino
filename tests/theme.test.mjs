import test from 'node:test';
import assert from 'node:assert/strict';
import { colors } from '../src/theme.ts';

function luminance(hex) {
  const [red, green, blue] = hex.slice(1).match(/../g).map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('os pares principais de texto e fundo mantêm contraste legível', () => {
  for (const [foreground, background] of [
    [colors.white, colors.primary],
    [colors.white, colors.hero],
    [colors.lilac, colors.hero],
    [colors.ink, colors.canvas],
    [colors.muted, colors.canvas],
    [colors.primary, colors.tint],
  ]) {
    assert.ok(contrast(foreground, background) >= 4.5);
  }
});

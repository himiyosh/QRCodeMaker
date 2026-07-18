import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('the inline application script parses', () => {
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, 'expected an inline application script');
  assert.doesNotThrow(() => new Function(script));
});

test('QR generation preserves exact input and a four-module quiet zone', () => {
  assert.match(html, /const text = textInputEl\.value;/);
  assert.doesNotMatch(html, /textInputEl\.value\.trim\(/);
  assert.match(html, /\{ width: 256, margin: 4, errorCorrectionLevel: 'M' \}/);
});

test('the generation form exposes labelled and announced states', () => {
  assert.match(html, /<label[^>]+for="text-input"/);
  assert.match(html, /id="generate-status"[^>]+role="status"[^>]+aria-live="polite"/);
  assert.match(html, /textInputEl\.setAttribute\('aria-invalid'/);
  assert.doesNotMatch(html, /\balert\(/);
});

test('empty output controls stay hidden until generation succeeds', () => {
  assert.match(html, /id="download-btn"[^>]+hidden/);
  assert.match(html, /<canvas id="generate-canvas" hidden/);
  assert.match(html, /#result:empty \{ display: none; \}/);
});

test('decoding preserves source aspect ratio and caps oversized images', () => {
  assert.match(html, /const sourceWidth = img\.naturalWidth \|\| img\.width;/);
  assert.match(html, /const sourceHeight = img\.naturalHeight \|\| img\.height;/);
  assert.match(html, /const maxDecodeSize = 1600;/);
  assert.match(html, /decodeCtxEl\.drawImage\(img, 0, 0, width, height\)/);
  assert.match(html, /canvas \{[\s\S]*?box-sizing: border-box;[\s\S]*?max-width: 100%;/);
  assert.doesNotMatch(html, /const SIZE = 200;/);
});

test('the decoder exposes one semantic, keyboard-operable file surface', () => {
  assert.match(html, /<label id="drop-zone" for="file-input"[^>]*>[\s\S]*<input id="file-input" class="visually-hidden"/);
  assert.match(html, /id="file-input"[^>]+accept="image\/\*"[^>]+aria-describedby="result"/);
  assert.match(html, /#drop-zone:focus-within/);
  assert.match(html, /#drop-zone:hover/);
  assert.match(html, /#drop-zone:active/);
  assert.match(html, /#drop-zone:has\(input:disabled\)/);
  assert.match(html, /#drop-zone\[data-state="loading"\]/);
  assert.match(html, /#drop-zone\[data-state="error"\]/);
  assert.match(html, /#drop-zone\[data-state="success"\]/);
  assert.doesNotMatch(html, /id="file-input"[^>]+style="display:none;"/);
  assert.doesNotMatch(html, /id="decode-btn"/);
});

test('decoder file failures are explicit, localized, and announced', () => {
  assert.match(html, /file\.type && !file\.type\.startsWith\('image\/'\)/);
  assert.match(html, /reader\.onerror = \(\) => finishDecode\(requestId, 'readFailed'\)/);
  assert.match(html, /reader\.onabort = \(\) => finishDecode\(requestId, 'readFailed'\)/);
  assert.match(html, /image\.onerror = \(\) => finishDecode\(requestId, 'imageFailed'\)/);
  assert.match(html, /decodedState === 'loading'/);
  assert.match(html, /dropZoneEl\.setAttribute\('aria-busy'/);
  assert.match(html, /id="result" role="status" aria-live="polite"/);
});

test('new decoder requests supersede stale reads and allow retrying the same file', () => {
  assert.match(html, /let decodeRequestId = 0;/);
  assert.match(html, /const requestId = \+\+decodeRequestId;/);
  assert.match(html, /if \(requestId !== decodeRequestId\) return;/);
  assert.match(html, /fileInputEl\.value = '';/);
});

test('document and decoded-result semantics stay synchronized', () => {
  assert.match(html, /<main class="container">[\s\S]*id="decode"[\s\S]*<\/main>/);
  assert.match(html, /document\.documentElement\.lang = lang;/);
  assert.match(html, /document\.title = t\.title;/);
  assert.match(html, /id="result" role="status" aria-live="polite" data-state="empty"/);
  assert.match(html, /resultPEl\.dataset\.state = decodedState;/);
  assert.match(html, /decodeCanvasEl\.setAttribute\('aria-label', t\.decodeCanvasLabel\)/);
  assert.match(html, /generatePreviewEl\.dataset\.state = generationState;/);
});

test('the page has no continuously animated decorative canvas', () => {
  assert.doesNotMatch(html, /id="bg-canvas"/);
  assert.doesNotMatch(html, /requestAnimationFrame\(/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
});

test('PNG download is generated locally from the canvas', () => {
  assert.match(html, /id="download-btn"/);
  assert.match(html, /generateCanvasEl\.toBlob\(/);
  assert.match(html, /URL\.createObjectURL\(blob\)/);
  assert.match(html, /link\.download = 'qrcode\.png'/);
});

test('Japanese and English generation copy stay in sync', () => {
  for (const key of [
    'inputLabel',
    'inputHelper',
    'inputRequired',
    'generateBtn',
    'generated',
    'previewEmpty',
    'previewLabel',
    'decodeCanvasLabel',
    'downloadBtn',
    'downloaded',
  ]) {
    assert.equal((html.match(new RegExp(`${key}:`, 'g')) || []).length, 2, key);
  }
});

test('Japanese and English decoder copy stay in sync', () => {
  for (const key of [
    'dropZone',
    'fileBtn',
    'decoding',
    'decoded',
    'notFound',
    'invalidFile',
    'readFailed',
    'imageFailed',
  ]) {
    assert.equal((html.match(new RegExp(`${key}:`, 'g')) || []).length, 2, key);
  }
});

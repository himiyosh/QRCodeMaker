import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [html, robots, llms] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../robots.txt', import.meta.url), 'utf8'),
  readFile(new URL('../llms.txt', import.meta.url), 'utf8'),
]);

test('the inline application script parses', () => {
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, 'expected an inline application script');
  assert.doesNotThrow(() => new Function(script));
});

test('the page describes its local-only purpose for people and search engines', () => {
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /id="privacy-note" class="privacy-note"/);
  for (const key of ['description', 'privacyNote']) {
    assert.equal((html.match(new RegExp(`${key}:`, 'g')) || []).length, 2, key);
  }
  assert.match(html, /descriptionMetaEl\.content = t\.description;/);
});

test('crawler guidance is permissive, useful, and consistent with the product', () => {
  assert.match(robots, /^User-agent: \*\r?\nAllow: \/\r?\n?$/);
  assert.match(llms, /^# QR Code Generator & Reader/m);
  assert.match(llms, /processed in the browser and are not uploaded/);
  assert.match(llms, /\[Project README\]\(\.\/README\.md\)/);
  assert.match(llms, /\[Product contract\]\(\.\/PRODUCT\.md\)/);
});

test('third-party QR libraries are version-pinned and integrity checked', () => {
  assert.match(html, /qrcode@1\.5\.1\/build\/qrcode\.min\.js/);
  assert.match(html, /jsqr@1\.4\.0\/dist\/jsQR\.js/);
  assert.equal((html.match(/integrity="sha384-[A-Za-z0-9+/=]+"/g) || []).length, 2);
  assert.equal((html.match(/crossorigin="anonymous" referrerpolicy="no-referrer"/g) || []).length, 2);
  assert.doesNotMatch(html, /npm\/qrcode\/build/);
  assert.doesNotMatch(html, /npm\/jsqr\/dist/);
});

test('the content security policy allows only the current inline application script', () => {
  const csp = html.match(/<meta http-equiv="Content-Security-Policy"\s+content="([^"]+)">/)?.[1];
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(csp, 'expected a Content Security Policy');
  assert.ok(script, 'expected an inline application script');

  const hash = createHash('sha256')
    .update(script.replace(/\r\n?/g, '\n'))
    .digest('base64');
  assert.ok(csp.includes(`'sha256-${hash}'`), 'expected the current inline script hash');
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /script-src https:\/\/cdn\.jsdelivr\.net/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
  assert.match(csp, /connect-src 'self'/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
});

test('missing QR libraries and oversized images fail with recoverable guidance', () => {
  assert.match(html, /typeof QRCode === 'undefined' \|\| typeof QRCode\.toCanvas !== 'function'/);
  assert.match(html, /typeof jsQR !== 'function'/);
  assert.match(html, /const maxDecodeFileBytes = 20 \* 1024 \* 1024;/);
  assert.match(html, /file\.size > maxDecodeFileBytes/);
  for (const key of ['generationUnavailable', 'fileTooLarge', 'decodeUnavailable']) {
    assert.equal((html.match(new RegExp(`${key}:`, 'g')) || []).length, 2, key);
  }
});

test('QR generation preserves exact input and a four-module quiet zone', () => {
  assert.match(html, /const text = textInputEl\.value;/);
  assert.doesNotMatch(html, /textInputEl\.value\.trim\(/);
  assert.match(html, /\{ width: 256, margin: 4, errorCorrectionLevel: 'M' \}/);
});

test('multiline generation preserves Enter and offers an explicit shortcut', () => {
  assert.match(html, /<textarea id="text-input"[^>]+rows="4"[\s\S]*?<\/textarea>/);
  assert.doesNotMatch(html, /<input id="text-input"/);
  assert.match(html, /event\.key === 'Enter' && \(event\.ctrlKey \|\| event\.metaKey\)/);
  assert.match(html, /event\.preventDefault\(\);\s+generateQRCode\(\);/);
  assert.match(html, /if \(generationState === 'generating'\) return;/);
  assert.doesNotMatch(html, /if \(event\.key === 'Enter'\) generateQRCode/);
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
  assert.match(html, /console\.error\('QR decoding failed', error\)/);
  assert.match(html, /finishDecode\(requestId, 'decodeFailed'\)/);
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
  assert.match(html, /<main class="container">[\s\S]*<section[^>]+id="decode"[\s\S]*<\/main>/);
  assert.match(html, /document\.documentElement\.lang = lang;/);
  assert.match(html, /document\.title = t\.title;/);
  assert.match(html, /id="result" role="status" aria-live="polite" data-state="empty"/);
  assert.match(html, /resultPEl\.dataset\.state = decodedState;/);
  assert.match(html, /decodeCanvasEl\.setAttribute\('aria-label', t\.decodeCanvasLabel\)/);
  assert.match(html, /generatePreviewEl\.dataset\.state = generationState;/);
});

test('clearing a decoded result does not erase generation work', () => {
  assert.match(html, /clearDecodeBtn:/);
  assert.match(html, /id="reset-btn"[^>]+hidden/);
  assert.match(html, /resetBtnEl\.hidden = decodedState === 'empty'/);
  const resetHandler = html.match(/resetBtnEl\.addEventListener\('click', \(\) => \{([\s\S]*?)\n    \}\);/)?.[1];
  assert.ok(resetHandler, 'expected the decoded-result clear handler');
  assert.match(resetHandler, /clearDecodeCanvas\(\)/);
  assert.match(resetHandler, /decodedState = 'empty'/);
  assert.doesNotMatch(resetHandler, /textInputEl\.value/);
  assert.doesNotMatch(resetHandler, /generationState/);
});

test('successful decoding exposes exact-payload copy with explicit feedback', () => {
  assert.match(html, /id="copy-btn"[^>]+hidden/);
  assert.match(html, /id="copy-status"[^>]+role="status"[^>]+aria-live="polite"/);
  assert.match(html, /navigator\.clipboard\.writeText\(data\)/);
  assert.match(html, /const data = decodedData;/);
  assert.match(html, /copyState = 'copied'/);
  assert.match(html, /copyState = 'failed'/);
  assert.match(html, /console\.error\('Copying decoded result failed', error\)/);
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
    'copyBtn',
    'copying',
    'copied',
    'copyFailed',
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
    'fileTooLarge',
    'readFailed',
    'imageFailed',
    'decodeFailed',
    'decodeUnavailable',
  ]) {
    assert.equal((html.match(new RegExp(`${key}:`, 'g')) || []).length, 2, key);
  }
});

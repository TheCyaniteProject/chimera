#!/usr/bin/env node

// Default alphabet, alphanumeric uppercase by default:
let ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Normalize alphabet — uppercase, unique, keep all chars including punctuation, unicode, etc.
ALPHABET = ALPHABET.toUpperCase()
  .split('')
  .filter((c, i, arr) => arr.indexOf(c) === i) // unique characters only
  .join('');

const BASE = ALPHABET.length;

function sanitizeInput(str) {
  // Uppercase input and keep only chars in alphabet
  const upper = str.toUpperCase();
  let result = '';
  for (const c of upper) {
    if (ALPHABET.includes(c)) result += c;
  }
  return result;
}

function charToIndex(c) {
  return ALPHABET.indexOf(c.toUpperCase());
}

function indexToChar(i) {
  const idx = ((i % BASE) + BASE) % BASE;
  return ALPHABET[idx];
}

// --- TRANSFORMS ---

function transformReverse(str) {
  return str.split('').reverse().join('');
}
function inverseReverse(str) {
  return transformReverse(str);
}

// ROT13 letters only on A-Z (ignores any other chars)
function transformROT13(str) {
  return str.split('').map(c => {
    const uc = c.toUpperCase();
    const isLetter = uc >= 'A' && uc <= 'Z';
    if (!isLetter) return c;
    let code = uc.charCodeAt(0) - 65;
    code = (code + 13) % 26;
    return String.fromCharCode(code + 65);
  }).join('');
}
function inverseROT13(str) {
  return transformROT13(str);
}

// Caesar shift + variable % BASE on full alphabet
function transformCaesarShift(str, shift) {
  return str.split('').map(c => {
    const i = charToIndex(c);
    if (i === -1) return c; // keep unknown chars unchanged
    return indexToChar(i + shift);
  }).join('');
}
function inverseCaesarShift(str, shift) {
  return transformCaesarShift(str, -shift);
}

// Swap halves, works on any length string
function transformSwapHalves(str) {
  const mid = Math.ceil(str.length / 2);
  const first = str.slice(0, mid);
  const second = str.slice(mid);
  return second + first;
}
function inverseSwapHalves(str) {
  const mid = Math.floor(str.length / 2);
  const first = str.slice(0, mid);
  const second = str.slice(mid);
  return second + first;
}

// Rotate right by 1 char
function transformRotateRight1(str) {
  if (str.length === 0) return str;
  return str[str.length - 1] + str.slice(0, str.length - 1);
}
function inverseRotateRight1(str) {
  if (str.length === 0) return str;
  return str.slice(1) + str[0];
}

// Rotate left by 2 chars
function transformRotateLeft2(str) {
  return str.slice(2) + str.slice(0, 2);
}
function inverseRotateLeft2(str) {
  return str.slice(-2) + str.slice(0, str.length - 2);
}

// Atbash on full alphabet (mirrors entire provided alphabet)
function transformAtbash(str) {
  return str.split('').map(c => {
    const idx = charToIndex(c);
    if (idx === -1) return c;
    return indexToChar(BASE - 1 - idx);
  }).join('');
}
const inverseAtbash = transformAtbash;

// Shift chars by pattern char index (mod BASE)
function transformShiftByChar(str, patternChar) {
  const shift = charToIndex(patternChar);
  if (shift === -1) return str;
  return transformCaesarShift(str, shift);
}
function inverseShiftByChar(str, patternChar) {
  const shift = charToIndex(patternChar);
  if (shift === -1) return str;
  return inverseCaesarShift(str, shift);
}

function transformIdentity(str) {
  return str;
}
const inverseIdentity = transformIdentity;

// C transform is special: variable shift from numeric suffix in pattern

function transformCaesarWithDynamicShift(str, shift) {
  return transformCaesarShift(str, shift);
}
function inverseCaesarWithDynamicShift(str, shift) {
  return inverseCaesarShift(str, shift);
}

// Map pattern chars to transforms
const TRANSFORMS = {
  A: {forward: transformReverse, inverse: inverseReverse},
  B: {forward: transformROT13, inverse: inverseROT13},
  C: {forward: transformIdentity, inverse: transformIdentity}, // handled separately with shift
  D: {forward: inverseCaesarShift, inverse: transformCaesarShift}, // inverse of +5
  E: {forward: transformSwapHalves, inverse: inverseSwapHalves},
  H: {forward: transformRotateRight1, inverse: inverseRotateRight1},
  I: {forward: transformRotateLeft2, inverse: inverseRotateLeft2},
  J: {forward: transformAtbash, inverse: inverseAtbash},
  S: {forward: transformShiftByChar, inverse: inverseShiftByChar},
  default: {forward: transformIdentity, inverse: inverseIdentity},
};

// Parse pattern and optional numeric suffix for shift
function parsePattern(rawPattern) {
  const regex = /^([A-Z0-9]*?)(\d*)$/i;
  const match = rawPattern.match(regex);
  if (!match) {
    return { patternString: sanitizeInput(rawPattern), shiftAmount: 5 };
  }
  const patternString = sanitizeInput(match[1] || '');
  let shiftAmount = 5; // default
  if (match[2]) {
    const num = Number(match[2]);
    if (!isNaN(num) && num >= 0) {
      shiftAmount = num % BASE;
    }
  }
  return { patternString, shiftAmount };
}

// Apply transforms depending on encode/decode and shiftAmount for 'C'
function applyTransforms(str, pattern, encode = true, shiftAmount = 5) {
  if (encode) {
    for (const ch of pattern) {
      const uc = ch.toUpperCase();
      if (uc === 'C') {
        str = transformCaesarWithDynamicShift(str, shiftAmount);
      } else {
        const t = TRANSFORMS[uc] || TRANSFORMS.default;
        if (uc === 'S') str = t.forward(str, uc);
        else str = t.forward(str);
      }
    }
  } else {
    for (let i = pattern.length - 1; i >= 0; i--) {
      const uc = pattern[i].toUpperCase();
      if (uc === 'C') {
        str = inverseCaesarWithDynamicShift(str, shiftAmount);
      } else {
        const t = TRANSFORMS[uc] || TRANSFORMS.default;
        if (uc === 'S') str = t.inverse(str, uc);
        else str = t.inverse(str);
      }
    }
  }
  return str;
}

const [,, modeRaw, rawPattern, ...rawTextParts] = process.argv;

if (!modeRaw || !['encode', 'decode', 'e', 'd'].includes(modeRaw.toLowerCase())) {
  console.error('First argument must be "encode/e" or "decode/d"');
  process.exit(1);
}
if (!rawPattern) {
  console.error('Second argument must be the pattern string');
  process.exit(1);
}
if (rawTextParts.length === 0) {
  console.error('Third argument must be the text to encode/decode');
  process.exit(1);
}

const {patternString: pattern, shiftAmount} = parsePattern(rawPattern);
let text = rawTextParts.join(''); // keep original input to preserve spaces/unicode

// now sanitize input according to alphabet (which may have non-alnum chars)
text = sanitizeInput(text);

if (pattern.length === 0) {
  console.error('Pattern must contain at least one alphanumeric character');
  process.exit(1);
}
if (text.length === 0) {
  console.error('Text must contain at least one character from the alphabet');
  process.exit(1);
}

const isEncode = (modeRaw.toLowerCase() === 'encode' || modeRaw.toLowerCase() === 'e');

const output = applyTransforms(text, pattern, isEncode, shiftAmount);

console.log(output);

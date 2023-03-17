import { comma, obrace, cbrace, obracket, cbracket, mark } from './constants.js';


/**
 * Get the char code of `str`.
 */
export const char = (str) => str.charCodeAt(0);

/**
 * Check if `buf[i-1] - buf[i+n]` equals `"chars"`.
 */
export function isMatch(buf, i, chars) {
  if (buf[i - 1] != mark) return false;
  for (let j = 0; j < chars.length; j++) {
    if (buf[i + j] != chars[j]) return false;
  }
  if (buf[i + chars.length] != mark) return false;
  return true;
}

/**
 * Find the end index of the object that starts at `start` in `buf`.
 */
export function findEnd(buf, start) {
  let level = 0;
  let s = buf[start];
  let c;

  for (let i = start; i < buf.length; ++i) {
    c = buf[i];
    if (c == obrace || c == obracket) {
      ++level; continue;
    }
    else if (c == cbrace || c == cbracket) {
      if (--level > 0) continue;
    }
    if (level <= 0 && (c == comma || c == cbrace || c == cbracket)) {
      return i + ((s == obrace || s == obracket) && 1);
    }
  }
}
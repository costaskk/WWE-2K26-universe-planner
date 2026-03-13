import * as crypto from 'node:crypto';
import { getEnv } from './env.js';

const COOKIE_NAME = 'wwe2k26_session';
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function unbase64url(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const value = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(value, 'base64').toString('utf8');
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function getJwtSecret() {
  return getEnv('APP_JWT_SECRET');
}

export function normalizeUsername(value = '') {
  return String(value).trim().toLowerCase();
}

export function isValidUsername(value = '') {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(String(value).trim());
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.startsWith('scrypt$')) return false;
  const [, salt, original] = stored.split('$');
  if (!salt || !original) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(hash, original);
}

function signPayload(payload) {
  return crypto.createHmac('sha256', getJwtSecret()).update(payload).digest('base64url');
}

export function createSessionToken(user) {
  const payload = base64url(JSON.stringify({
    sub: user.id,
    username: user.username,
    exp: Date.now() + THIRTY_DAYS_SECONDS * 1000,
  }));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes('.')) throw new Error('Invalid session token.');
  const [payload, signature] = token.split('.');
  const expected = signPayload(payload);
  if (!timingSafeEqual(signature, expected)) throw new Error('Invalid session signature.');
  const parsed = JSON.parse(unbase64url(payload));
  if (!parsed?.exp || Date.now() > parsed.exp) throw new Error('Session expired.');
  return { id: parsed.sub, username: parsed.username };
}

export function getSessionCookieValue(req) {
  const cookieHeader = req.headers.cookie || '';
  const parts = cookieHeader.split(';').map((part) => part.trim());
  const target = parts.find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return target ? decodeURIComponent(target.split('=').slice(1).join('=')) : null;
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const expires = new Date(Date.now() + THIRTY_DAYS_SECONDS * 1000).toUTCString();
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${THIRTY_DAYS_SECONDS}`,
    `Expires=${expires}`,
    'Priority=High',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Priority=High',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}
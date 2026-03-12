import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getEnv } from './env.js';

const encoder = new TextEncoder();
const COOKIE_NAME = 'wwe2k26_session';
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export function normalizeUsername(value = '') {
  return String(value).trim().toLowerCase();
}

export function isValidUsername(value = '') {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(String(value).trim());
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function getJwtSecret() {
  return encoder.encode(getEnv('APP_JWT_SECRET'));
}

export async function createSessionToken(user) {
  return new SignJWT({ sub: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${THIRTY_DAYS_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return {
    id: payload.sub,
    username: payload.username,
  };
}

export function getSessionCookieValue(req) {
  const cookieHeader = req.headers.cookie || '';
  const parts = cookieHeader.split(';').map((part) => part.trim());
  const target = parts.find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return target ? decodeURIComponent(target.split('=').slice(1).join('=')) : null;
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${THIRTY_DAYS_SECONDS}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

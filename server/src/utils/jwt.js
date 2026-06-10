import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({
  path: './.env.example',
});

export const generateToken = (payload) => {
  // parseInt so jsonwebtoken treats the value as seconds, not ms via the `ms` lib
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRE, 10) || 3600,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRE, 10) || 2592000,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

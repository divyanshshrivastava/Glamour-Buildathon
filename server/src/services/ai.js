/**
 * Core AI Service — wraps Google Gemini SDK
 *
 * Features:
 *  - Structured JSON output (Gemini JSON mode)
 *  - Multimodal image analysis (selfie → beauty profile)
 *  - In-memory rate limiter (15 RPM free-tier guard)
 *  - Graceful error handling
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// ── Singleton client ──────────────────────────────────────────────────
// Added comment to trigger nodemon restart and reload .env

let genai = null;

function getClient() {
  if (!genai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genai = new GoogleGenAI({ apiKey });
  }
  return genai;
}

// ── Rate limiter (sliding window, 15 RPM) ─────────────────────────────

const RATE_LIMIT = 14; // stay 1 below the 15 RPM hard cap
const WINDOW_MS = 60_000;
const timestamps = [];

async function waitForRateLimit() {
  const now = Date.now();

  // Purge timestamps older than the window
  while (timestamps.length > 0 && timestamps[0] <= now - WINDOW_MS) {
    timestamps.shift();
  }

  if (timestamps.length >= RATE_LIMIT) {
    // Wait until the oldest timestamp exits the window
    const waitMs = timestamps[0] + WINDOW_MS - now + 100; // +100ms buffer
    console.log(`[AI] Rate limit reached. Waiting ${waitMs}ms…`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return waitForRateLimit(); // re-check after waiting
  }

  timestamps.push(now);
}

// ── Generate structured JSON ──────────────────────────────────────────

/**
 * Send a prompt to Gemini and get back structured JSON.
 *
 * @param {string} prompt - The full prompt text
 * @param {object} [options]
 * @param {string} [options.model] - Model name (default: gemini-2.0-flash)
 * @param {number} [options.temperature] - Sampling temperature
 * @returns {Promise<object>} Parsed JSON object
 */
export async function generateJSON(prompt, options = {}) {
  await waitForRateLimit();

  const client = getClient();
  const model = options.model || 'gemini-2.5-flash';

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: options.temperature ?? 0.7,
      },
    });

    const text = response.text;
    return JSON.parse(text);
  } catch (err) {
    console.error('[AI] generateJSON error:', err.message);
    throw new Error(`AI generation failed: ${err.message}`);
  }
}

// ── Generate plain text ───────────────────────────────────────────────

/**
 * Send a prompt to Gemini and get back plain text.
 *
 * @param {string} prompt - The full prompt text
 * @param {object} [options]
 * @returns {Promise<string>} Generated text
 */
export async function generateText(prompt, options = {}) {
  await waitForRateLimit();

  const client = getClient();
  const model = options.model || 'gemini-2.5-flash';

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: options.temperature ?? 0.7,
      },
    });

    return response.text;
  } catch (err) {
    console.error('[AI] generateText error:', err.message);
    throw new Error(`AI generation failed: ${err.message}`);
  }
}

// ── Analyze image (multimodal) ────────────────────────────────────────

/**
 * Send an image + text prompt to Gemini Vision for analysis.
 *
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @param {string} prompt - Text prompt for the analysis
 * @param {object} [options]
 * @returns {Promise<object>} Parsed JSON response
 */
export async function analyzeImage(imageBuffer, mimeType, prompt, options = {}) {
  await waitForRateLimit();

  const client = getClient();
  const model = options.model || 'gemini-2.5-flash';

  // Convert buffer to base64 inline data
  const base64Data = imageBuffer.toString('base64');

  try {
    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: options.temperature ?? 0.4,
      },
    });

    const text = response.text;
    return JSON.parse(text);
  } catch (err) {
    console.error('[AI] analyzeImage error:', err.message);
    throw new Error(`AI image analysis failed: ${err.message}`);
  }
}

// ── Health check ──────────────────────────────────────────────────────

/**
 * Verify that the Gemini API key is valid and the service is reachable.
 */
export async function checkAIHealth() {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with exactly: {"status":"ok"}',
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text);
    return parsed.status === 'ok';
  } catch (err) {
    console.error('[AI] Health check failed:', err.message);
    return false;
  }
}

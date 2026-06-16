/**
 * AI Marketing Assistant Controller
 *
 * Generates social media content and marketing copy for salon owners.
 * Supports multiple platforms, tones, and content refinement.
 */

import { generateJSON } from '../services/ai.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import { SalonModel } from '../models/Salon.js';

// ── POST /api/v1/ai/marketing/generate ───────────────────────────────

export const generateContent = async (req, res) => {
  const {
    service,
    offer,
    discount,
    targetAudience,
    occasion,
    businessGoal,
    tone = 'professional',
    platforms = ['instagram'],
  } = req.body;

  if (!service) {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Service name is required',
      {},
      422
    );
  }

  // Fetch the current user's salon
  let salonName = "Your Salon";
  let bookingLink = "https://glamour.com/book";
  
  if (req.user && req.user.id) {
    try {
      const salon = await SalonModel.findByOwnerId(req.user.id);
      if (salon) {
        salonName = salon.name;
        bookingLink = `https://glamour.com/salons/${salon.slug || salon.id}`;
      }
    } catch (err) {
      console.warn("Could not fetch salon for marketing prompt:", err.message);
    }
  }

  const toneDescriptions = {
    premium: 'sophisticated, elegant, and exclusive',
    luxury: 'opulent, high-end, and aspirational',
    friendly: 'warm, approachable, and conversational',
    professional: 'polished, trustworthy, and informative',
    trendy: 'youthful, hip, and social-media-savvy',
    festive: 'celebratory, joyful, and seasonal',
  };

  const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;

  const platformInstructions = {
    instagram: 'Instagram post caption (max 2200 chars, use emojis, line breaks for readability)',
    facebook: 'Facebook post (can be longer, conversational, include a call to action)',
    whatsapp: 'WhatsApp promotional message (concise, personal, includes the booking link naturally)',
  };

  const selectedPlatforms = platforms.filter((p) => platformInstructions[p]);
  if (selectedPlatforms.length === 0) {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Select at least one valid platform: instagram, facebook, whatsapp',
      {},
      422
    );
  }

  const contextParts = [];
  if (offer) contextParts.push(`Offer: ${offer}`);
  if (discount) contextParts.push(`Discount: ${discount}`);
  if (targetAudience) contextParts.push(`Target audience: ${targetAudience}`);
  if (occasion) contextParts.push(`Occasion/Festival: ${occasion}`);
  if (businessGoal) contextParts.push(`Business goal: ${businessGoal}`);

  const prompt = `You are an expert social media marketer for a premium Indian salon named "${salonName}". 
Generate marketing content for the following:

Service: ${service}
${contextParts.join('\n')}
Tone: ${toneDesc}

IMPORTANT DIRECTIVES:
- The salon's name is "${salonName}". Use this exact name in the copy.
- The booking link is "${bookingLink}". Embed this actual URL directly in the copy where appropriate (especially for WhatsApp and Facebook). 
- DO NOT use placeholders like [YOUR SALON NAME] or [BOOKING_LINK]. Use the real values provided above.

Generate content for these platforms:
${selectedPlatforms.map((p) => `- ${p}: ${platformInstructions[p]}`).join('\n')}

Return a JSON object with this EXACT structure:
{
  "contents": [
    {
      "platform": "instagram",
      "text": "The full post caption/text",
      "hashtags": ["relevant", "hashtags", "without", "hash", "symbol"],
      "imagePrompt": "A detailed prompt for AI image generation (describe the visual for the post)"
    }
  ]
}

Rules:
- Each platform should have its own entry in the contents array
- Hashtags should be 8-15 relevant tags (without the # symbol)
- The text should be compelling, on-brand, and include a clear call to action
- Image prompts should be detailed and describe a premium salon marketing visual
- Use Indian salon context (₹ currency, Indian beauty trends, local references)`;

  try {
    const result = await generateJSON(prompt);

    return successResponse(res, {
      contents: result.contents || [],
    });
  } catch (err) {
    console.error('[Marketing] Generation failed:', err.message);
    return errorResponse(res, 'AI_ERROR', 'Failed to generate marketing content. Please try again.', {}, 500);
  }
};

// ── POST /api/v1/ai/marketing/refine ─────────────────────────────────

export const refineContent = async (req, res) => {
  const { originalContent, action, platform = 'instagram' } = req.body;

  if (!originalContent) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'originalContent is required', {}, 422);
  }

  // Fetch the current user's salon
  let salonName = "Your Salon";
  let bookingLink = "https://glamour.com/book";
  
  if (req.user && req.user.id) {
    try {
      const salon = await SalonModel.findByOwnerId(req.user.id);
      if (salon) {
        salonName = salon.name;
        bookingLink = `https://glamour.com/salons/${salon.slug || salon.id}`;
      }
    } catch (err) {
      console.warn("Could not fetch salon for marketing refine prompt:", err.message);
    }
  }

  const validActions = ['rewrite', 'shorten', 'expand', 'more_premium', 'more_persuasive'];
  if (!validActions.includes(action)) {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      `action must be one of: ${validActions.join(', ')}`,
      {},
      422
    );
  }

  const actionInstructions = {
    rewrite: 'Completely rewrite this content with a fresh perspective while keeping the same message',
    shorten: 'Make this content more concise and punchy while keeping the key message',
    expand: 'Expand this content with more details, benefits, and persuasive elements',
    more_premium: 'Elevate the tone to feel more premium, exclusive, and luxurious',
    more_persuasive: 'Make this content more persuasive with stronger calls to action and urgency',
  };

  const prompt = `You are a social media content editor for a salon named "${salonName}". ${actionInstructions[action]}.

IMPORTANT DIRECTIVES:
- The salon's name is "${salonName}". Ensure it's used properly.
- The booking link is "${bookingLink}". Ensure it's included if the platform warrants it.
- DO NOT use placeholders.

Original content (for ${platform}):
${originalContent}

Return a JSON object with this EXACT structure:
{
  "platform": "${platform}",
  "text": "The refined content",
  "hashtags": ["updated", "hashtags"],
  "imagePrompt": "Updated image prompt if the tone changed significantly"
}`;

  try {
    const result = await generateJSON(prompt);

    return successResponse(res, result);
  } catch (err) {
    console.error('[Marketing] Refinement failed:', err.message);
    return errorResponse(res, 'AI_ERROR', 'Failed to refine content. Please try again.', {}, 500);
  }
};

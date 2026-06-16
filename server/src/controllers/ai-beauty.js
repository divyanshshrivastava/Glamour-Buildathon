/**
 * AI Beauty Consultant Controller
 *
 * Accepts a selfie upload, sends it to Gemini Vision for analysis,
 * and returns personalised beauty recommendations mapped to salon services.
 */

import multer from 'multer';
import { analyzeImage, generateJSON } from '../services/ai.js';
import { SalonModel } from '../models/Salon.js';
import { ServiceModel } from '../models/Service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import pool from '../config/database.js';

// ── Multer config (in-memory, max 5 MB) ──────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('image');

// ── Main handler ─────────────────────────────────────────────────────

export const analyzeBeauty = async (req, res) => {
  if (!req.file) {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Please upload an image (field name: "image")',
      {},
      422
    );
  }

  const imageBuffer = req.file.buffer;
  const mimeType = req.file.mimetype;

  // ── Step 1: Analyse the selfie with Gemini Vision ─────────────────

  const analysisPrompt = `You are an expert beauty consultant and hairstylist. Analyse this selfie and provide personalised beauty recommendations.

Return a JSON object with this EXACT structure:
{
  "profile": {
    "faceShape": "oval | round | square | heart | oblong | diamond",
    "skinTone": "fair | light | medium | olive | tan | dark | deep",
    "hairLength": "short | medium | long | very long",
    "hairTexture": "straight | wavy | curly | coily",
    "styleCharacteristics": ["list", "of", "3-5", "style", "observations"]
  },
  "recommendations": [
    {
      "name": "Specific Style/Haircut/Treatment Name (e.g. Curtain Bangs, Classic Bob, Keratin)",
      "explanation": "Explain why this suits the person using simple, customer-friendly language without technical jargon (2-3 sentences)",
      "confidence": 85,
      "relatedServices": ["Haircut", "Styling Session"],
      "category": "hairstyle | color | treatment | grooming | occasion"
    }
  ]
}

Provide 6-8 diverse recommendations covering:
- 2-3 hairstyle suggestions for their face shape
- 1-2 hair color suggestions for their skin tone
- 1-2 treatments for their hair texture
- 1 grooming or occasion styling suggestion

Be specific with recommendation names (e.g. "Curtain Bangs" not just "Bangs").
Confidence should range from 70-98.
relatedServices should use common salon service names like: Haircut, Hair Coloring, Balayage, Keratin Treatment, Hair Spa, Styling Session, Bridal Makeup, Facial, Threading, Manicure, Pedicure, Head Massage, Hair Straightening, Highlights, Deep Conditioning.`;

  let analysis;
  try {
    analysis = await analyzeImage(imageBuffer, mimeType, analysisPrompt);
  } catch (err) {
    console.error('[Beauty Consultant] Vision analysis failed:', err.message);
    return errorResponse(
      res,
      'AI_ERROR',
      'Failed to analyse the image. Please try again with a clear, well-lit selfie.',
      {},
      500
    );
  }

  // ── Step 2: Map recommended services to real DB services & salons ──

  // Collect all unique service names mentioned in recommendations
  const serviceNames = [
    ...new Set(
      (analysis.recommendations || []).flatMap((r) => r.relatedServices || [])
    ),
  ];

  // Fuzzy match services in the database
  let matchedSalons = [];
  if (serviceNames.length > 0) {
    try {
      const likeClauses = serviceNames.map(
        (_, i) => `LOWER(s.name) LIKE LOWER($${i + 1})`
      );
      const params = serviceNames.map((n) => `%${n}%`);

      const query = `
        SELECT DISTINCT ON (sa.id)
          sa.id, sa.name, sa.rating, sa.city, sa.cover_image,
          json_agg(json_build_object(
            'id', s.id,
            'name', s.name,
            'price', s.price,
            'duration', s.duration
          )) OVER (PARTITION BY sa.id) as matched_services
        FROM services s
        JOIN salons sa ON s.salon_id = sa.id
        WHERE sa.active = true
          AND s.is_active = true
          AND (${likeClauses.join(' OR ')})
        ORDER BY sa.id, sa.rating DESC
        LIMIT 6
      `;

      const result = await pool.query(query, params);

      matchedSalons = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        rating: parseFloat(row.rating) || 0,
        city: row.city,
        coverImage: row.cover_image,
        matchedServices: (row.matched_services || []).map((ms) => ({
          id: ms.id,
          name: ms.name,
          price: parseFloat(ms.price),
          duration: ms.duration,
        })),
      }));

      // Sort by rating descending
      matchedSalons.sort((a, b) => b.rating - a.rating);

      // Map actual matched services back to the individual recommendations
      if (analysis.recommendations) {
        analysis.recommendations.forEach((rec) => {
          rec.actualSalonServices = [];
          if (rec.relatedServices) {
            rec.relatedServices.forEach((rs) => {
              matchedSalons.forEach((salon) => {
                const ms = salon.matchedServices.find((s) =>
                  s.name.toLowerCase().includes(rs.toLowerCase())
                );
                if (ms) {
                  const exists = rec.actualSalonServices.find(
                    (a) => a.serviceName === ms.name && a.salonId === salon.id
                  );
                  if (!exists) {
                    rec.actualSalonServices.push({
                      salonId: salon.id,
                      salonName: salon.name,
                      serviceName: ms.name,
                      price: ms.price,
                    });
                  }
                }
              });
            });
          }
          // Limit to top 3 options per recommendation
          rec.actualSalonServices = rec.actualSalonServices.slice(0, 3);
        });
      }
    } catch (err) {
      console.error('[Beauty Consultant] Service matching failed:', err.message);
      // Non-fatal — we still return recommendations without matched salons
    }
  }

  // ── Step 3: Return combined result ─────────────────────────────────

  return successResponse(res, {
    profile: analysis.profile,
    recommendations: analysis.recommendations || [],
    matchedSalons,
  });
};

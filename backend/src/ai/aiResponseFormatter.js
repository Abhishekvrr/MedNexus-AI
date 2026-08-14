/*
=======================================================
MEDNEXUS AI RESPONSE FORMATTER
=======================================================
*/

import {
  validateAIResponse,
} from "./aiResponseSchema.js";

export const formatAIResponse = (
  aiResponse
) => {
  const validated =
    validateAIResponse(aiResponse);

  return {
    assessment: {
      level:
        validated.assessment.level,

      title:
        validated.assessment.title,

      summary:
        validated.assessment.summary,
    },

    symptoms: {
      reported:
        validated.symptoms.reported,

      duration:
        validated.symptoms.duration,
    },

    insights:
      validated.insights,

    next_step: {
      type:
        validated.next_step.type,

      specialty:
        validated.next_step.specialty,

      reason:
        validated.next_step.reason,
    },

    self_care:
      validated.self_care,

    safety: {
      level:
        validated.safety.level,

      message:
        validated.safety.message,

      warning_signs:
        validated.safety.warning_signs,
    },

    actions:
      validated.actions,

    safety_note:
      validated.safety_note,
  };
};
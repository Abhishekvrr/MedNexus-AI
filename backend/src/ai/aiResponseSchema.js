/*
=======================================================
MEDNEXUS AI RESPONSE SCHEMA
=======================================================

Defines the structure expected from the AI.

This keeps AI output predictable for the frontend.
=======================================================
*/

export const createEmptyAIResponse = () => ({
  assessment: {
    level: "moderate",
    title: "Needs Attention",
    summary:
      "The available information should be reviewed carefully.",
  },

  symptoms: {
    reported: [],
    duration: null,
  },

  insights: [],

  next_step: {
    type: "doctor",
    specialty: "General Physician",
    reason:
      "A healthcare professional can evaluate the symptoms and determine the appropriate next step.",
  },

  self_care: [],

  safety: {
    level: "watch",
    message:
      "Monitor your symptoms and seek professional medical advice if they continue or worsen.",
    warning_signs: [],
  },

  actions: [
    "find_doctor",
    "ask_ai",
  ],

  safety_note:
    "MedNexus AI provides healthcare decision-support information and does not replace professional medical advice.",
});

export const validateAIResponse = (response) => {
  const fallback = createEmptyAIResponse();

  if (!response || typeof response !== "object") {
    return fallback;
  }

  /*
  -------------------------------------------------------
  ASSESSMENT
  -------------------------------------------------------
  */

  const allowedLevels = [
    "low",
    "moderate",
    "high",
    "emergency",
  ];

  if (
    !response.assessment ||
    typeof response.assessment !== "object"
  ) {
    response.assessment = fallback.assessment;
  }

  if (
    !allowedLevels.includes(
      response.assessment.level
    )
  ) {
    response.assessment.level = "moderate";
  }

  if (
    typeof response.assessment.title !== "string"
  ) {
    response.assessment.title =
      fallback.assessment.title;
  }

  if (
    typeof response.assessment.summary !== "string"
  ) {
    response.assessment.summary =
      fallback.assessment.summary;
  }

  /*
  -------------------------------------------------------
  SYMPTOMS
  -------------------------------------------------------
  */

  if (
    !response.symptoms ||
    typeof response.symptoms !== "object"
  ) {
    response.symptoms = fallback.symptoms;
  }

  if (
    !Array.isArray(
      response.symptoms.reported
    )
  ) {
    response.symptoms.reported = [];
  }

  if (
    response.symptoms.duration !== null &&
    typeof response.symptoms.duration !== "string"
  ) {
    response.symptoms.duration = null;
  }

  /*
  -------------------------------------------------------
  INSIGHTS
  -------------------------------------------------------
  */

  if (!Array.isArray(response.insights)) {
    response.insights = [];
  }

  response.insights = response.insights
    .filter(
      (item) =>
        item &&
        typeof item === "object"
    )
    .map((item) => ({
      title:
        typeof item.title === "string"
          ? item.title
          : "Health insight",

      description:
        typeof item.description === "string"
          ? item.description
          : "",
    }));

  /*
  -------------------------------------------------------
  NEXT STEP
  -------------------------------------------------------
  */

  if (
    !response.next_step ||
    typeof response.next_step !== "object"
  ) {
    response.next_step =
      fallback.next_step;
  }

  if (
    typeof response.next_step.type !== "string"
  ) {
    response.next_step.type = "doctor";
  }

  if (
    typeof response.next_step.specialty !==
    "string"
  ) {
    response.next_step.specialty =
      "General Physician";
  }

  if (
    typeof response.next_step.reason !==
    "string"
  ) {
    response.next_step.reason =
      fallback.next_step.reason;
  }

  /*
  -------------------------------------------------------
  SELF CARE
  -------------------------------------------------------
  */

  if (!Array.isArray(response.self_care)) {
    response.self_care = [];
  }

  response.self_care = response.self_care
    .filter(
      (item) =>
        item &&
        typeof item === "object"
    )
    .map((item) => ({
      action:
        typeof item.action === "string"
          ? item.action
          : "",

      reason:
        typeof item.reason === "string"
          ? item.reason
          : "",
    }))
    .filter((item) => item.action);

  /*
  -------------------------------------------------------
  SAFETY
  -------------------------------------------------------
  */

  const allowedSafetyLevels = [
    "normal",
    "watch",
    "urgent",
    "emergency",
  ];

  if (
    !response.safety ||
    typeof response.safety !== "object"
  ) {
    response.safety = fallback.safety;
  }

  if (
    !allowedSafetyLevels.includes(
      response.safety.level
    )
  ) {
    response.safety.level = "watch";
  }

  if (
    typeof response.safety.message !== "string"
  ) {
    response.safety.message =
      fallback.safety.message;
  }

  if (
    !Array.isArray(
      response.safety.warning_signs
    )
  ) {
    response.safety.warning_signs = [];
  }

  /*
  -------------------------------------------------------
  ACTIONS
  -------------------------------------------------------
  */

  if (!Array.isArray(response.actions)) {
    response.actions = fallback.actions;
  }

  /*
  -------------------------------------------------------
  SAFETY NOTE
  -------------------------------------------------------
  */

  if (
    typeof response.safety_note !== "string"
  ) {
    response.safety_note =
      fallback.safety_note;
  }

  return response;
};
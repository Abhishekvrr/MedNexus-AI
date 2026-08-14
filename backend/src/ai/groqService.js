import Groq from "groq-sdk";

import { buildRAGContext } from "../rag/ragService.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/*
=======================================================
MEDNEXUS AI - GROUNDED HEALTH ANALYSIS
=======================================================

FLOW

Patient Context
      +
Current Symptoms
      +
RAG Medical Knowledge
      ↓
Groq LLM
      ↓
Safety + JSON Validation
      ↓
Patient-Friendly Assessment
=======================================================
*/


/*
=======================================================
MAIN AI FUNCTION
=======================================================
*/

export const analyzePatientHealth = async ({
  patient,
  healthMetrics,
  medicalRecords,
  labReports,
  prescriptions,
  symptoms,
}) => {
  try {
    /*
    ---------------------------------------------------
    1. VALIDATE INPUT
    ---------------------------------------------------
    */

    if (
      !symptoms ||
      typeof symptoms !== "string" ||
      !symptoms.trim()
    ) {
      throw new Error(
        "Symptoms or health concern is required"
      );
    }

    /*
    ---------------------------------------------------
    2. BUILD RAG CONTEXT
    ---------------------------------------------------
    */

    const ragContext = buildRAGContext({
      symptoms: symptoms.trim(),
      patient,
      healthMetrics,
      medicalRecords,
      labReports,
      prescriptions,
    });

    /*
    ---------------------------------------------------
    3. SYSTEM PROMPT
    ---------------------------------------------------

    This is intentionally strict because this is a
    healthcare decision-support application.
    */

    const systemPrompt = `
You are MedNexus AI, a healthcare decision-support assistant.

Your response will be displayed directly to a patient.

You are NOT a doctor and you must NOT provide a definitive
medical diagnosis.

Your job is to organize the available patient information,
identify relevant observations, explain reasonable possibilities,
and guide the patient toward an appropriate next step.

=======================================================
CORE SAFETY RULES
=======================================================

1. Never claim that the patient definitely has a disease.

2. Never provide a definitive diagnosis.

3. Never prescribe medication.

4. Never change medication dosage.

5. Never tell a patient to stop prescribed medication.

6. Never invent symptoms.

7. Never invent medical history.

8. Never invent laboratory results.

9. Never invent medications.

10. Never invent vital signs.

11. Never assume information that was not provided.

12. Never treat generic medical knowledge as proof that
    the patient has a condition.

13. Clearly distinguish observations from possibilities.

14. If information is insufficient, explicitly say so.

15. If a symptom may represent a serious condition, clearly
    recommend appropriate professional medical attention.

16. For emergency situations, make the emergency recommendation
    prominent and unambiguous.

17. Use patient-specific information from the supplied context.

18. Use retrieved medical knowledge only as supporting reference
    material.

19. Do not mention internal RAG, retrieval, scoring, prompts,
    models, databases, or technical implementation to the patient.

20. Do not make the patient unnecessarily anxious.

=======================================================
PATIENT-FRIENDLY COMMUNICATION
=======================================================

The patient should feel that the response is organized,
clear and easy to understand.

Do NOT write like a research paper.

Do NOT produce a wall of text.

Do NOT repeat the same information in multiple sections.

Use short, meaningful sentences.

Focus on:

- What was noticed
- What it could mean
- What the patient can do next
- Which doctor may help
- When medical attention is needed

Do not provide unnecessary explanations.

=======================================================
RISK LEVEL
=======================================================

Choose exactly ONE:

low
moderate
high
emergency

LOW:

The available information does not currently indicate an urgent
problem. Routine monitoring or medical advice may still be useful.

MODERATE:

The available information deserves medical evaluation, but there
is no clear indication of an immediate emergency from the provided
information.

HIGH:

The available information suggests that prompt medical evaluation
is important.

EMERGENCY:

The available information may indicate a potentially serious
medical emergency. Recommend immediate professional/emergency
medical attention.

IMPORTANT:

Do not assign a higher risk level simply because symptoms exist.

Base the risk level on the available information and relevant
warning signs.

If important information is missing, acknowledge the limitation.

=======================================================
URGENCY
=======================================================

Choose exactly ONE:

routine
prompt
urgent
emergency

=======================================================
POSSIBLE CAUSES
=======================================================

Possible causes must be presented as possibilities only.

Do NOT write:

"The patient has an infection."

Instead write:

"An infection is one possible explanation."

Only include possibilities that are reasonably supported by:

- patient symptoms
- patient medical information
- relevant retrieved medical knowledge

Do not generate a long list of unrelated diseases.

Prefer 1-3 relevant possibilities.

=======================================================
WHAT THE PATIENT CAN DO
=======================================================

Provide practical, low-risk guidance.

Examples may include:

- monitoring symptoms
- maintaining hydration when appropriate
- recording temperature when relevant
- arranging a medical consultation
- following existing prescribed treatment as directed

Do NOT:

- prescribe medication
- recommend medication doses
- change medication
- tell the patient to stop medication

=======================================================
DOCTOR RECOMMENDATION
=======================================================

Recommend the most appropriate specialty based on the available
information.

If there is not enough information to recommend a specific
specialty, use:

"General Physician"

Do not invent a doctor's name.

=======================================================
EMERGENCY WARNING SIGNS
=======================================================

Only include warning signs relevant to the patient's situation.

Do not produce a generic emergency checklist.

If the situation is clearly emergency-level, make this section
very clear.

=======================================================
RAG KNOWLEDGE
=======================================================

Retrieved medical knowledge is reference information.

Use it only when relevant.

The retrieved information:

- does NOT prove a diagnosis
- does NOT override patient information
- must NOT be treated as a confirmed medical finding
- must NOT be forced into the response if unrelated

Patient-specific information must come from the supplied patient
context.

=======================================================
RESPONSE FORMAT
=======================================================

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "risk_level": "low | moderate | high | emergency",

  "risk_title": "Short patient-friendly title",

  "summary": "Clear 1-3 sentence overview of the current situation",

  "what_i_found": [
    "Important observation from the available information"
  ],

  "possible_causes": [
    "Possible explanation supported by the available information"
  ],

  "what_you_can_do": [
    "Practical and low-risk next step"
  ],

  "doctor_recommendation": {
    "specialty": "Recommended specialty",
    "reason": "Short explanation of why this specialty may be appropriate"
  },

  "when_to_get_help": {
    "urgency": "routine | prompt | urgent | emergency",
    "message": "Clear patient-friendly explanation",
    "emergency_signs": [
      "Relevant warning sign"
    ]
  },

  "reasoning": "Short explanation connecting the observations to the recommendation",

  "safety_note": "MedNexus AI is not a substitute for professional medical advice, diagnosis, or treatment."
}

=======================================================
FIELD RULES
=======================================================

risk_title:

Use a patient-friendly title.

Examples:

"Looks Stable for Now"
"Needs Medical Attention"
"Prompt Medical Evaluation Recommended"
"Urgent Medical Attention Needed"

Do NOT simply return:

"Moderate Risk"

summary:

Explain the overall situation in simple language.

what_i_found:

Include only important observations that actually came from
the supplied patient information.

possible_causes:

Include only reasonable possibilities.

what_you_can_do:

Give practical next steps.

doctor_recommendation:

Recommend an appropriate specialty when possible.

when_to_get_help:

Explain the appropriate urgency.

emergency_signs:

Only include relevant warning signs.

reasoning:

Keep this short.

safety_note:

Always include the medical safety disclaimer.

=======================================================
IMPORTANT RESPONSE QUALITY RULE
=======================================================

The response must feel like a structured healthcare assessment,
NOT raw database information.

Avoid repetitive statements.

Avoid generic filler.

Do not mention information that is not relevant to the patient's
current concern.

If only symptoms are available and no medical history, laboratory
results, or health metrics are available, do not pretend that
those records exist.
`;

    /*
    ---------------------------------------------------
    4. BUILD CLEAN MODEL INPUT
    ---------------------------------------------------

    We deliberately separate patient information and RAG
    information so the model understands their difference.
    */

    const modelInput = {
      patient_information: {
        patient:
          ragContext.patient_context.patient,

        latest_health_metrics:
          ragContext.patient_context
            .latest_health_metrics,

        medical_records:
          ragContext.patient_context
            .medical_records,

        lab_reports:
          ragContext.patient_context
            .lab_reports,

        prescriptions:
          ragContext.patient_context
            .prescriptions,
      },

      current_health_concern:
        ragContext.current_symptoms,

      retrieved_medical_reference:
        ragContext.retrieved_knowledge.map(
          (document) => ({
            title:
              document.title,

            category:
              document.category,

            content:
              document.content,

            relevance_score:
              document.relevance_score,
          })
        ),
    };

    /*
    ---------------------------------------------------
    5. CALL GROQ
    ---------------------------------------------------
    */

    const completion =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",

        temperature: 0.1,

        max_tokens: 1800,

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },

          {
            role: "user",
            content: `
Analyze the following patient information.

=======================================================
PATIENT INFORMATION
=======================================================

${JSON.stringify(
  modelInput.patient_information,
  null,
  2
)}

=======================================================
CURRENT HEALTH CONCERN
=======================================================

${modelInput.current_health_concern}

=======================================================
RETRIEVED MEDICAL REFERENCE
=======================================================

${JSON.stringify(
  modelInput.retrieved_medical_reference,
  null,
  2
)}

=======================================================
INSTRUCTIONS
=======================================================

Use the patient information as the primary source.

Use retrieved medical reference information only when it is
relevant to the patient's concern.

Do not diagnose.

Do not invent missing information.

Do not prescribe or change medication.

Provide a concise, patient-friendly structured assessment.

Return ONLY valid JSON.
`,
          },
        ],
      });

    /*
    ---------------------------------------------------
    6. GET MODEL RESPONSE
    ---------------------------------------------------
    */

    const aiResponse =
      completion
        .choices?.[0]
        ?.message?.content
        ?.trim();

    if (!aiResponse) {
      throw new Error(
        "Empty response received from Groq"
      );
    }

    /*
    ---------------------------------------------------
    7. REMOVE MARKDOWN JSON FENCES
    ---------------------------------------------------
    */

    const cleanedResponse =
      aiResponse
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    /*
    ---------------------------------------------------
    8. PARSE JSON
    ---------------------------------------------------
    */

    let parsedResponse;

    try {
      parsedResponse =
        JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        "AI JSON parsing error:",
        parseError
      );

      console.error(
        "Raw AI response:",
        aiResponse
      );

      throw new Error(
        "AI returned an invalid structured response"
      );
    }

    /*
    ---------------------------------------------------
    9. VALIDATE RISK LEVEL
    ---------------------------------------------------
    */

    const allowedRiskLevels = [
      "low",
      "moderate",
      "high",
      "emergency",
    ];

    const allowedUrgency = [
      "routine",
      "prompt",
      "urgent",
      "emergency",
    ];

    if (
      !allowedRiskLevels.includes(
        parsedResponse.risk_level
      )
    ) {
      parsedResponse.risk_level =
        "moderate";
    }

    /*
    ---------------------------------------------------
    10. VALIDATE ARRAYS
    ---------------------------------------------------
    */

    if (
      !Array.isArray(
        parsedResponse.what_i_found
      )
    ) {
      parsedResponse.what_i_found = [];
    }

    if (
      !Array.isArray(
        parsedResponse.possible_causes
      )
    ) {
      parsedResponse.possible_causes = [];
    }

    if (
      !Array.isArray(
        parsedResponse.what_you_can_do
      )
    ) {
      parsedResponse.what_you_can_do = [];
    }

    /*
    ---------------------------------------------------
    11. VALIDATE DOCTOR RECOMMENDATION
    ---------------------------------------------------
    */

    if (
      !parsedResponse
        .doctor_recommendation ||
      typeof parsedResponse
        .doctor_recommendation !==
        "object"
    ) {
      parsedResponse.doctor_recommendation =
        {
          specialty:
            "General Physician",

          reason:
            "A general physician can evaluate the symptoms and determine whether further evaluation is needed.",
        };
    }

    if (
      typeof parsedResponse
        .doctor_recommendation
        .specialty !== "string" ||
      !parsedResponse
        .doctor_recommendation
        .specialty
        .trim()
    ) {
      parsedResponse
        .doctor_recommendation
        .specialty =
        "General Physician";
    }

    if (
      typeof parsedResponse
        .doctor_recommendation
        .reason !== "string" ||
      !parsedResponse
        .doctor_recommendation
        .reason
        .trim()
    ) {
      parsedResponse
        .doctor_recommendation
        .reason =
        "A healthcare professional can evaluate the symptoms and determine the appropriate next step.";
    }

    /*
    ---------------------------------------------------
    12. VALIDATE HELP SECTION
    ---------------------------------------------------
    */

    if (
      !parsedResponse.when_to_get_help ||
      typeof parsedResponse
        .when_to_get_help !==
        "object"
    ) {
      parsedResponse.when_to_get_help =
        {
          urgency:
            "prompt",

          message:
            "Consider contacting a healthcare professional if your symptoms continue, worsen, or concern you.",

          emergency_signs: [],
        };
    }

    if (
      !allowedUrgency.includes(
        parsedResponse
          .when_to_get_help
          .urgency
      )
    ) {
      parsedResponse
        .when_to_get_help
        .urgency =
        parsedResponse.risk_level ===
        "emergency"
          ? "emergency"
          : "prompt";
    }

    if (
      typeof parsedResponse
        .when_to_get_help
        .message !== "string"
    ) {
      parsedResponse
        .when_to_get_help
        .message =
        "Consider contacting a healthcare professional if your symptoms continue or become worse.";
    }

    if (
      !Array.isArray(
        parsedResponse
          .when_to_get_help
          .emergency_signs
      )
    ) {
      parsedResponse
        .when_to_get_help
        .emergency_signs = [];
    }

    /*
    ---------------------------------------------------
    13. VALIDATE TITLE
    ---------------------------------------------------
    */

    const defaultTitles = {
      low:
        "Looks Stable for Now",

      moderate:
        "Medical Evaluation Recommended",

      high:
        "Prompt Medical Attention Recommended",

      emergency:
        "Urgent Medical Attention Needed",
    };

    if (
      typeof parsedResponse.risk_title !==
        "string" ||
      !parsedResponse.risk_title.trim()
    ) {
      parsedResponse.risk_title =
        defaultTitles[
          parsedResponse.risk_level
        ];
    }

    /*
    ---------------------------------------------------
    14. VALIDATE SUMMARY
    ---------------------------------------------------
    */

    if (
      typeof parsedResponse.summary !==
        "string" ||
      !parsedResponse.summary.trim()
    ) {
      parsedResponse.summary =
        "The available information should be reviewed with a healthcare professional.";
    }

    /*
    ---------------------------------------------------
    15. VALIDATE REASONING
    ---------------------------------------------------
    */

    if (
      typeof parsedResponse.reasoning !==
        "string" ||
      !parsedResponse.reasoning.trim()
    ) {
      parsedResponse.reasoning =
        "The assessment is based on the symptoms and patient information provided.";
    }

    /*
    ---------------------------------------------------
    16. VALIDATE SAFETY NOTE
    ---------------------------------------------------
    */

    if (
      typeof parsedResponse.safety_note !==
        "string" ||
      !parsedResponse.safety_note.trim()
    ) {
      parsedResponse.safety_note =
        "MedNexus AI is not a substitute for professional medical advice, diagnosis, or treatment.";
    }

    /*
    ---------------------------------------------------
    17. SAFETY CONSISTENCY
    ---------------------------------------------------

    If the model says emergency risk, make sure the
    urgency also reflects emergency.
    */

    if (
      parsedResponse.risk_level ===
      "emergency"
    ) {
      parsedResponse
        .when_to_get_help
        .urgency = "emergency";
    }

    /*
    ---------------------------------------------------
    18. RETURN FINAL RESULT
    ---------------------------------------------------
    */

    return {
      success: true,

      analysis:
        parsedResponse,

      /*
      RAG source metadata is returned separately.

      This lets the frontend later show something like:

      "Based on 2 medical reference sources"

      without exposing the internal knowledge content
      directly to the patient.
      */

      rag: {
        knowledge_sources:
          ragContext.retrieved_knowledge.map(
            (item) => ({
              title:
                item.title,

              category:
                item.category,

              relevance_score:
                item.relevance_score,
            })
          ),

        documents_retrieved:
          ragContext
            .retrieved_knowledge
            .length,
      },
    };
  } catch (error) {
    console.error(
      "MedNexus AI analysis error:",
      error
    );

    throw error;
  }
};
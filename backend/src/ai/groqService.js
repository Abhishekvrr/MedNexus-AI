import "dotenv/config";
import Groq from "groq-sdk";

import { buildRAGContext } from "../rag/ragService.js";

const getGroqClient = () => {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

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
      await getGroqClient().chat.completions.create({
        model:
          process.env.GROQ_MODEL || "openai/gpt-oss-120b",

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

/*
=======================================================
DOCTOR CLINICAL COPILOT
=======================================================
*/
export const chatWithDoctorCopilot = async ({
  doctor,
  patients = [],
  appointments = [],
  prescriptions = [],
  query: userQuery,
  history = [],
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const doctorName = doctor?.doctor_name || doctor?.full_name || "Doctor";
    const specialization = doctor?.specialization || "General Medicine";

    // Format patient context
    const patientsContext = patients.length > 0
      ? patients.map((p, idx) => `
Patient #${idx + 1}:
- Name: ${p.full_name || "Unknown"}
- Email: ${p.email || "N/A"} | Phone: ${p.phone || "N/A"}
- Gender: ${p.gender || "Unspecified"} | DOB: ${p.date_of_birth || "N/A"} | Blood Group: ${p.blood_group || "N/A"}
- Allergies: ${p.allergies || "None reported"}
- Chronic Conditions: ${p.chronic_conditions || "None documented"}
- Current Medications: ${p.current_medications || "None"}
- Total Appointments with you: ${p.appointment_count || 1}
- Last Appointment: ${p.last_appointment || "Recent"}
`).join("\n")
      : "No assigned patients currently on record.";

    // Format appointment context
    const appointmentsContext = appointments.length > 0
      ? appointments.map((a, idx) => `
Appointment #${idx + 1}:
- Patient: ${a.patient_name || "Patient"} (${a.patient_email || "N/A"})
- Date & Time: ${String(a.appointment_date).slice(0, 10)} at ${a.appointment_time || "Scheduled time"}
- Type: ${a.appointment_type || "in_person"}
- Status: ${a.status || "scheduled"}
- Reason / Complaint: ${a.reason || "General Consultation"}
`).join("\n")
      : "No appointments scheduled currently.";

    // Format prescriptions context
    const prescriptionsContext = prescriptions.length > 0
      ? prescriptions.map((pr, idx) => `
Prescription #${idx + 1}:
- Patient: ${pr.patient_name || pr.patient_id}
- Medicine: ${pr.medicine_name} (${pr.dosage || "Standard dose"})
- Frequency: ${pr.frequency || "As directed"} | Duration: ${pr.duration || "Course"}
- Status: ${pr.status || "active"} | Instructions: ${pr.instructions || "None"}
`).join("\n")
      : "No prescriptions issued yet.";

    const systemPrompt = `You are MedNexus AI Doctor Clinical Copilot, an elite, MD-level clinical decision support and practice intelligence assistant built specifically for licensed medical professionals.

You are assisting Dr. ${doctorName}, specialized in ${specialization}.

=== DOCTOR PRACTICE & CLINICAL DATABASE CONTEXT ===
[Assigned Patients Registry]
${patientsContext}

[Consultation Schedule & Appointments]
${appointmentsContext}

[Issued Prescriptions]
${prescriptionsContext}

=== YOUR CAPABILITIES & CLINICAL DIRECTIVES ===
1. Patient Queries (e.g. "show me patient details", "tell me about Test Patient"): Provide structured, professional patient clinical summaries with demographics, allergies, chronic conditions, current medications, and visit history.
2. Schedule & Practice Operations: Provide precise appointment summaries, pending/confirmed queues, and consultation counts.
3. Pharmacology & Drug Safety: Provide accurate drug-drug interaction warnings, standard therapeutic dosages, renal/hepatic adjustments, and side-effect profiles.
4. Clinical Decision Support: Offer evidence-based differential diagnoses, diagnostic workup recommendations, and guideline-adherent treatment protocols.
5. Tone & Structure: Professional, concise, physician-to-physician communication. Use Markdown formatting (bolding, bullet points, tables, caution boxes) for high readability.`;

    const messages = [
      { role: "system", content: systemPrompt },
    ];

    // Append conversation history
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role === "user" || msg.type === "user") {
          messages.push({ role: "user", content: msg.content || msg.text });
        } else if (msg.role === "assistant" || msg.type === "ai") {
          messages.push({ role: "assistant", content: msg.content || msg.text });
        }
      }
    }

    // Append current user query
    messages.push({ role: "user", content: userQuery });

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1500,
    });

    const reply = completion.choices[0]?.message?.content || "I am unable to process this request at the moment.";

    return {
      success: true,
      reply,
    };
  } catch (error) {
    console.error("Doctor AI Copilot error:", error);
    throw error;
  }
};

/*
=======================================================
AMBIENT CLINICAL VOICE SCRIBE (TRANSCRIPT TO SOAP + RX)
=======================================================
*/
export const generateAmbientSOAPNote = async ({
  transcript,
  doctorName = "Doctor",
  specialization = "General Practice",
  patientName = "Patient",
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const systemPrompt = `You are MedNexus AI Ambient Clinical Scribe, an MD-grade assistant that listens to real-time doctor-patient conversation transcripts and converts them into structured SOAP clinical notes and extracted prescription recommendations.

Return ONLY valid JSON matching this schema:
{
  "chief_complaint": "Primary complaint summarized in 1 sentence",
  "subjective": "Detailed symptoms, onset, duration, patient-reported feelings and history of present illness",
  "objective": "Vital signs mentioned, physical examination observations, clinician findings",
  "assessment": "Differential diagnosis and primary clinical impression",
  "plan": "Diagnostic workup, lifestyle advice, follow-up timeline, patient education",
  "extracted_prescriptions": [
    {
      "medicine_name": "Standard drug brand or generic name",
      "dosage": "e.g. 500mg, 10ml, 1 tablet",
      "frequency": "e.g. 1-0-1, 1-0-0, 0-0-1, or SOS",
      "duration": "e.g. 5 days, 14 days, 1 month",
      "instructions": "e.g. Take after food with water"
    }
  ],
  "follow_up_days": 7,
  "clinical_summary": "Concise 2-sentence summary for the patient chart"
}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Doctor: Dr. ${doctorName} (${specialization})\nPatient: ${patientName}\n\n[CONVERSATION TRANSCRIPT]:\n${transcript}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      success: true,
      soapNote: parsed,
    };
  } catch (error) {
    console.error("Ambient Scribe AI error:", error);
    throw error;
  }
};

/*
=======================================================
AI PRESCRIPTION DECODER & MULTILINGUAL VOICE EXPLAINER
=======================================================
*/
export const decodePrescriptionAI = async ({
  prescriptionText,
  patientLanguage = "en",
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const systemPrompt = `You are MedNexus AI Smart Prescription Decoder. Your job is to take raw, messy, or scanned prescription text and explain it with crystal clarity so a patient, caregiver, or elderly person can easily understand when, how, and why to take their medication without mistakes.

Return ONLY valid JSON matching this schema:
{
  "summary": "Clear, friendly 2-sentence overview of the prescribed treatment course",
  "medications": [
    {
      "name": "Medicine name",
      "purpose": "What this medicine is for in simple terms",
      "dosage": "Dosage amount",
      "timing_slots": {
        "morning": true,
        "afternoon": false,
        "night": true
      },
      "schedule_label": "e.g. 1-0-1 (Morning & Night)",
      "food_relation": "Before food | After food | With plenty of water",
      "duration": "e.g. 5 days",
      "critical_caution": "Important warning (e.g. Do not consume alcohol, Complete full course)"
    }
  ],
  "daily_timeline": [
    { "time_slot": "Morning (8:00 AM)", "items": ["Medicine 1 (After breakfast)"] },
    { "time_slot": "Afternoon (1:30 PM)", "items": [] },
    { "time_slot": "Night (9:00 PM)", "items": ["Medicine 1 (After dinner)"] }
  ],
  "voice_script_en": "Natural spoken explanation in English suitable for speech synthesis",
  "voice_script_hi": "Natural spoken explanation in Hindi (Devanagari or Romanized clear Hindi) for audio playback",
  "voice_script_es": "Natural spoken explanation in Spanish for audio playback",
  "emergency_warning": "Warning signs that require immediate doctor call"
}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Decode and structure this prescription text:\n\n${prescriptionText}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      success: true,
      decoded: parsed,
    };
  } catch (error) {
    console.error("Prescription Decoder AI error:", error);
    throw error;
  }
};

/*
=======================================================
BIOMETRIC RADAR & 5-YEAR DISEASE RISK SIMULATOR
=======================================================
*/
export const simulateHealthRiskTrajectory = async ({
  vitals,
  patient,
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const systemPrompt = `You are MedNexus AI Biometric Health Forecaster. Given patient vitals and health history, calculate biometric organ stress levels (0-100 scale) and simulate a 5-year disease risk trajectory showing current risk vs. potential risk if target metrics are improved.

Return ONLY valid JSON matching this schema:
{
  "organ_stress": {
    "cardiovascular": { "score": 68, "status": "Moderate Stress", "primary_driver": "Systolic BP 142 mmHg" },
    "metabolic": { "score": 75, "status": "High Stress", "primary_driver": "Fasting Glucose 165 mg/dL" },
    "renal": { "score": 35, "status": "Optimal", "primary_driver": "Hydration and filtration normal" },
    "neurological": { "score": 25, "status": "Low Stress", "primary_driver": "Sleep & vitals stable" },
    "respiratory": { "score": 20, "status": "Optimal", "primary_driver": "SpO2 98%" }
  },
  "five_year_trajectory": {
    "current_path_risk_score": 58,
    "optimized_path_risk_score": 18,
    "risk_reduction_percentage": 68,
    "projected_milestones": [
      { "year": "Year 1", "current_forecast": "Sustained arterial tension", "optimized_forecast": "Blood pressure normalized to 120/80" },
      { "year": "Year 3", "current_forecast": "Pre-diabetic progression risk", "optimized_forecast": "HbA1c stabilized below 5.7%" },
      { "year": "Year 5", "current_forecast": "42% elevated cardiac event risk", "optimized_forecast": "Cardiovascular risk lowered to baseline" }
    ],
    "high_impact_interventions": [
      "Lower daily sodium intake below 2,000mg to drop systolic BP by 8-10 points",
      "30 minutes of brisk walking 5 days/week to boost insulin sensitivity",
      "Regular adherence to prescribed maintenance therapy"
    ]
  },
  "overall_health_grade": "B-",
  "executive_summary": "Comprehensive 2-sentence summary of biometric state"
}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient Data:\n${JSON.stringify({ vitals, patient }, null, 2)}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      success: true,
      trajectory: parsed,
    };
  } catch (error) {
    console.error("Biometric Forecaster AI error:", error);
    throw error;
  }
};

/*
=======================================================
DISEASE-SPECIFIC FOOD & NUTRITION DIET PLANNER
=======================================================
*/
export const generateDiseaseDietPlan = async ({
  diseaseOrSymptoms,
  patient,
  vitals,
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const systemPrompt = `You are MedNexus AI Clinical Nutritionist & Metabolic Specialist. Given a patient's diagnosed condition, symptoms, and health vitals, generate a scientifically grounded, patient-friendly dietary and nutrition plan.

Return ONLY valid JSON matching this schema:
{
  "condition_title": "e.g. Therapeutic Diet for Acute Bronchitis & Respiratory Recovery",
  "nutritional_summary": "2-3 sentences explaining how this diet accelerates recovery and reduces cellular inflammation",
  "foods_to_eat": [
    { "category": "Proteins / Repair", "items": ["Warm bone broth or lentil soup", "Steamed fish or tofu"], "benefit": "Provides amino acids for immune tissue repair" },
    { "category": "Anti-inflammatory & Antioxidants", "items": ["Ginger-turmeric tea with honey", "Berries and citrus fruits"], "benefit": "Soothes inflamed respiratory mucosa" },
    { "category": "Hydration & Electrolytes", "items": ["Warm lemon water", "Coconut water"], "benefit": "Thins mucus secretions and maintains cellular fluid balance" }
  ],
  "foods_to_avoid": [
    { "food": "Ice-cold drinks & ice cream", "reason": "Can trigger bronchial spasms and thicken respiratory secretions" },
    { "food": "Deep-fried & heavy oily foods", "reason": "Induces acid reflux and gastric distension, worsening breathlessness" },
    { "food": "Excessive refined sugar", "reason": "Suppresses white blood cell phagocytic activity" }
  ],
  "daily_meal_plan": {
    "breakfast": "Warm oatmeal with crushed almonds and a cup of ginger-tulsi tea",
    "mid_morning": "Fresh pomegranate or orange slices with a glass of lukewarm water",
    "lunch": "Steamed brown rice or quinoa with mixed vegetable curry and warm lentil dal",
    "evening_snack": "Steamed edamame or roasted chickpeas with herbal chamomile tea",
    "dinner": "Light vegetable stew or clear chicken broth with soft sourdough"
  },
  "hydration_target": "2.5 to 3.0 Liters daily (preferably warm fluids)",
  "clinical_diet_tip": "Important lifestyle or timing tip (e.g. Eat dinner at least 2.5 hours before sleeping)"
}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Condition/Symptoms: ${diseaseOrSymptoms}\nPatient: ${JSON.stringify({ patient, vitals }, null, 2)}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      success: true,
      dietPlan: parsed,
    };
  } catch (error) {
    console.error("Diet Planner AI error:", error);
    throw error;
  }
};

/*
=======================================================
NATURAL LANGUAGE TABLET & LAB REPORT EXPLAINER (NLP Q&A)
=======================================================
*/
export const explainTabletAndReportNLP = async ({
  question,
  prescriptions = [],
  medicalRecords = [],
  labReports = [],
  patient = {},
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const rxContext = prescriptions.map((p) => `- ${p.medicine_name} (${p.dosage || ""}) | Freq: ${p.frequency || ""} | Instructions: ${p.instructions || "None"}`).join("\n") || "No active prescriptions documented.";
    const labContext = labReports.map((l) => `- ${l.test_name}: ${l.result_value} ${l.unit || ""} (Ref: ${l.reference_range || "N/A"}) [Status: ${l.status}]`).join("\n") || "No recent lab reports.";
    const recordContext = medicalRecords.map((m) => `- ${m.diagnosis || "Consultation"}: ${m.treatment || ""}`).join("\n") || "No previous records.";

    const systemPrompt = `You are MedNexus AI Patient Medication & Lab Explainer. A patient is asking a question in natural language about their prescribed tablets, dosage, food interactions, side-effects, or laboratory test results.

=== PATIENT ACTIVE CLINICAL DATA ===
[Prescribed Medicines]:
${rxContext}

[Lab Results]:
${labContext}

[Medical Chart / Diagnoses]:
${recordContext}

[Allergies]: ${patient.allergies || "None reported"}

=== DIRECTIVES ===
1. Answer the patient's exact question clearly in warm, simple, empathetic language.
2. Explain *why* their doctor prescribed the medicine or what their lab test value means in plain terms.
3. Highlight critical food/drink interactions (e.g. take with water, avoid grapefruit, avoid alcohol, take with food to prevent gastritis).
4. Provide structured caution points if relevant.
5. Always remind the patient to verify any major regimen changes with their prescribing doctor.

Return ONLY valid JSON matching this schema:
{
  "answer": "Clear, comprehensive, and reassuring answer to the patient's question",
  "medicine_or_test_highlighted": "Name of medicine or test discussed",
  "key_takeaways": [
    "Important takeaway 1",
    "Important takeaway 2"
  ],
  "food_and_drink_cautions": [
    "e.g. Take after food to prevent stomach irritation",
    "Avoid alcohol during this course"
  ],
  "when_to_alert_doctor": "Specific signs that require immediate physician call"
}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient Question: "${question}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error("Tablet Explainer AI error:", error);
    throw error;
  }
};

/*
=======================================================
POST-MEDICATION RECOVERY CHECK-IN & WELL-WISHER
=======================================================
*/
export const generatePostTreatmentCheckIn = async ({
  completedPrescription,
  doctorName = "your doctor",
  patientName = "Patient",
}) => {
  try {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const systemPrompt = `You are MedNexus AI Empathetic Clinical Care Concierge. A patient has just finished their prescribed medication course (or reached their follow-up milestone).

Generate a caring, personalized check-in message to evaluate their recovery, ask about their symptom resolution, and provide smooth guidance if they need a follow-up consultation with their doctor.

Return ONLY valid JSON matching this schema:
{
  "greeting": "Personalized, warm greeting to the patient",
  "checkin_message": "Empathetic 2-3 sentence message recognizing the completed medicine course and asking how they feel now",
  "recovery_assessment_options": [
    { "id": "recovered", "label": "Fully Recovered 😊", "sub": "No more symptoms or discomfort" },
    { "id": "better", "label": "Much Better 🤔", "sub": "Mild lingering symptoms" },
    { "id": "unwell", "label": "Still Unwell / Recurring 🤒", "sub": "Need doctor follow-up" }
  ],
  "advice_if_unwell": "Reassuring message explaining why a follow-up visit with Dr. [Doctor] is recommended if symptoms persist",
  "suggest_follow_up": true,
  "follow_up_doctor_name": "${doctorName}"
}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient: ${patientName}\nCompleted Prescription: ${JSON.stringify(completedPrescription, null, 2)}\nPrescribing Doctor: Dr. ${doctorName}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      success: true,
      checkIn: parsed,
    };
  } catch (error) {
    console.error("Recovery check-in AI error:", error);
    throw error;
  }
};
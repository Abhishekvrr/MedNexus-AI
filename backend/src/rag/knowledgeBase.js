/*
-------------------------------------------------------
MEDNEXUS AI - MEDICAL KNOWLEDGE BASE

This is the initial local knowledge layer for RAG.

IMPORTANT:
This knowledge base is for AI decision support only.
It must not be treated as a medical diagnosis system.
-------------------------------------------------------
*/

const knowledgeBase = [
  {
    id: "fever-001",
    category: "general",
    title: "Fever - General Guidance",
    content: `
Fever is an elevation in body temperature that can occur with
many infections and other conditions.

Important assessment factors include:
- duration of fever
- measured temperature
- age
- associated symptoms
- hydration status
- existing medical conditions
- medications

Medical evaluation should be considered when fever is persistent,
severe, associated with concerning symptoms, or occurs in a person
who may be medically vulnerable.

Emergency medical evaluation may be appropriate when fever is
associated with severe breathing difficulty, altered consciousness,
seizures, severe dehydration, or other serious symptoms.
`,
    keywords: [
      "fever",
      "temperature",
      "high temperature",
      "body temperature",
      "infection",
    ],
  },

  {
    id: "headache-001",
    category: "general",
    title: "Headache - General Guidance",
    content: `
Headaches can have many possible causes including dehydration,
sleep problems, stress, infections, medication effects, and
other medical conditions.

Assessment should consider:
- severity
- duration
- frequency
- sudden versus gradual onset
- associated symptoms
- previous headache history

A sudden severe headache, especially when accompanied by
neurological symptoms, confusion, fainting, seizures, or serious
illness symptoms requires prompt medical evaluation.
`,
    keywords: [
      "headache",
      "head pain",
      "migraine",
      "pressure in head",
    ],
  },

  {
    id: "cough-001",
    category: "respiratory",
    title: "Cough - General Guidance",
    content: `
Cough can occur with respiratory infections, allergies, asthma,
irritation, reflux, and other conditions.

Useful assessment information includes:
- duration
- dry or productive cough
- fever
- breathing difficulty
- chest pain
- wheezing
- blood in sputum

Breathing difficulty, significant chest pain, blue or gray lips,
confusion, or coughing up significant blood requires urgent
medical evaluation.
`,
    keywords: [
      "cough",
      "dry cough",
      "wet cough",
      "phlegm",
      "sputum",
      "wheezing",
      "breathing",
    ],
  },

  {
    id: "chest-pain-001",
    category: "emergency",
    title: "Chest Pain - Safety Guidance",
    content: `
Chest pain can have many causes, ranging from relatively minor
conditions to potentially serious medical emergencies.

The AI should not attempt to determine the cause from symptoms
alone.

Urgent professional evaluation is especially important when chest
pain is severe, persistent, pressure-like, or associated with
shortness of breath, sweating, fainting, nausea, weakness, or pain
radiating to the arm, jaw, back, or shoulder.
`,
    keywords: [
      "chest pain",
      "chest pressure",
      "chest tightness",
      "heart pain",
    ],
  },

  {
    id: "breathing-001",
    category: "emergency",
    title: "Breathing Difficulty - Safety Guidance",
    content: `
Shortness of breath or difficulty breathing can have many causes.

The severity and speed of onset are important.

Severe or rapidly worsening breathing difficulty, inability to speak
normally because of breathlessness, blue or gray lips, confusion,
fainting, or severe chest pain requires urgent emergency medical
attention.
`,
    keywords: [
      "shortness of breath",
      "breathing difficulty",
      "difficulty breathing",
      "breathlessness",
      "cannot breathe",
    ],
  },

  {
    id: "diabetes-001",
    category: "metabolic",
    title: "Diabetes - General Guidance",
    content: `
Diabetes management may involve monitoring blood glucose,
medications, nutrition, physical activity, and regular medical
follow-up.

AI-generated guidance should use the patient's actual laboratory
and clinical information when available.

The AI should not independently change medication doses or advise
a patient to stop prescribed diabetes medication.
`,
    keywords: [
      "diabetes",
      "blood sugar",
      "glucose",
      "high sugar",
      "low sugar",
    ],
  },

  {
    id: "hypertension-001",
    category: "cardiovascular",
    title: "Blood Pressure - General Guidance",
    content: `
Blood pressure should be interpreted using the patient's actual
measurements, measurement conditions, age, medical history, and
clinical context.

Repeated abnormal readings should be discussed with a qualified
healthcare professional.

Extremely abnormal blood pressure together with symptoms such as
chest pain, severe headache, neurological changes, confusion, or
breathing difficulty requires urgent medical assessment.
`,
    keywords: [
      "blood pressure",
      "bp",
      "hypertension",
      "high bp",
      "low bp",
    ],
  },
];

export default knowledgeBase;
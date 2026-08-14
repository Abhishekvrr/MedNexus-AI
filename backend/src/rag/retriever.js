import knowledgeBase from "./knowledgeBase.js";

/*
===========================================================
MEDNEXUS AI - RAG RETRIEVER
===========================================================

Purpose:
Retrieve the most relevant medical knowledge from the
local knowledge base based on the patient's health concern.

Current architecture:
Symptoms
   ↓
Retriever
   ↓
Knowledge Base
   ↓
Relevant Documents
   ↓
RAG Service

This version improves the original keyword retrieval by using:

1. Exact phrase matching
2. Individual keyword matching
3. Knowledge-base keyword matching
4. Title/category matching
5. Basic medical synonym matching
6. Duplicate-word protection
7. Relevance scoring
===========================================================
*/


/*
===========================================================
1. NORMALIZE TEXT
===========================================================
*/

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};


/*
===========================================================
2. BASIC STOP WORDS
===========================================================
*/

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "have",
  "has",
  "been",
  "from",
  "are",
  "was",
  "were",
  "you",
  "your",
  "what",
  "how",
  "why",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "very",
  "some",
  "about",
  "into",
  "after",
  "before",
  "since",
  "than",
  "then",
  "also",
  "just",
  "feel",
  "feeling",
  "having",
]);


/*
===========================================================
3. BASIC MEDICAL SYNONYMS
===========================================================

This does NOT diagnose anything.

It simply helps retrieval find relevant knowledge when
patients use different words for the same concern.
===========================================================
*/

const synonymMap = {
  headache: [
    "headache",
    "head pain",
    "pain in head",
    "pressure in head",
    "migraine",
  ],

  fever: [
    "fever",
    "temperature",
    "high temperature",
    "body temperature",
    "feverish",
  ],

  cough: [
    "cough",
    "coughing",
    "dry cough",
    "wet cough",
    "phlegm",
    "sputum",
  ],

  breathing: [
    "breathing",
    "breathlessness",
    "shortness of breath",
    "difficulty breathing",
    "cannot breathe",
  ],

  chest: [
    "chest pain",
    "chest pressure",
    "chest tightness",
    "heart pain",
  ],

  diabetes: [
    "diabetes",
    "blood sugar",
    "glucose",
    "high sugar",
    "low sugar",
  ],

  blood_pressure: [
    "blood pressure",
    "bp",
    "high bp",
    "low bp",
    "hypertension",
  ],
};


/*
===========================================================
4. GET QUERY TERMS
===========================================================
*/

const getQueryTerms = (query = "") => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  const words = normalizedQuery
    .split(" ")
    .filter(
      (word) =>
        word.length >= 3 &&
        !stopWords.has(word)
    );

  const phrases = [];

  for (const group of Object.values(synonymMap)) {
    for (const phrase of group) {
      if (
        normalizedQuery.includes(
          normalizeText(phrase)
        )
      ) {
        phrases.push(normalizeText(phrase));
      }
    }
  }

  return [
    ...new Set([
      ...words,
      ...phrases,
    ]),
  ];
};


/*
===========================================================
5. BUILD SEARCHABLE DOCUMENT
===========================================================
*/

const buildSearchableText = (document) => {
  return normalizeText(
    [
      document.title,
      document.category,
      document.content,
      ...(document.keywords || []),
    ].join(" ")
  );
};


/*
===========================================================
6. CALCULATE RELEVANCE SCORE
===========================================================
*/

const calculateScore = (
  query,
  document
) => {
  const normalizedQuery =
    normalizeText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const searchableText =
    buildSearchableText(document);

  const queryTerms =
    getQueryTerms(query);

  let score = 0;


/*
-----------------------------------------------------------
A. Exact phrase match
-----------------------------------------------------------
*/

  if (
    searchableText.includes(
      normalizedQuery
    )
  ) {
    score += 10;
  }


/*
-----------------------------------------------------------
B. Individual query terms
-----------------------------------------------------------
*/

  for (const term of queryTerms) {
    if (!term) {
      continue;
    }

    if (
      searchableText.includes(term)
    ) {
      score += 2;
    }
  }


/*
-----------------------------------------------------------
C. Knowledge-base keyword match
-----------------------------------------------------------
*/

  for (
    const keyword of document.keywords || []
  ) {
    const normalizedKeyword =
      normalizeText(keyword);

    if (!normalizedKeyword) {
      continue;
    }

    if (
      normalizedQuery.includes(
        normalizedKeyword
      )
    ) {
      score += 7;
    }

    /*
    Also reward when a query term matches
    a knowledge-base keyword.
    */

    for (const term of queryTerms) {
      if (
        term === normalizedKeyword
      ) {
        score += 5;
      }
    }
  }


/*
-----------------------------------------------------------
D. Title match
-----------------------------------------------------------
*/

  const normalizedTitle =
    normalizeText(
      document.title || ""
    );

  if (
    normalizedTitle &&
    normalizedQuery.includes(
      normalizedTitle
    )
  ) {
    score += 8;
  }


/*
-----------------------------------------------------------
E. Category relevance
-----------------------------------------------------------
*/

  const normalizedCategory =
    normalizeText(
      document.category || ""
    );

  if (
    normalizedCategory &&
    normalizedQuery.includes(
      normalizedCategory
    )
  ) {
    score += 3;
  }


/*
-----------------------------------------------------------
F. Emergency knowledge gets a small priority when
emergency-related symptoms are explicitly present.
-----------------------------------------------------------
*/

  const emergencyTerms = [
    "chest pain",
    "chest pressure",
    "difficulty breathing",
    "shortness of breath",
    "cannot breathe",
    "fainting",
    "seizure",
    "confusion",
    "severe bleeding",
  ];

  const emergencyMatch =
    emergencyTerms.some(
      (term) =>
        normalizedQuery.includes(term)
    );

  if (
    emergencyMatch &&
    document.category === "emergency"
  ) {
    score += 12;
  }


  return score;
};


/*
===========================================================
7. RETRIEVE RELEVANT KNOWLEDGE
===========================================================
*/

export const retrieveRelevantKnowledge = (
  query,
  limit = 3
) => {
  if (!query || !String(query).trim()) {
    return [];
  }

  const results = knowledgeBase
    .map((document) => ({
      ...document,
      score: calculateScore(
        query,
        document
      ),
    }))
    .filter(
      (document) =>
        document.score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);

  return results;
};


/*
===========================================================
8. OPTIONAL DEBUG FUNCTION

Useful during development.

You can call this later if we want to inspect
which documents were retrieved.
===========================================================
*/

export const debugRAGRetrieval = (
  query
) => {
  const results =
    retrieveRelevantKnowledge(
      query,
      5
    );

  console.log(
    "\n========== MEDNEXUS RAG =========="
  );

  console.log(
    "Query:",
    query
  );

  console.log(
    "Retrieved documents:"
  );

  results.forEach(
    (document, index) => {
      console.log(
        `${index + 1}. ${document.title} | Score: ${document.score}`
      );
    }
  );

  console.log(
    "==================================\n"
  );

  return results;
};


export default retrieveRelevantKnowledge;
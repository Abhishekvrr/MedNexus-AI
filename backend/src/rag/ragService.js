import {
  retrieveRelevantKnowledge,
} from "./retriever.js";

/*
=======================================================
MEDNEXUS AI - RAG SERVICE
=======================================================

Responsibilities:

1. Retrieve relevant medical knowledge
2. Combine retrieved knowledge with patient context
3. Provide grounded information to the AI model

The architecture remains unchanged.

Flow:

Patient Symptoms
      ↓
RAG Retriever
      ↓
Relevant Knowledge
      ↓
Patient Context
      ↓
Groq AI
=======================================================
*/

export const buildRAGContext = ({
  symptoms,
  patient,
  healthMetrics,
  medicalRecords,
  labReports,
  prescriptions,
}) => {
  /*
  -------------------------------------------------------
  Retrieve relevant medical knowledge

  We retrieve up to 5 relevant documents instead of
  the previous 3.
  -------------------------------------------------------
  */

  const retrievedKnowledge =
    retrieveRelevantKnowledge(
      symptoms,
      5
    );

  /*
  -------------------------------------------------------
  Build patient context
  -------------------------------------------------------
  */

  const patientContext = {
    patient:
      patient || null,

    latest_health_metrics:
      healthMetrics || null,

    medical_records:
      medicalRecords || [],

    lab_reports:
      labReports || [],

    prescriptions:
      prescriptions || [],
  };

  /*
  -------------------------------------------------------
  Format retrieved knowledge
  -------------------------------------------------------
  */

  const knowledgeContext =
    retrievedKnowledge.map(
      (document) => ({
        id:
          document.id,

        title:
          document.title,

        category:
          document.category,

        content:
          document.content,

        keywords:
          document.keywords || [],

        relevance_score:
          document.score,
      })
    );

  /*
  -------------------------------------------------------
  Return complete RAG context
  -------------------------------------------------------
  */

  return {
    patient_context:
      patientContext,

    current_symptoms:
      symptoms || "",

    retrieved_knowledge:
      knowledgeContext,

    retrieval_metadata: {
      documents_retrieved:
        knowledgeContext.length,

      retrieval_limit: 5,

      retrieval_method:
        "keyword_phrase_safety_ranking",
    },
  };
};
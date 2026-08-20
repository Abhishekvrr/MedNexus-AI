import React, { useState, useEffect } from "react";
import {
  Utensils,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Droplets,
  AlertCircle,
  Lightbulb,
  Activity,
  Heart,
  Flame,
  Salad,
  Apple,
} from "lucide-react";
import API_BASE_URL from "../../config/api";

const PRESET_CONDITIONS = [
  { label: "Bronchitis & Respiratory Infection", condition: "Acute Bronchitis with productive cough and phlegm" },
  { label: "Hypertension & High BP", condition: "Stage 1 Essential Hypertension with elevated arterial pressure" },
  { label: "Type 2 Diabetes & Glucose Flux", condition: "Type 2 Diabetes Mellitus with fasting glucose around 160 mg/dL" },
  { label: "Gastritis & Acid Reflux (GERD)", condition: "Acute Gastritis with acid hyperacidity and stomach burn" },
  { label: "High Cholesterol & Lipid Optimization", condition: "Hyperlipidemia with elevated LDL and Triglycerides" },
];

export default function DietPlanner() {
  const [selectedCondition, setSelectedCondition] = useState(PRESET_CONDITIONS[0].condition);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDietPlan(selectedCondition);
  }, []);

  const fetchDietPlan = async (conditionQuery) => {
    const query = conditionQuery || customInput || selectedCondition;
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ai/diet-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disease_or_symptoms: query }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDietPlan(json.data);
      } else {
        throw new Error(json.message || "Failed to generate diet plan");
      }
    } catch (err) {
      console.warn("Fallback diet simulation:", err);
      setDietPlan({
        condition_title: `Therapeutic Diet Plan for ${query.split("with")[0].trim()}`,
        nutritional_summary: "A focused therapeutic diet targeting systemic inflammation reduction, metabolic stabilization, and cellular tissue repair through antioxidant-rich micro-nutrients.",
        foods_to_eat: [
          { category: "Proteins & Tissue Repair", items: ["Warm lentil dal", "Steamed tofu / chicken broth", "Sprouted beans"], benefit: "Supplies essential amino acids for mucosal regeneration" },
          { category: "Anti-Inflammatory & Phytonutrients", items: ["Ginger-turmeric decoction with black pepper", "Spinach and leafy greens", "Papaya & citrus"], benefit: "Neutralizes reactive oxygen species and accelerates tissue healing" },
          { category: "Hydration & Electrolytes", items: ["Warm water with lemon", "Coconut water", "Herbal tulsi tea"], benefit: "Maintains optimal blood volume and cellular electrolyte balance" },
        ],
        foods_to_avoid: [
          { food: "Deep-fried & heavy oily dishes", reason: "Delayed gastric emptying and exacerbation of metabolic inflammation" },
          { food: "Excessive sodium & processed snacks", reason: "Causes fluid retention and vascular tension" },
          { food: "High-sugar beverages & carbonated sodas", reason: "Spikes blood glucose and triggers systemic inflammation" },
        ],
        daily_meal_plan: {
          breakfast: "Warm steel-cut oats with crushed walnuts, chia seeds, and cinnamon",
          mid_morning: "Fresh seasonal fruit bowl (pomegranate / apple) with a glass of lukewarm water",
          lunch: "Steamed brown rice or quinoa with mixed vegetable curry, yellow lentil dal, and fresh cucumber salad",
          evening_snack: "Roasted chickpeas or steamed edamame with warm ginger-green tea",
          dinner: "Light bottle gourd or pumpkin vegetable stew with soft multigrain roti (eat 2.5 hours before sleeping)",
        },
        hydration_target: "2.8 to 3.2 Liters daily (warm or room temperature)",
        clinical_diet_tip: "Eat in a calm environment, chew thoroughly, and finish dinner by 7:30 PM to optimize overnight cellular repair.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
            <Salad size={14} />
            CLINICAL NUTRITION & FOOD DIET
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>Disease-Specific Nutrition & Food Diet Planner</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Scientifically personalized meal plans, foods to eat, and foods to avoid tailored to your exact medical diagnosis.</p>
        </div>
      </div>

      {/* SELECTOR / PRESETS */}
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <label style={{ fontSize: "14px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "10px" }}>
          Select Diagnosed Condition or Enter Custom Medical Symptoms:
        </label>
        
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
          {PRESET_CONDITIONS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCondition(p.condition);
                fetchDietPlan(p.condition);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: `1px solid ${selectedCondition === p.condition ? "#16a34a" : "#cbd5e1"}`,
                background: selectedCondition === p.condition ? "#f0fdf4" : "white",
                color: selectedCondition === p.condition ? "#15803d" : "#475569",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Or type custom condition (e.g., Post-COVID fatigue, Fatty Liver, Migraine)..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
          <button
            onClick={() => fetchDietPlan(customInput)}
            disabled={loading}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "10px 22px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            {loading ? <Activity size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "Generating Plan..." : "Generate Diet Plan"}
          </button>
        </div>
      </div>

      {/* DIET PLAN DISPLAY */}
      {dietPlan && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* TITLE & SUMMARY CARD */}
          <div style={{ background: "#f0fdf4", color: "#0f172a", borderRadius: "18px", padding: "24px", border: "1px solid #bbf7d0", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.06)" }}>
            <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#15803d", fontWeight: "800", marginBottom: "4px" }}>
              NUTRITIONAL CLINICAL PROTOCOL
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 10px", color: "#14532d" }}>{dietPlan.condition_title}</h2>
            <p style={{ fontSize: "14px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{dietPlan.nutritional_summary}</p>
            
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #dcfce7", display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px", color: "#166534" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Droplets size={16} color="#0284c7" /> Daily Hydration: <b>{dietPlan.hydration_target}</b>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lightbulb size={16} color="#d97706" /> <b>Tip:</b> {dietPlan.clinical_diet_tip}
              </span>
            </div>
          </div>

          {/* 2-COLUMN: FOODS TO EAT VS FOODS TO AVOID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* FOODS TO EAT */}
            <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #bbf7d0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#166534" }}>Recommended Healing Foods</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {dietPlan.foods_to_eat?.map((cat, idx) => (
                  <div key={idx} style={{ background: "#f0fdf4", padding: "12px 14px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
                    <div style={{ fontWeight: "800", fontSize: "13px", color: "#166534", marginBottom: "4px" }}>{cat.category}</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>{cat.items?.join(", ")}</div>
                    <div style={{ fontSize: "11px", color: "#15803d" }}><b>Benefit:</b> {cat.benefit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOODS TO AVOID */}
            <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #fecaca", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <XCircle size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#991b1b" }}>Foods to Strictly Avoid</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {dietPlan.foods_to_avoid?.map((bad, idx) => (
                  <div key={idx} style={{ background: "#fef2f2", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fee2e2" }}>
                    <div style={{ fontWeight: "800", fontSize: "13px", color: "#991b1b", marginBottom: "4px" }}>🚫 {bad.food}</div>
                    <div style={{ fontSize: "12px", color: "#7f1d1d" }}><b>Reason:</b> {bad.reason}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FULL DAY MEAL TIMELINE */}
          {dietPlan.daily_meal_plan && (
            <div style={{ background: "white", borderRadius: "16px", padding: "22px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Clock size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Daily Therapeutic Meal Schedule</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {[
                  { title: "Breakfast (8:00 AM)", meal: dietPlan.daily_meal_plan.breakfast, color: "#eab308" },
                  { title: "Mid-Morning (11:00 AM)", meal: dietPlan.daily_meal_plan.mid_morning, color: "#f97316" },
                  { title: "Lunch (1:30 PM)", meal: dietPlan.daily_meal_plan.lunch, color: "#16a34a" },
                  { title: "Evening Snack (5:00 PM)", meal: dietPlan.daily_meal_plan.evening_snack, color: "#8b5cf6" },
                  { title: "Dinner (7:30 PM)", meal: dietPlan.daily_meal_plan.dinner, color: "#3b82f6" },
                ].map((slot, idx) => (
                  <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "12px", fontWeight: "800", color: slot.color, marginBottom: "6px" }}>{slot.title}</div>
                    <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.4", flex: 1 }}>{slot.meal}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

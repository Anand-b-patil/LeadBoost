import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import random
import json
import concurrent.futures


load_dotenv()

GEMINI_TIMEOUT = float(os.getenv("GEMINI_TIMEOUT", "8.0"))

try:
    import google.generativeai as genai
except ImportError:  
    genai = None

app = Flask(__name__)
CORS(app)  




@app.route("/api/health", methods=["GET"])
def health() -> tuple:
    return jsonify({"status": "ok"}), 200


def _safe_parse_json_text(json_text: str) -> dict:
    text = (json_text or "{}").strip()
    if '```json' in text:
        import re
        m = re.search(r"```json\s*([\s\S]*?)\s*```", text)
        if m:
            text = m.group(1)

    try:
        return json.loads(text)
    except Exception:
        return {}


@app.route("/api/models", methods=["GET"])
def list_models() -> tuple:
    if genai is None:
        return jsonify({"error": "Server missing dependency 'google-generativeai'"}), 500
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured"}), 500
    
    try:
        genai.configure(api_key=api_key)
        models = genai.list_models()
        model_names = [model.name for model in models if 'generateContent' in model.supported_generation_methods]
        return jsonify({"models": model_names}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/enrich", methods=["POST"])
def enrich() -> tuple:
    data = request.get_json(silent=True) or {}
    name = data.get("name", "Unknown")
    company = data.get("company", "Unknown Company")
    linkedin = data.get("linkedin", "")
    email = data.get("email") or f"{name.lower().replace(' ', '.')}@{company.lower().replace(' ', '')}.com"
    title = data.get("title", "")
    industry = data.get("industry") or data.get("sector")
    revenue = data.get("revenue")
    recent_signals = data.get("recent_signals", "")

    def compute_base_score(data: dict) -> int:
        # Deterministic scoring rubric matching README
        score = 0

        # Role seniority (0-30)
        title = (data.get("title") or "").lower()
        if any(x in title for x in ["founder", "ceo", "cto", "cfo", "co-founder"]):
            score += 30
        elif any(x in title for x in ["vp", "vice president", "head", "director"]):
            score += 20
        elif any(x in title for x in ["manager", "lead"]):
            score += 10

        # Company fit / size (0-25) - use revenue if provided, else industry heuristics
        comp_score = 0
        rev = data.get("revenue")
        if rev:
            try:
                # try to extract numeric part
                num = int(''.join(ch for ch in str(rev) if ch.isdigit()))
                if num > 100000000:  # large
                    comp_score = 25
                elif num > 5000000:
                    comp_score = 15
                else:
                    comp_score = 5
            except Exception:
                comp_score = 10
        else:
            industry = (data.get("industry") or "").lower()
            if any(x in industry for x in ["finance", "health", "technology", "saas"]):
                comp_score = 20
            else:
                comp_score = 10
        score += comp_score

        # Intent signals (0-25)
        signals = (data.get("recent_signals") or "").lower()
        intent = 0
        if any(x in signals for x in ["fund", "raised", "series", "hiring", "launch", "acquired"]):
            intent = 25
        elif any(x in signals for x in ["hiring", "growth", "expanding", "pilot"]):
            intent = 10
        score += intent

        # Contact quality (0-10)
        contact = 0
        if data.get("email") and data.get("linkedin"):
            contact = 10
        elif data.get("email") or data.get("linkedin"):
            contact = 5
        score += contact

        # Recency/context (0-10)
        recency = 0
        if "recent" in signals or "month" in signals or "week" in signals:
            recency = 8
        score += recency

        return max(0, min(100, int(score)))

    if genai is not None and os.getenv("GEMINI_API_KEY"):
        try:
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

            prompt = f"Analyze this lead and return JSON with priorityScore (0-100), aiInsight, isHotLead (true/false), industry and revenue. Lead:\nName: {name}\nCompany: {company}\nLinkedIn: {linkedin}\nEmail: {email}\n"

            model = genai.GenerativeModel("gemini-2.0-flash", generation_config={"temperature": 0.3})
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(model.generate_content, prompt)
                try:
                    response = future.result(timeout=GEMINI_TIMEOUT)
                    text = response.text if hasattr(response, "text") else str(response)
                except concurrent.futures.TimeoutError:
                    future.cancel()
                    print(f"Gemini enrichment timed out after {GEMINI_TIMEOUT}s - falling back to mock enrichment")
                    text = "{}" 

            import json
            scoring = _safe_parse_json_text(text)

            raw_ai_score = scoring.get("priorityScore")
            try:
                ai_score = int(float(raw_ai_score)) if raw_ai_score is not None else None
            except Exception:
                ai_score = None

            base_score = compute_base_score({
                "title": title,
                "industry": industry,
                "revenue": revenue,
                "email": email,
                "linkedin": linkedin,
                "recent_signals": recent_signals,
            })

            # If AI score missing or invalid, fallback to base_score
            final_score = ai_score if (ai_score is not None) else base_score
            final_score = max(0, min(100, int(final_score)))

            industry_val = scoring.get("industry") or industry or random.choice(["Technology", "Healthcare", "Finance", "E-commerce", "Education"])
            revenue_val = scoring.get("revenue") or revenue or f"{random.randint(50, 300)}Cr"
            is_hot = bool(scoring.get("isHotLead", False)) or final_score > 85
            ai_insight = scoring.get("aiInsight") or "No insight available"

            enriched_lead = {
                "name": name,
                "company": company,
                "linkedin": linkedin,
                "email": email,
                "industry": industry_val,
                "revenue": revenue_val,
                "base_score": base_score,
                "ai_score": ai_score,
                "priority_score": final_score,
                "score_source": "ai" if ai_score is not None else "base",
                "status": "🔥 Hot Lead" if final_score > 85 else ("High" if final_score > 75 else "Medium"),
                "ai_insight": ai_insight,
                "is_hot_lead": is_hot,
            }

            return jsonify(enriched_lead), 200
        except Exception as exc:
            print("Gemini enrichment failed:", exc)

    # Fallback deterministic enrichment when Gemini not available
    industries = ["Technology", "Healthcare", "Finance", "E-commerce", "Education"]
    industry_val = industry or random.choice(industries)
    revenue_val = revenue or f"{random.randint(50, 300)}Cr"

    base_score = compute_base_score({
        "title": title,
        "industry": industry_val,
        "revenue": revenue_val,
        "email": email,
        "linkedin": linkedin,
        "recent_signals": recent_signals,
    })

    enriched_lead = {
        "name": name,
        "company": company,
        "linkedin": linkedin,
        "email": email,
        "industry": industry_val,
        "revenue": revenue_val,
        "base_score": base_score,
        "ai_score": None,
        "priority_score": base_score,
        "score_source": "base",
        "status": "🔥 Hot Lead" if base_score > 85 else ("High" if base_score > 75 else "Medium"),
        "ai_insight": "Mock enrichment used",
        "is_hot_lead": base_score > 85,
    }

    return jsonify(enriched_lead), 200

@app.route("/api/generate", methods=["POST"])
def generate() -> tuple:
    if genai is None:
        return jsonify({
            "error": "Server missing dependency 'google-generativeai'. Run: pip install -r backend/requirements.txt"
        }), 500

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

    data = request.get_json(silent=True) or {}
    prompt: str = data.get("prompt", "").strip()
    model_name: str = data.get("model", "gemini-2.0-flash")
    system_instruction: str | None = data.get("system")
    temperature = data.get("temperature", 0.7)

    if not prompt:
        return jsonify({"error": "Missing 'prompt'"}), 400

    genai.configure(api_key=api_key)

    generation_config = {
        "temperature": float(temperature),
    }

    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_instruction,
        generation_config=generation_config,
    )

    try:
        response = model.generate_content(prompt)
        text = response.text if hasattr(response, "text") else str(response)
        return jsonify({"text": text}), 200
    except Exception as exc:  
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)



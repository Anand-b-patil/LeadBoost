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

            raw_score = scoring.get("priorityScore")
            try:
                score = int(float(raw_score)) if raw_score is not None else None
            except Exception:
                score = None
            if score is None:
                score = random.randint(50, 75)
            score = max(0, min(100, score))

            industry = scoring.get("industry") or random.choice(["Technology", "Healthcare", "Finance", "E-commerce", "Education"])
            revenue = scoring.get("revenue") or f"{random.randint(50, 300)}Cr"
            is_hot = bool(scoring.get("isHotLead", False))
            ai_insight = scoring.get("aiInsight") or "No insight available"

            enriched_lead = {
                "name": name,
                "company": company,
                "linkedin": linkedin,
                "email": email,
                "industry": industry,
                "revenue": revenue,
                "priority_score": score,
                "status": "🔥 Hot Lead" if score > 85 else ("High" if score > 75 else "Medium"),
                "ai_insight": ai_insight,
                "is_hot_lead": is_hot,
            }

            return jsonify(enriched_lead), 200
        except Exception as exc:
            print("Gemini enrichment failed:", exc)

    industries = ["Technology", "Healthcare", "Finance", "E-commerce", "Education"]
    industry = random.choice(industries)
    revenue = f"{random.randint(50, 300)}Cr"

    score = random.randint(60, 95)
    status = "🔥 Hot Lead" if score > 85 else ("High" if score > 75 else "Medium")

    enriched_lead = {
        "name": name,
        "company": company,
        "linkedin": linkedin,
        "email": email,
        "industry": industry,
        "revenue": revenue,
        "priority_score": score,
        "status": status,
        "ai_insight": "Mock enrichment used",
        "is_hot_lead": score > 85,
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



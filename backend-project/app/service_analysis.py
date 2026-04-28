import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any


SKILLS = [
    ("React", ["react", "react.js", "reactjs"]),
    ("TypeScript", ["typescript", "type script"]),
    ("Node.js", ["node.js", "nodejs", "node js"]),
    ("JavaScript", ["javascript", "java script", " js "]),
    ("HTML/CSS", ["html", "css", "tailwind"]),
    ("Python", ["python", "pandas", "fastapi", "django", "flask"]),
    ("Java", ["java", "spring"]),
    ("SQL", ["sql", "mysql", "postgresql", "database"]),
    ("MongoDB", ["mongodb", "mongo db"]),
    ("AWS", ["aws", "amazon web services"]),
    ("Docker", ["docker"]),
    ("Kubernetes", ["kubernetes", "k8s"]),
    ("Machine Learning", ["machine learning", " ml ", " ai ", "model"]),
    ("REST API", ["rest api", "api"]),
    ("Git", ["git", "github"]),
    ("Communication", ["communication", "presentation"]),
    ("Teamwork", ["teamwork", "collaboration", "collaborative"]),
    ("Problem Solving", ["problem solving", "troubleshooting", "debugging"]),
]

DOC_KEYWORDS = {
    "ID Proof": ["aadhaar", "pan", "passport", "identity", "date of birth", "dob", "address"],
    "Marksheet": ["marksheet", "grade", "semester", "cgpa", "percentage", "university", "board"],
    "Experience Letter": ["experience", "employment", "designation", "joining", "relieving", "company"],
    "Salary Slip": ["salary", "gross", "net pay", "deduction", "pf", "basic", "hra"],
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def read_text_from_file(path: str | Path) -> str:
    data = Path(path).read_bytes()
    if not data:
        return ""
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            text = data.decode(encoding)
            break
        except UnicodeDecodeError:
            text = ""
    printable = "".join(ch if ch.isprintable() or ch in "\n\t" else " " for ch in text)
    if Path(path).suffix.lower() == ".pdf":
        pdf_strings = re.findall(r"\(([^()]{3,})\)", printable)
        if pdf_strings:
            printable = " ".join(pdf_strings)
    return re.sub(r"\s+", " ", printable).strip()[:20000]


def extract_skills(text: str) -> list[str]:
    lower = f" {normalize(text)} "
    found = []
    for label, aliases in SKILLS:
        if any(f" {normalize(alias)} " in lower or normalize(alias) in lower for alias in aliases):
            found.append(label)
    return found


def analyze_job(payload: dict[str, Any], file_texts: list[str]) -> dict[str, Any]:
    resume_text = " ".join([payload.get("resume_text", ""), *file_texts])
    job_description = payload.get("job_description", "")
    required = extract_skills(job_description)
    resume_skills = extract_skills(resume_text)
    matched = [skill for skill in required if skill in resume_skills]
    missing = [skill for skill in required if skill not in resume_skills]
    text_quality = min(100, max(0, len(resume_text.strip()) // 12))
    match_ratio = len(matched) / len(required) if required else 0
    score = round(min(96, match_ratio * 82 + min(14, text_quality / 6)))
    selected = score >= 65 and len(matched) >= max(2, math.ceil(len(required) * 0.5))
    return {
        "decision": "selected" if selected else "rejected",
        "score": score,
        "matchedSkills": matched or ["No clear JD skill match found"],
        "missingSkills": missing or ["No major gaps detected"],
        "recommendations": [
            f"Matched {len(matched)} of {len(required)} required skills found in the job description.",
            "Add measurable achievements and project outcomes for stronger screening.",
            "Keep exact role keywords where they truthfully reflect your experience.",
        ] if selected else [
            f"Only {len(matched)} of {len(required)} required skills were found.",
            f"Add or strengthen these gaps: {', '.join(missing[:6]) or 'role-specific keywords'}.",
            "Paste readable resume text or upload a text-searchable document for a more reliable result.",
        ],
        "suggestedRoles": [] if selected else ["Junior Developer", "Associate Engineer", "Trainee Role"],
        "extractedTextLength": len(resume_text),
    }


def analyze_loan(payload: dict[str, Any], files: list[dict[str, Any]]) -> dict[str, Any]:
    amount = float(payload.get("loanAmount", 0) or 0)
    income = float(payload.get("monthlyIncome", 0) or 0)
    tenure = int(payload.get("tenure", 5) or 5)
    existing = float(payload.get("existingLoans", 0) or 0)
    required_docs = payload.get("requiredDocs", [])
    present_docs = {item.get("docType") for item in files}
    doc_score = len(present_docs.intersection(required_docs)) / len(required_docs) if required_docs else 1
    max_emi = max(0, income * 0.5 - existing)
    approx_emi = amount / max(1, tenure * 12)
    affordability = max(0, min(1, max_emi / max(1, approx_emi)))
    probability = round(max(3, min(98, affordability * 68 + doc_score * 22 + (10 if existing < income * 0.15 else 0))))
    risk = 100 - probability
    approved = probability >= 55 and doc_score >= 0.75
    return {
        "decision": "approved" if approved else "denied",
        "approvedAmount": round(amount if approved else min(amount, max_emi * tenure * 12)),
        "interestRate": 8.5 if probability >= 80 else 9.25 if probability >= 60 else 10.5,
        "tenure": tenure,
        "reason": "Income, current EMI burden, and uploaded documents support approval." if approved else "Affordability or document completeness is below the approval threshold.",
        "recommendations": [
            "Keep total EMI below 50% of monthly income.",
            "Upload clear salary/bank/tax documents to improve confidence.",
            "Reduce active obligations before applying for a higher amount.",
        ],
        "riskScore": risk,
        "approvalProbability": probability,
        "documentChecks": [{"docType": doc, "present": doc in present_docs} for doc in required_docs],
    }


def analyze_education(payload: dict[str, Any], file_texts: list[str]) -> dict[str, Any]:
    answer = " ".join([payload.get("answer_text", ""), *file_texts]).strip()
    words = re.findall(r"[a-zA-Z]{3,}", answer.lower())
    unique_ratio = len(set(words)) / max(1, len(words))
    paragraph_count = max(1, answer.count("\n\n") + 1)
    examples = sum(1 for term in ["example", "because", "therefore", "evidence", "case"] if term in answer.lower())
    content = round(min(10, len(words) / 35 + examples * 1.2))
    structure = round(min(10, paragraph_count * 1.8 + (2 if len(words) > 120 else 0)))
    grammar = round(max(3, min(10, 10 - answer.lower().count(" bad ") - answer.lower().count(" good ") + unique_ratio)))
    score = round((content * 0.45 + structure * 0.25 + grammar * 0.30) * 10)
    return {
        "score": score,
        "content": content,
        "structure": structure,
        "grammar": grammar,
        "explanation": f"The answer scored {score}% based on content coverage, paragraph structure, examples, and language quality.",
        "feedback": [
            {"text": "Add more direct evidence/examples from the topic.", "priority": "high" if content < 7 else "low"},
            {"text": "Use clearer paragraph transitions and conclusion.", "priority": "medium" if structure < 7 else "low"},
            {"text": "Replace vague words with specific academic terms.", "priority": "medium" if grammar < 8 else "low"},
        ],
        "extractedTextLength": len(answer),
        "extractedPreview": answer[:1200],
    }


def analyze_plagiarism(payload: dict[str, Any]) -> dict[str, Any]:
    text = normalize(payload.get("text", ""))
    phrases = ["according to wikipedia", "mitochondria is the powerhouse", "copy pasted", "source:"]
    phrase_hits = sum(1 for phrase in phrases if phrase in text)
    tokens = re.findall(r"[a-z]{4,}", text)
    repeated = sum(count - 1 for count in Counter(tokens).values() if count > 2)
    similarity = min(96, phrase_hits * 22 + repeated * 3 + (12 if len(tokens) > 80 else 0))
    return {"similarity": similarity, "risk": "high" if similarity >= 45 else "medium" if similarity >= 25 else "low"}


def analyze_document(payload: dict[str, Any], files: list[dict[str, Any]]) -> dict[str, Any]:
    results = []
    for item in files:
        doc_type = item.get("docType") or payload.get("doc_type") or "Document"
        text = normalize(item.get("text", ""))
        keywords = DOC_KEYWORDS.get(doc_type, [])
        keyword_hits = sum(1 for keyword in keywords if keyword in text)
        ext = Path(item.get("name", "")).suffix.lower()
        suspicious = any(term in text for term in ["edited", "photoshop", "sample", "dummy", "fake"])
        confidence = min(98, 45 + keyword_hits * 12 + (10 if ext in {".pdf", ".jpg", ".jpeg", ".png", ".txt"} else 0) - (30 if suspicious else 0))
        results.append({
            "docType": doc_type,
            "fileName": item.get("name"),
            "status": "verified" if confidence >= 70 and not suspicious else "review_required",
            "confidence": max(5, confidence),
            "issues": (["Suspicious wording found in extracted text."] if suspicious else []) + ([] if keyword_hits else ["Document type keywords were not confidently detected."]),
            "checks": {
                "fileFormat": ext.lstrip(".").upper() or "UNKNOWN",
                "keywordHits": keyword_hits,
                "textExtracted": len(text) > 30,
            },
        })
    overall = round(sum(item["confidence"] for item in results) / len(results)) if results else 0
    return {"overallConfidence": overall, "documents": results}


def run_service_analysis(service_type: str, payload: dict[str, Any], files: list[dict[str, Any]]) -> dict[str, Any]:
    file_texts = [item.get("text", "") for item in files]
    if service_type == "job":
        return analyze_job(payload, file_texts)
    if service_type == "loan":
        return analyze_loan(payload, files)
    if service_type == "education":
        return analyze_education(payload, file_texts)
    if service_type == "plagiarism":
        return analyze_plagiarism(payload)
    if service_type == "document":
        return analyze_document(payload, files)
    raise ValueError(f"Unsupported service type: {service_type}")

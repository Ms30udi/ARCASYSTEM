# ARCA - Agile Regulatory Compliance Agent (Backend)

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**ARCA** is an AI-powered regulatory compliance analysis system that uses a multi-agent architecture to automatically detect conflicts between new regulations and internal company policies.

## 🎯 Project Overview

ARCA leverages three specialized AI agents working in sequence:
1. **Policy Researcher Agent** - Retrieves relevant policies using RAG (Retrieval-Augmented Generation)
2. **Compliance Auditor Agent** - Analyzes conflicts using Google Gemini AI
3. **Report Generator Agent** - Creates structured JSON compliance reports

---

## 🏗️ System Architecture

┌─────────────────────────────────────────────────────────────┐
│ FastAPI REST API │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Agent 1: Policy Researcher (RAG) │
│ - FAISS Vector Database │
│ - Sentence-Transformers (all-MiniLM-L6-v2) │
│ - PDF Text Extraction (PyPDF) │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Agent 2: Compliance Auditor (LLM Analysis) │
│ - Google Gemini 1.5 Flash API │
│ - Conflict Detection & Severity Rating │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Agent 3: Report Generator (Structured Output) │
│ - JSON Report Generation │
│ - File Export with Timestamps │
└─────────────────────────────────────────────────────────────┘


---

## 📦 Technology Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Programming Language |
| **FastAPI** | 0.115.0 | REST API Framework |
| **Uvicorn** | 0.30.0 | ASGI Server |
| **Google Generative AI** | 0.8.0+ | LLM (Gemini 1.5 Flash) |

### AI/ML Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **FAISS** | 1.7.4 | Vector Database |
| **Sentence-Transformers** | 2.2.2 | Text Embeddings |
| **PyPDF** | 3.1.0 | PDF Text Extraction |
| **LangChain** | 0.1.0 | Text Splitting & Processing |

### Utilities
| Library | Version | Purpose |
|---------|---------|---------|
| **python-dotenv** | 1.0.0 | Environment Variables |
| **pydantic** | 2.0.0 | Data Validation |

---

## 🚀 Installation

### 1. Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Google AI Studio API Key ([Get one here](https://makersuite.google.com/app/apikey))

### 2. Clone the Repository

cd Desktop
git clone <your-repo-url>
cd MultiAgentLV


### 3. Create Virtual Environment (Recommended)




### 4. Install Dependencies

pip install fastapi==0.115.0
pip install uvicorn==0.30.0
pip install google-generativeai>=0.8.0
pip install faiss-cpu==1.7.4
pip install sentence-transformers==2.2.2
pip install pypdf==3.1.0
pip install langchain==0.1.0
pip install python-dotenv==1.0.0
pip install python-multipart

**Or use requirements.txt:**

pip install -r requirements.txt

### 5. Configure Environment Variables

Create a `.env` file in the project root:

GOOGLE_API_KEY=your_google_ai_studio_api_key_here



## 📊 Database Setup (FAISS Vector Database)

### Directory Structure

MultiAgentLV/
├── policies/ # PDF policy documents
│ ├── 01_MA_Data_Retention_Policy.pdf
│ ├── 11_MA_Privacy_Consent_...pdf
│ └── ...
├── faiss_index/ # Vector database (auto-generated)
│ ├── index.faiss
│ ├── metadata.pkl
│ └── chunks.pkl
└── rag_setup.py # Database initialization script

### Initialize Vector Database

python rag_setup.py

### Database Configuration

- **Chunk Size:** 400 tokens
- **Chunk Overlap:** 50 tokens
- **Embedding Model:** `all-MiniLM-L6-v2` (384 dimensions)
- **Similarity Search:** Cosine similarity (top-k=5)

---

## 🔌 API Endpoints

### Base URL
http://localhost:8000

### 1. Health Check

GET /



**Response:**
{
"status": "online",
"service": "ARCA - Agile Regulatory Compliance Agent",
"version": "1.0.0"
}



---

### 2. Analyze Regulation (Text Input)

POST /analyze_regulation
Content-Type: application/json



**Request Body:**
{
"new_regulation_text": "Article 7: Data Retention Requirements...",
"date_of_law": "2025-12-06"
}



**Response:**
{
"regulation_id": "9938a50e4545c7bd",
"date_of_law": "2025-12-06",
"date_processed": "2025-12-06",
"time_processed": "14:31:29",
"total_risks_flagged": 5,
"risk_breakdown": {
"HIGH": 5,
"MEDIUM": 0,
"LOW": 0
},
"risks": [
{
"policy_id": "POL-001",
"severity": "HIGH",
"divergence_summary": "The internal policy conflicts with...",
"conflicting_policy_excerpt": "Retain personal data only as long as needed...",
"new_rule_excerpt": "Personal data must be permanently deleted after 12 months...",
"recommendation": "Immediately revise the internal policy..."
}
],
"recommendation": "URGENT: 5 high-priority conflicts require immediate legal review."
}



**Validation:**
- `new_regulation_text`: 50-10,000 characters
- `date_of_law`: Optional, format `YYYY-MM-DD`

---

### 3. Analyze Regulation (PDF Upload)

POST /analyze_regulation_pdf
Content-Type: multipart/form-data



**Form Data:**
- `file`: PDF file (max 10 MB)
- `date_of_law`: Optional (YYYY-MM-DD)

**Response:** Same as text input endpoint

**Validation:**
- File format: `.pdf` only
- Max file size: 10 MB
- Extracted text: 50-10,000 characters

---

### 4. List Reports

GET /reports



**Response:**
{
"total_reports": 3,
"reports": [
"compliance_report_20251206_143129_9938a50e4545c7bd.json",
"compliance_report_20251206_142530_abc123def456.json"
]
}



---

## 🎮 Usage Examples

### Python Client

import requests
import json

Text Input
url = "http://localhost:8000/analyze_regulation"
data = {
"new_regulation_text": """
Article 7: Data Retention Requirements
All companies must delete personal data after 12 months of inactivity.
""",
"date_of_law": "2025-12-06"
}

response = requests.post(url, json=data)
result = response.json()
print(json.dumps(result, indent=2))



### cURL

Text Input
curl -X POST "http://localhost:8000/analyze_regulation"
-H "Content-Type: application/json"
-d '{
"new_regulation_text": "Article 7: Data Retention Requirements...",
"date_of_law": "2025-12-06"
}'

PDF Upload
curl -X POST "http://localhost:8000/analyze_regulation_pdf"
-F "file=@regulation.pdf"
-F "date_of_law=2025-12-06"



---

## 🏃 Running the Server

### Development Mode

python api_main.py



**Output:**
🚀 Starting ARCA API Server...
📡 API will be available at: http://localhost:8000
📚 Documentation at: http://localhost:8000/docs

INFO: Started server process
INFO: Uvicorn running on http://0.0.0.0:8000



### Production Mode

uvicorn api_main:app --host 0.0.0.0 --port 8000 --workers 4



### Access Interactive API Docs

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📁 Project Structure

MultiAgentLV/
├── .env # Environment variables
├── .gitignore
├── requirements.txt
├── README.md
│
├── policies/ # Input: PDF policy documents
│ ├── 01_MA_Data_Retention_Policy.pdf
│ ├── 11_MA_Privacy_Consent_...pdf
│ └── ...
│
├── faiss_index/ # Vector database (generated)
│ ├── index.faiss
│ ├── metadata.pkl
│ └── chunks.pkl
│
├── rag_setup.py # Initialize FAISS database
│
├── agent_policy_researcher.py # Agent 1: RAG-based policy search
├── agent_compliance_auditor.py # Agent 2: LLM conflict analysis
├── agent_report_generator.py # Agent 3: JSON report generation
│
└── api_main.py # FastAPI REST API

---

## ⚙️ Configuration

### Agent 1: Policy Researcher

**File:** `agent_policy_researcher.py`

Configuration
CHUNK_SIZE = 400 # Tokens per chunk
CHUNK_OVERLAP = 50 # Overlap between chunks
TOP_K = 5 # Number of similar chunks to retrieve
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"



### Agent 2: Compliance Auditor

**File:** `agent_compliance_auditor.py`

Configuration
OUTPUT_FOLDER = "../output" # Report save location
HASH_ALGORITHM = "md5" # Regulation ID generation



---

## 🐛 Troubleshooting

### Issue: FAISS Index Not Found

**Error:**
FileNotFoundError: faiss_index/ not found



**Solution:**
python rag_setup.py



---

### Issue: Google API Key Error

**Error:**
ValueError: Please provide GOOGLE_API_KEY in .env file!



**Solution:**
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env` file:
GOOGLE_API_KEY=your_key_here



---

### Issue: Gemini Model Not Found

**Error:**
404 models/gemini-pro is not found



**Solution:**
pip install --upgrade google-generativeai



---

### Issue: JSON Parsing Error

**Error:**
JSON parsing error: Expecting value: line 1 column 1



**Solution:** This is handled automatically by the system with fallback responses. If persistent, check Gemini API status.

---

### Issue: CORS Error (Frontend)

**Error:**
Access to fetch at 'http://localhost:8000' has been blocked by CORS



**Solution:** Already configured in `api_main.py`:
app.add_middleware(
CORSMiddleware,
allow_origins=["http://localhost:5173"],
allow_credentials=True,
allow_methods=[""],
allow_headers=[""],
)


---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| **Average Analysis Time** | 15-30 seconds |
| **FAISS Search Time** | < 100ms |
| **Gemini API Response** | 5-15 seconds |
| **Concurrent Requests** | Up to 10 (configurable) |
| **Max Regulation Size** | 2000 characters |
| **Max PDF Size** | 10 MB |

---

## 🔐 Security Considerations

1. **API Key Protection**
   - Never commit `.env` file to Git
   - Use environment variables in production
   - Rotate API keys regularly

2. **Input Validation**
   - All inputs validated via Pydantic models
   - File size limits enforced (10 MB)
   - Text length limits enforced (2,000 chars)

3. **CORS Configuration**
   - Restrict `allow_origins` in production
   - Use HTTPS in production

---

## 🚧 Known Limitations

1. **Language Support:** Currently English only
2. **Policy Database:** Limited to uploaded PDFs
3. **Top-K Retrieval:** Only top 5 policies analyzed (configurable)
4. **LLM Hallucination:** Gemini may occasionally generate inaccurate assessments
5. **No Authentication:** API is open (add auth for production)

---

## 🔮 Future Improvements

- [ ] Add multi-language support
- [ ] Implement user authentication (JWT)
- [ ] Add database persistence (PostgreSQL)
- [ ] Implement caching (Redis)
- [ ] Add batch processing for multiple regulations
- [ ] Improve retrieval with hybrid search (BM25 + vector)
- [ ] Add model fine-tuning capabilities
- [ ] Implement real-time progress tracking
- [ ] Add email notifications for completed analyses
- [ ] Create admin dashboard for policy management

---



---

## 🙏 Acknowledgments

- **Google AI Studio** - Gemini API
- **Facebook Research** - FAISS Vector Database
- **Sentence-Transformers** - Embedding Models
- **FastAPI** - Web Framework

---

**Built with ❤️ by Maroc Agency**

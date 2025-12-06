from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, Field
from typing import Optional
from agent_policy_researcher import PolicyResearcherAgent
from fastapi.middleware.cors import CORSMiddleware
from agent_compliance_auditor import ComplianceAuditorAgent
from agent_report_generator import ReportGeneratorAgent
import uvicorn
from pypdf import PdfReader
import io

# Initialize FastAPI app
app = FastAPI(
    title="ARCA - Agile Regulatory Compliance Agent",
    description="AI-powered compliance analysis system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Request model for text input
class RegulationRequest(BaseModel):
    new_regulation_text: str = Field(..., max_length=2000, description="The text of the new regulation (max 2000 words)")
    date_of_law: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$', description="Date in YYYY-MM-DD format")

# Initialize agents (load once at startup)
agent1 = PolicyResearcherAgent()
agent2 = ComplianceAuditorAgent()
agent3 = ReportGeneratorAgent()

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from uploaded PDF file"""
    try:
        pdf_reader = PdfReader(io.BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "ARCA - Agile Regulatory Compliance Agent",
        "version": "1.0.0",
        "endpoints": {
            "analyze_text": "/analyze_regulation (POST - JSON)",
            "analyze_pdf": "/analyze_regulation_pdf (POST - File Upload)",
            "list_reports": "/reports (GET)"
        }
    }

@app.post("/analyze_regulation")
def analyze_regulation(request: RegulationRequest):
    """
    Analyze a new regulation against internal policies (TEXT INPUT)
    
    **Request Body:**
    - new_regulation_text: The full text of the regulation
    - date_of_law: Optional date when the regulation takes effect (YYYY-MM-DD)
    
    **Returns:**
    - JSON report with identified conflicts and recommendations
    """
    try:
        # Validate input
        if not request.new_regulation_text or len(request.new_regulation_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Regulation text must be at least 50 characters")
        
        print(f"\n{'='*60}")
        print("🚀 NEW API REQUEST (TEXT) - ARCA Analysis Starting")
        print(f"{'='*60}")
        
        # Step 1: Find relevant policies
        policy_results = agent1.analyze(request.new_regulation_text)
        
        if not policy_results:
            raise HTTPException(status_code=404, detail="No relevant policies found in database")
        
        # Step 2: Analyze conflicts
        audit_results = agent2.analyze(policy_results, request.new_regulation_text)
        
        if not audit_results:
            raise HTTPException(status_code=500, detail="Analysis failed - no results from compliance auditor")
        
        # Step 3: Generate report
        final_report = agent3.generate_report(
            audit_results=audit_results,
            new_regulation_text=request.new_regulation_text,
            date_of_law=request.date_of_law
        )
        
        print(f"\n✅ API Request Completed Successfully")
        print(f"{'='*60}\n")
        
        return final_report
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/analyze_regulation_pdf")
async def analyze_regulation_pdf(
    file: UploadFile = File(..., description="PDF file containing the regulation"),
    date_of_law: Optional[str] = Form(None, pattern=r'^\d{4}-\d{2}-\d{2}$')
):
    """
    Analyze a new regulation against internal policies (PDF UPLOAD)
    
    **Upload:**
    - file: PDF file containing the regulation text
    - date_of_law: Optional date when the regulation takes effect (YYYY-MM-DD)
    
    **Returns:**
    - JSON report with identified conflicts and recommendations
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        
        # Check file size (max 5MB)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
        print(f"\n{'='*60}")
        print("🚀 NEW API REQUEST (PDF) - ARCA Analysis Starting")
        print(f"   Uploaded file: {file.filename}")
        print(f"{'='*60}")
        
        # Extract text from PDF
        print("📄 Extracting text from PDF...")
        regulation_text = extract_text_from_pdf(contents)
        
        if not regulation_text or len(regulation_text.strip()) < 20:
            raise HTTPException(status_code=400, detail="Extracted text is too short or empty. Please check PDF content.")
        
        print(f"✅ Extracted {len(regulation_text)} characters from PDF")
        print(f"   Preview: {regulation_text[:100]}...")
        
        # Step 1: Find relevant policies
        policy_results = agent1.analyze(regulation_text)
        
        if not policy_results:
            raise HTTPException(status_code=404, detail="No relevant policies found in database")
        
        # Step 2: Analyze conflicts
        audit_results = agent2.analyze(policy_results, regulation_text)
        
        if not audit_results:
            raise HTTPException(status_code=500, detail="Analysis failed - no results from compliance auditor")
        
        # Step 3: Generate report
        final_report = agent3.generate_report(
            audit_results=audit_results,
            new_regulation_text=regulation_text,
            date_of_law=date_of_law
        )
        
        # Add metadata about uploaded file
        final_report["uploaded_file"] = file.filename
        final_report["file_size_bytes"] = len(contents)
        
        print(f"\n✅ API Request Completed Successfully")
        print(f"{'='*60}\n")
        
        return final_report
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/reports")
def list_reports():
    """List all generated compliance reports"""
    try:
        reports = agent3.list_all_reports()
        return {
            "total_reports": len(reports),
            "reports": reports
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing reports: {str(e)}")

# Run the server
if __name__ == "__main__":
    print("🚀 Starting ARCA API Server...")
    print("📡 API will be available at: http://localhost:8000")
    print("📚 Documentation at: http://localhost:8000/docs")
    print("\n📋 Available Endpoints:")
    print("   • POST /analyze_regulation - Text input")
    print("   • POST /analyze_regulation_pdf - PDF upload")
    print("   • GET /reports - List all reports")
    uvicorn.run(app, host="0.0.0.0", port=8000)

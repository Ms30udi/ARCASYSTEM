from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import os


class PolicyResearcherAgent:
    """Agent 1: Policy Researcher - Searches for relevant policy excerpts"""
    
    def __init__(self, faiss_index_path="faiss_index"):
        # Load FAISS index (no API key needed!)
        print("📥 Loading FAISS index...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vector_store = FAISS.load_local(
            faiss_index_path, 
            embeddings, 
            allow_dangerous_deserialization=True
        )
        print("✅ FAISS index loaded successfully")
    
    def vector_db_search(self, query, top_k=5):
        """
        Retrieve top K most relevant policy excerpts using semantic search
        
        Args:
            query: The new regulation text to search against
            top_k: Number of results to return (default: 5)
        
        Returns:
            List of dictionaries with policy excerpts and metadata
        """
        results = self.vector_store.similarity_search_with_score(query, k=top_k)
        
        formatted_results = []
        for i, (doc, score) in enumerate(results):
            formatted_results.append({
                "policy_id": f"POL-{str(i+1).zfill(3)}",  # POL-001, POL-002, etc.
                "excerpt": doc.page_content,
                "source": doc.metadata.get('source', 'unknown').replace('\\', '/'),
                "page": doc.metadata.get('page', 'N/A'),
                "similarity_score": round(float(score), 4)
            })
        
        return formatted_results
    
    def analyze(self, new_regulation_text):
        """
        Main method: Search for relevant policies
        
        Args:
            new_regulation_text: The text of the new regulation
        
        Returns:
            List of top 5 relevant policy excerpts
        """
        print("\n" + "="*60)
        print("🔍 POLICY RESEARCHER AGENT - Starting Analysis")
        print("="*60)
        
        print(f"\n📋 New Regulation Preview:")
        print(f"{new_regulation_text[:200]}...\n")
        
        print("🔎 Searching FAISS database for relevant policies...")
        results = self.vector_db_search(new_regulation_text, top_k=5)
        
        print(f"\n✅ Found {len(results)} relevant policy excerpts:\n")
        for r in results:
            print(f"  🔹 {r['policy_id']}")
            print(f"     Source: {r['source']} (Page {r['page']})")
            print(f"     Similarity: {r['similarity_score']}")
            print(f"     Preview: {r['excerpt'][:100]}...")
            print()
        
        return results


# Test the agent
if __name__ == "__main__":
    # Initialize agent (no API key needed!)
    try:
        agent = PolicyResearcherAgent()
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)
    
    # Test with sample regulation
    test_regulation = """
    MOROCCO DIGITAL SERVICES REGULATORY FRAMEWORK
        Law No. 09-2025 on Digital Service Providers and Data Protection
        Effective Date: January 15, 2026
        Ministry of Digital Transition and Administrative Reform
        
        Article 1: Scope and Application
        This regulation applies to all digital service providers, web agencies, software development companies, and technology consultancies operating within Morocco or serving Moroccan clients. Organizations must comply within 90 days of the effective date.
        
        Article 2: Change Management Requirements
        2.1 Mandatory Change Approval Timelines
        All infrastructure changes must receive written approval at least 72 hours before implementation. Emergency changes are permitted only for system outages affecting more than 50% of users or active security breaches.
        
        2.2 Independent Review Board
        Organizations with more than 10 employees must establish an Independent Technical Review Board consisting of at least three members who are not directly involved in day-to-day operations. This board must review and approve all high-risk changes before implementation.
        
        2.3 Client Notification Standards
        Clients must be notified at least 96 hours in advance of any planned maintenance or changes that may affect service availability, regardless of expected downtime duration.
        
        2.4 Change Documentation Retention
        All change logs, including rollback procedures and risk assessments, must be retained for a minimum of 7 years and made available to regulatory authorities within 48 hours of request.
        
        Article 3: Data Protection and Privacy Compliance
        3.1 Data Residency Requirements
        All personal data of Moroccan citizens must be stored on servers physically located within Morocco. International data transfers require explicit approval from the National Commission for the Protection of Personal Data (CNDP) and cannot rely solely on user consent.
        
        3.2 Enhanced Consent Standards
        Consent for data collection must be:
        
        Obtained through a separate action (pre-checked boxes are prohibited)
        
        Granular (allowing users to consent to specific processing activities separately)
        
        Revocable at any time with immediate effect
        
        Re-confirmed every 12 months for ongoing processing activities
        
        Blanket consent for multiple purposes is not permitted.
        
        3.3 Mandatory Data Protection Officer
        All organizations processing personal data of more than 1,000 individuals annually must appoint a certified Data Protection Officer who:
        
        Holds recognized certification in data protection (CIPP/E or equivalent)
        
        Reports directly to executive management
        
        Is independent from IT and operations teams
        
        Dedicates at least 20 hours per week to data protection duties
        
        3.4 Data Processing Records
        Organizations must maintain detailed processing records including:
        
        Purpose and legal basis for each processing activity
        
        Data flow diagrams showing all systems and third parties
        
        Automated decision-making logic and algorithms
        
        Privacy impact assessments updated quarterly
        
        3.5 Data Retention Maximums
        Personal data may not be retained longer than 24 months after the last business interaction unless:
        
        Legally required for tax/accounting purposes
        
        Subject to ongoing legal proceedings
        
        Explicitly re-consented by the data subject
        
        Anonymization does not satisfy deletion requirements; true pseudonymization or complete erasure is required.
        
        Article 4: Third-Party Data Processing
        4.1 Processor Qualification
        Third-party data processors must:
        
        Be registered with CNDP as qualified data processors
        
        Undergo annual independent security audits with results shared with data controllers
        
        Maintain ISO 27001 certification
        
        Provide proof of cyber insurance covering at least 5 million MAD
        
        4.2 Data Processing Agreements
        Data Processing Agreements must include:
        
        Specific data retention and deletion timelines (not "as long as needed")
        
        Processor liability clauses for unauthorized access or breaches
        
        Mandatory breach notification within 6 hours of detection
        
        Right to audit processor facilities with 24-hour notice
        
        4.3 Sub-processor Restrictions
        Use of sub-processors requires:
        
        Prior written authorization from the data controller
        
        Individual risk assessment for each sub-processor
        
        Direct contractual relationship between controller and sub-processor
        
        Quarterly reporting on sub-processor compliance
        
        Article 5: Data Subject Rights Management
        5.1 Response Timeframes
        Data subject requests must be fulfilled within:
        
        15 calendar days for access requests
        
        10 calendar days for rectification requests
        
        7 calendar days for deletion requests
        
        3 calendar days for objection to processing requests
        
        Extensions beyond these periods require formal justification submitted to CNDP.
        
        5.2 Identity Verification
        Organizations must verify requestor identity using two independent verification methods before fulfilling data subject requests. Acceptable methods include government-issued ID plus biometric verification or notarized documentation.
        
        5.3 Automated Request Handling
        If using automated systems to handle data subject requests, organizations must:
        
        Provide human review option for all automated decisions
        
        Maintain audit trail of automated processing logic
        
        Test automation quarterly for accuracy and completeness
        
        Article 6: Security and Encryption Standards
        6.1 Minimum Encryption Requirements
        All personal data must be encrypted using:
        
        AES-256 or equivalent for data at rest
        
        TLS 1.3 or higher for data in transit
        
        End-to-end encryption for sensitive data categories (health, financial, biometric)
        
        Key management must follow NIST standards with key rotation every 60 days.
        
        6.2 Access Control Requirements
        Access to personal data must implement:
        
        Multi-factor authentication for all administrative access
        
        Role-based access control with principle of least privilege
        
        Automated access reviews every 30 days
        
        Immediate revocation upon employee termination (within 2 hours)
        
        6.3 Logging and Monitoring
        Security logs must capture:
        
        All access to personal data with user identification
        
        All modifications or deletions with before/after states
        
        All export or download activities
        
        All failed authentication attempts
        
        Logs must be retained separately from production data for 10 years and protected from tampering.
    """
    
    # Run analysis
    results = agent.analyze(test_regulation)
    
    # Display full results
    print("\n" + "="*60)
    print("📊 COMPLETE RESULTS")
    print("="*60)
    
    for i, result in enumerate(results, 1):
        print(f"\n[Result {i}]")
        print(f"Policy ID: {result['policy_id']}")
        print(f"Source: {result['source']}")
        print(f"Page: {result['page']}")
        print(f"Similarity Score: {result['similarity_score']}")
        print(f"\nFull Excerpt:")
        print("-" * 60)
        print(result['excerpt'])
        print("-" * 60)

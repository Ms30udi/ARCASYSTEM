import json
import hashlib
from datetime import datetime
import os


class ReportGeneratorAgent:
    """
    Agent 3: Report Generator
    Transforms audit analysis into structured JSON output
    """
    
    def __init__(self, output_folder="../output"):
        self.output_folder = output_folder
        # Create output folder if it doesn't exist
        os.makedirs(self.output_folder, exist_ok=True)
        print("✅ Report Generator Agent initialized")
        print(f"📁 Output folder: {os.path.abspath(self.output_folder)}")
    
    def generate_regulation_id(self, regulation_text, date_of_law=None):
        """Generate unique ID from regulation text and date"""
        text_to_hash = f"{regulation_text}{date_of_law or ''}"
        return hashlib.md5(text_to_hash.encode()).hexdigest()[:16]
    
    def list_all_reports(self):
        """List all existing reports in output folder"""
        if not os.path.exists(self.output_folder):
            return []
        
        reports = [f for f in os.listdir(self.output_folder) if f.endswith('.json')]
        reports.sort(reverse=True)  # Most recent first
        return reports
    
    def generate_report(self, audit_results, new_regulation_text, date_of_law=None):
        """
        Main method: Generate final JSON report
        
        Args:
            audit_results: List of analysis dicts from Compliance Auditor
            new_regulation_text: The regulation text
            date_of_law: Optional date string (YYYY-MM-DD)
        
        Returns:
            Complete JSON report as dict
        """
        print("\n" + "="*60)
        print("📄 REPORT GENERATOR AGENT - Creating Final Report")
        print("="*60)
        
        # Generate regulation ID
        regulation_id = self.generate_regulation_id(new_regulation_text, date_of_law)
        
        # Count risks by severity
        high_count = sum(1 for r in audit_results if r['severity'] == 'HIGH')
        medium_count = sum(1 for r in audit_results if r['severity'] == 'MEDIUM')
        low_count = sum(1 for r in audit_results if r['severity'] == 'LOW')
        
        # Build risks array
        risks = []
        for result in audit_results:
            risk = {
                "policy_id": result['policy_id'],
                "severity": result['severity'],
                "divergence_summary": result['divergence_summary'],
                "conflicting_policy_excerpt": result['conflicting_policy_excerpt'],
                "new_rule_excerpt": result['new_rule_excerpt'],
                "recommendation": result['recommendation']
            }
            risks.append(risk)
        
        # Generate overall recommendation
        if high_count > 0:
            overall_recommendation = f"URGENT: {high_count} high-priority conflicts require immediate legal review and policy updates."
        elif medium_count > 0:
            overall_recommendation = f"ACTION REQUIRED: {medium_count} medium-priority conflicts need review within 30 days."
        else:
            overall_recommendation = "No critical conflicts detected. Minor discrepancies should be reviewed during next policy update cycle."
        
        # Build final report
        report = {
            "regulation_id": regulation_id,
            "date_of_law": date_of_law or "Not specified",
            "date_processed": datetime.now().strftime("%Y-%m-%d"),
            "time_processed": datetime.now().strftime("%H:%M:%S"),
            "total_risks_flagged": len(audit_results),
            "risk_breakdown": {
                "HIGH": high_count,
                "MEDIUM": medium_count,
                "LOW": low_count
            },
            "risks": risks,
            "recommendation": overall_recommendation
        }
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"compliance_report_{timestamp}_{regulation_id}.json"
        filepath = os.path.join(self.output_folder, filename)
        
        # Save report
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Report generated successfully")
        print(f"   Regulation ID: {regulation_id}")
        print(f"   Total Risks: {len(audit_results)}")
        print(f"   Breakdown: HIGH={high_count}, MEDIUM={medium_count}, LOW={low_count}")
        print(f"   Saved to: {filepath}")
        
        # List all reports
        all_reports = self.list_all_reports()
        print(f"\n📋 Total reports in output folder: {len(all_reports)}")
        if all_reports:
            print("   Recent reports:")
            for i, report_file in enumerate(all_reports[:5], 1):
                print(f"   {i}. {report_file}")
        
        return report


# Test the full pipeline: Agent 1 → Agent 2 → Agent 3
if __name__ == "__main__":
    from agent_policy_researcher import PolicyResearcherAgent
    from agent_compliance_auditor import ComplianceAuditorAgent
    
    print("🚀 Initializing Complete ARCA System...")
    agent1 = PolicyResearcherAgent()
    agent2 = ComplianceAuditorAgent()
    agent3 = ReportGeneratorAgent()
    
    # Test regulation
    test_regulation = """
    Article 7: Data Retention Requirements
    
    All companies processing personal data must implement the following:
    1. Personal data must be permanently deleted after 12 months of user inactivity
    2. Companies must obtain explicit written consent before processing any personal information
    3. All data retention policies must be reviewed and updated annually
    4. Backup copies of deleted data must also be removed within 30 days
    """
    
    # STEP 1: Find relevant policies
    policy_results = agent1.analyze(test_regulation)
    
    # STEP 2: Analyze conflicts
    audit_results = agent2.analyze(policy_results, test_regulation)
    
    # STEP 3: Generate final report
    final_report = agent3.generate_report(
        audit_results=audit_results,
        new_regulation_text=test_regulation,
        date_of_law="2025-12-06"
    )
    
    # Display final JSON
    print("\n" + "="*60)
    print("📊 FINAL JSON REPORT")
    print("="*60)
    print(json.dumps(final_report, indent=2))

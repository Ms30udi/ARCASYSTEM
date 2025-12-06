import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ComplianceAuditorAgent:
    """
    Agent 2: Compliance Auditor
    Analyzes each policy excerpt and determines conflict severity
    """
    
    def __init__(self, gemini_api_key=None):
        # Configure Gemini API
        api_key = gemini_api_key or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError("Please provide GOOGLE_API_KEY in .env file!")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        print("✅ Compliance Auditor Agent initialized")
    
    def analyze_single_policy(self, policy_excerpt, new_regulation_text, policy_id):
        """
        Analyze one policy excerpt against the new regulation
        
        Returns:
            dict with severity, summary, excerpts, and recommendation
        """
        
        prompt = f"""You are a legal compliance expert. Analyze if there is a conflict between the company's internal policy and the new regulation.

**Internal Policy Excerpt:**
{policy_excerpt}

**New Regulation:**
{new_regulation_text}

**Your Task:**
Compare these two texts carefully and determine:

1. **Severity Level**: Is there a conflict? Rate it as:
   - HIGH: Direct contradiction, immediate action required
   - MEDIUM: Potential conflict, needs review
   - LOW: Minor discrepancy or no conflict

2. **Divergence Summary**: In 1-2 sentences, explain the nature of the conflict (if any)

3. **Conflicting Policy Excerpt**: Quote the EXACT part of the internal policy that conflicts

4. **New Rule Excerpt**: Quote the EXACT part of the new regulation that conflicts

5. **Recommendation**: Provide a clear action item for the legal team

Respond ONLY with a valid JSON object in this exact format:
{{
    "severity": "HIGH|MEDIUM|LOW",
    "divergence_summary": "brief explanation",
    "conflicting_policy_excerpt": "exact quote from policy",
    "new_rule_excerpt": "exact quote from regulation",
    "recommendation": "specific action to take"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean markdown code blocks
            response_text = response_text.replace("```json", "")
            response_text = response_text.replace("```", "")
            response_text = response_text.strip()
            
            # Parse JSON
            analysis = json.loads(response_text)
            analysis['policy_id'] = policy_id
            
            return analysis
            
        except json.JSONDecodeError as e:
            print(f"⚠️  JSON parsing error for {policy_id}: {e}")
            print(f"Raw response: {response.text[:200]}...")
            
            return {
                "policy_id": policy_id,
                "severity": "MEDIUM",
                "divergence_summary": "Analysis failed - manual review required",
                "conflicting_policy_excerpt": policy_excerpt[:200],
                "new_rule_excerpt": new_regulation_text[:200],
                "recommendation": "Manual legal review required due to analysis error"
            }
        
        except Exception as e:
            print(f"❌ Error analyzing {policy_id}: {e}")
            return None

    def analyze(self, policy_results, new_regulation_text):
        """
        Main method: Analyze all policy excerpts from Agent 1
        
        Args:
            policy_results: List of dicts from Policy Researcher Agent
            new_regulation_text: The new regulation text
        
        Returns:
            List of analysis results with risk assessments
        """
        print("\n" + "="*60)
        print("⚖️  COMPLIANCE AUDITOR AGENT - Starting Analysis")
        print("="*60)
        
        print(f"\n📋 Analyzing {len(policy_results)} policy excerpts...")
        
        analyses = []
        
        for i, policy in enumerate(policy_results, 1):
            print(f"\n[{i}/{len(policy_results)}] Analyzing {policy['policy_id']}...")
            
            analysis = self.analyze_single_policy(
                policy_excerpt=policy['excerpt'],
                new_regulation_text=new_regulation_text,
                policy_id=policy['policy_id']
            )
            
            if analysis:
                # Add source metadata
                analysis['source'] = policy['source']
                analysis['page'] = policy['page']
                analyses.append(analysis)
                
                print(f"    ✅ Severity: {analysis['severity']}")
                print(f"    📝 {analysis['divergence_summary'][:80]}...")
        
        print(f"\n✅ Completed analysis of all policies")
        print(f"   HIGH risks: {sum(1 for a in analyses if a['severity'] == 'HIGH')}")
        print(f"   MEDIUM risks: {sum(1 for a in analyses if a['severity'] == 'MEDIUM')}")
        print(f"   LOW risks: {sum(1 for a in analyses if a['severity'] == 'LOW')}")
        
        return analyses


# Test the full pipeline: Agent 1 → Agent 2
if __name__ == "__main__":
    from agent_policy_researcher import PolicyResearcherAgent
    
    # Initialize both agents (API key loads from .env)
    print("🚀 Initializing ARCA System...")
    agent1 = PolicyResearcherAgent()
    agent2 = ComplianceAuditorAgent()
    
    # Test regulation
    test_regulation = """
    Article 7: Data Retention Requirements
    
    All companies processing personal data must implement the following:
    1. Personal data must be permanently deleted after 12 months of user inactivity
    2. Companies must obtain explicit written consent before processing any personal information
    3. All data retention policies must be reviewed and updated annually
    4. Backup copies of deleted data must also be removed within 30 days
    """
    
    # STEP 1: Policy Researcher finds relevant policies
    policy_results = agent1.analyze(test_regulation)
    
    # STEP 2: Compliance Auditor analyzes each policy
    audit_results = agent2.analyze(policy_results, test_regulation)
    
    # Display results
    print("\n" + "="*60)
    print("📊 FINAL AUDIT RESULTS")
    print("="*60)
    
    for result in audit_results:
        print(f"\n{'='*60}")
        print(f"Policy: {result['policy_id']} | Severity: {result['severity']}")
        print(f"Source: {result['source']} (Page {result['page']})")
        print(f"{'='*60}")
        print(f"\n📝 Conflict Summary:")
        print(f"   {result['divergence_summary']}")
        print(f"\n📄 Internal Policy Says:")
        print(f"   \"{result['conflicting_policy_excerpt'][:150]}...\"")
        print(f"\n📜 New Regulation Says:")
        print(f"   \"{result['new_rule_excerpt'][:150]}...\"")
        print(f"\n💡 Recommendation:")
        print(f"   {result['recommendation']}")

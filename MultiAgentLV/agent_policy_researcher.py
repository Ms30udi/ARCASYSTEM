from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import os

# Singleton pattern for embedding model (consistent across requests)
_embedding_model_instance = None

def get_embedding_model():
    """Get or create singleton embedding model for consistency"""
    global _embedding_model_instance
    if _embedding_model_instance is None:
        _embedding_model_instance = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}  # Consistent similarity scores
        )
    return _embedding_model_instance


class PolicyResearcherAgent:
    """
    Agent 1: Policy Researcher - Searches for relevant policy excerpts
    with deterministic embeddings and consistent results
    """
    
    def __init__(self, faiss_index_path="faiss_index"):
        # Load FAISS index
        print("📥 Loading FAISS index...")
        
        if not os.path.exists(faiss_index_path):
            raise FileNotFoundError(
                f"FAISS index not found at '{faiss_index_path}'. "
                "Please run rag_setup.py first."
            )
        
        embeddings = get_embedding_model()
        
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
            List of dictionaries with policy excerpts and metadata (sorted by relevance)
        """
        # Perform similarity search (deterministic with normalized embeddings)
        results = self.vector_store.similarity_search_with_score(query, k=top_k)
        
        formatted_results = []
        for i, (doc, score) in enumerate(results):
            # Extract clean source path
            source_path = doc.metadata.get('source', 'unknown')
            source_file = os.path.basename(source_path).replace('\\', '/')
            
            formatted_results.append({
                "policy_id": f"POL-{str(i+1).zfill(3)}",  # POL-001, POL-002, etc.
                "excerpt": doc.page_content,
                "source": source_file,
                "page": doc.metadata.get('page', 'N/A'),
                "similarity_score": round(float(score), 4)
            })
        
        return formatted_results
    
    def analyze(self, new_regulation_text):
        """
        Main method: Search for relevant policies with consistent results
        
        Args:
            new_regulation_text: The text of the new regulation
        
        Returns:
            List of top 5 relevant policy excerpts (consistent ordering by relevance)
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
    Article 7: Data Retention Requirements
    
    All companies processing personal data must implement the following:
    1. Personal data must be permanently deleted after 12 months of user inactivity
    2. Companies must obtain explicit written consent before processing any personal information
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

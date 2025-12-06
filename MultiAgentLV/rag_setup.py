from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings  # ✅ Updated
from langchain_community.vectorstores import FAISS
import os

# 1. Load PDF files
def load_documents(pdf_folder_path):
    loader = DirectoryLoader(pdf_folder_path, glob="**/*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    return documents

# 2. Split documents into chunks
def split_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    return chunks

# 3. Create FAISS vector store
def create_vector_store(chunks, save_path="faiss_index"):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local(save_path)
    return vector_store

# Run the pipeline
if __name__ == "__main__":
    docs = load_documents("./policies")  # Put your PDFs here
    chunks = split_documents(docs)
    print(f"Created {len(chunks)} chunks")
    vector_store = create_vector_store(chunks)
    print("FAISS index created and saved!")

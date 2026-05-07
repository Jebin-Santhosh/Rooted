from langchain_community.document_loaders import PyPDFLoader
from langchain_community.llms import Ollama
import os

# Load PDFs
def load_pdfs(folder):
    text = ""
    for file in os.listdir(folder):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(folder, file))
            pages = loader.load()
            for page in pages:
                text += page.page_content + "\n"
    return text

# Load all dental knowledge
pdf_text = load_pdfs("data/dental_pdfs")

# Initialize Llama3
llm = Ollama(model="llama3")

# Ask question
query = input("Ask your dental question: ")

prompt = f"""
You are a dental expert assistant.

Answer the question ONLY using the provided dental research context.
If the answer is not in the context, say "Based on available data, more analysis is needed."

Context:
{pdf_text[:4000]}

Question:
{query}

Answer clearly and professionally:
"""

response = llm.invoke(prompt)

print("\nAnswer:\n", response)
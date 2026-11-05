# ⚛️ QCircuit Bench: LLM Quantum Code Generation Evaluator

## 📖 About the Project
This project is developed for **Review III** of our Capstone Project. It is an evaluation framework and interactive dashboard designed to benchmark multiple Large Language Models (LLMs) (such as Llama 3, Phi-3, ChatGPT, Gemini, Claude, DeepSeek, Perplexity, and Copilot) on generating correct and executable quantum circuits (using datasets from QCircuit Bench).

The system evaluates model accuracy, code efficiency, and failure taxonomy (such as syntax errors vs. quantum reasoning errors) to determine which models excel at quantum computing tasks and where lagging models fail.

---

## 🛠️ Tech Stack
* **Frontend:** React (Vite), Tailwind CSS, Recharts (for graphs), Lucide React (for icons)
* **Backend:** Python, FastAPI, Uvicorn, Pydantic
* **Dataset & Logic:** QCircuit Bench dataset integration, simulated quantum circuit execution metrics (`AerSimulator`)
* **Version Control & Deployment:** Git, GitHub, Docker (optional local deployment)

---

## 🔄 Project Workflow Architecture
1. **Dataset Ingestion:** Quantum circuit tasks (Bell State, GHZ State, QFT, Grover's Search, VQE) are loaded from the QCircuit Bench dataset.
2. **Model Selection & Evaluation:** Users choose which models and tasks they want to compare via the interactive UI. The FastAPI backend processes the performance data.
3. **Report Generation:** The dashboard dynamically generates comparison charts, highlights the **Top Performer** and **Lagging Model**, and explains the reasons behind their successes or failures.

---

## 📂 Folder Structure
```text
quantum-benchmark-app/
├── frontend/                   # React Frontend (User Interface & Dashboard)
│   ├── src/
│   │   ├── components/         # Dashboard UI components
│   │   ├── App.jsx             # Main application wrapper
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Frontend dependencies
│   └── Dockerfile              # Container setup for frontend
│
├── backend/                    # Python Backend (FastAPI Server & Logic)
│   ├── app/
│   │   └── main.py             # API endpoints and evaluation engine
│   ├── requirements.txt        # Python package requirements
│   └── Dockerfile              # Container setup for backend
│
├── dataset/                    # QCircuit Bench Dataset files
│   └── qasm_files/             # Raw quantum circuit definitions
│
└── docker-compose.yml          # Configuration to run both frontend & backend together

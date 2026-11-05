import React, { useState, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Cpu, Database, CheckCircle2, AlertTriangle,
  ChevronRight, Play, Activity, Award, RotateCcw, ArrowLeft,
} from 'lucide-react';

const ALL_MODELS = [
  'Llama 3', 'Phi-3', 'ChatGPT', 'Gemini',
  'Claude', 'DeepSeek', 'Perplexity', 'Copilot',
];

const QCIRCUIT_TASKS = [
  'Bell State (2-qubit)',
  'GHZ State (Multi-qubit)',
  'QFT',
  "Grover's Search",
  'VQE Ansatz',
];

const MODEL_COLORS = {
  'Llama 3': 'bg-purple-100 text-purple-700 border-purple-300',
  'Phi-3': 'bg-teal-100 text-teal-700 border-teal-300',
  'ChatGPT': 'bg-green-100 text-green-700 border-green-300',
  'Gemini': 'bg-blue-100 text-blue-700 border-blue-300',
  'Claude': 'bg-orange-100 text-orange-700 border-orange-300',
  'DeepSeek': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'Perplexity': 'bg-pink-100 text-pink-700 border-pink-300',
  'Copilot': 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedTask, setSelectedTask] = useState(QCIRCUIT_TASKS[0]);
  const [resultsData, setResultsData] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [error, setError] = useState(null);

  const handleTrainModels = useCallback(() => {
    setIsTraining(true);
    setError(null);
    setTimeout(() => {
      setIsTraining(false);
      setStep(2);
    }, 2000);
  }, []);

  const handleToggleModel = useCallback((model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedModels((prev) =>
      prev.length === ALL_MODELS.length ? [] : [...ALL_MODELS]
    );
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (selectedModels.length === 0) {
      setError('Please select at least one model.');
      return;
    }
    setIsLoadingReport(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: selectedTask, models: selectedModels }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResultsData(data.results);
      setStep(3);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Is the backend running?');
      } else {
        setError(err.message || 'Failed to connect to backend server.');
      }
    } finally {
      setIsLoadingReport(false);
    }
  }, [selectedModels, selectedTask]);

  const handleReset = useCallback(() => {
    setStep(1);
    setSelectedModels([]);
    setResultsData([]);
    setError(null);
  }, []);

  /* ─── Step 1: Initialize ─── */
  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-30" />
        <Database className="relative w-20 h-20 text-blue-500" />
      </div>

      <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
        QCircuit Bench Evaluator
      </h2>
      <p className="text-gray-500 max-w-lg mt-3 text-lg leading-relaxed">
        Initialize and load the dataset to evaluate LLM performance on quantum
        circuit generation tasks.
      </p>

      <button
        onClick={handleTrainModels}
        disabled={isTraining}
        className="mt-8 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isTraining ? (
          <>
            <Activity className="animate-spin w-6 h-6" />
            Benchmarking Models…
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Initialize Benchmark
          </>
        )}
      </button>

      <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-2xl">
        {ALL_MODELS.map((model) => (
          <span
            key={model}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${MODEL_COLORS[model]}`}
          >
            {model}
          </span>
        ))}
      </div>
    </div>
  );

  /* ─── Step 2: Configure ─── */
  const renderStep2 = () => (
    <div className="py-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle2 className="text-green-500 w-7 h-7" />
          Benchmark Loaded
        </h2>
        <p className="text-gray-500 mt-1">
          Select the quantum task and models you wish to compare.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Task Selector */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            1. Select Quantum Task
          </h3>
          <div className="space-y-2">
            {QCIRCUIT_TASKS.map((task) => (
              <button
                key={task}
                onClick={() => setSelectedTask(task)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTask === task
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {task}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selector */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              2. Select Models
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {selectedModels.length === ALL_MODELS.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            {selectedModels.length} of {ALL_MODELS.length} selected
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ALL_MODELS.map((model) => {
              const isSelected = selectedModels.includes(model);
              return (
                <button
                  key={model}
                  onClick={() => handleToggleModel(model)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{model}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleGenerateReport}
          disabled={isLoadingReport || selectedModels.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoadingReport ? (
            <>
              <Activity className="animate-spin w-5 h-5" />
              Evaluating…
            </>
          ) : (
            <>
              Generate Report
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  /* ─── Step 3: Results ─── */
  const renderStep3 = () => {
    if (!resultsData.length) return null;

    const sortedByAccuracy = [...resultsData].sort(
      (a, b) => b.accuracy - a.accuracy
    );
    const bestModel = sortedByAccuracy[0];
    const worstModel = sortedByAccuracy[sortedByAccuracy.length - 1];

    const radarData = resultsData.map((m) => ({
      name: m.name,
      Accuracy: m.accuracy,
      Efficiency: m.efficiency,
      Reliability: Math.max(0, 100 - m.syntaxErrors * 7),
    }));

    return (
      <div className="py-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Evaluation Report
            </h2>
            <p className="text-gray-500 mt-1">
              Task:{' '}
              <span className="font-semibold text-indigo-600">
                {selectedTask}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Modify
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 animate-slide-up">
            <h3 className="text-lg font-bold text-green-800 flex items-center gap-2 mb-3">
              <Award className="w-6 h-6" />
              Top Performer: {bestModel.name}
            </h3>
            <p className="text-green-700 leading-relaxed">
              Highest accuracy at <strong>{bestModel.accuracy}%</strong> with an
              efficiency score of {bestModel.efficiency}%.
            </p>
            <div className="mt-4 flex gap-4">
              <div className="bg-white/70 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-green-600 font-medium">Accuracy</span>
                <p className="text-lg font-bold text-green-800">{bestModel.accuracy}%</p>
              </div>
              <div className="bg-white/70 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-green-600 font-medium">Efficiency</span>
                <p className="text-lg font-bold text-green-800">{bestModel.efficiency}%</p>
              </div>
              <div className="bg-white/70 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-green-600 font-medium">Errors</span>
                <p className="text-lg font-bold text-green-800">{bestModel.syntaxErrors}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-6 h-6" />
              Needs Improvement: {worstModel.name}
            </h3>
            <p className="text-red-700 leading-relaxed">
              Scored <strong>{worstModel.accuracy}%</strong> with{' '}
              <strong>{worstModel.syntaxErrors} syntax errors</strong>.
            </p>
            <div className="mt-4 flex gap-4">
              <div className="bg-white/70 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-red-600 font-medium">Accuracy</span>
                <p className="text-lg font-bold text-red-800">{worstModel.accuracy}%</p>
              </div>
              <div className="bg-white/70 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-red-600 font-medium">Efficiency</span>
                <p className="text-lg font-bold text-red-800">{worstModel.efficiency}%</p>
              </div>
              <div className="bg-white/70 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-red-600 font-medium">Errors</span>
                <p className="text-lg font-bold text-red-800">{worstModel.syntaxErrors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultsData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Bar dataKey="accuracy" name="Accuracy (%)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="efficiency" name="Efficiency (%)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="syntaxErrors" name="Syntax Errors" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Radar Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Accuracy" dataKey="Accuracy" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                  <Radar name="Efficiency" dataKey="Efficiency" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                  <Radar name="Reliability" dataKey="Reliability" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700">Detailed Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Accuracy</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Syntax Errors</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gate Count</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Depth</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedByAccuracy.map((model, index) => {
                  const grade =
                    model.accuracy >= 90 ? { label: 'A', color: 'bg-green-100 text-green-700' } :
                    model.accuracy >= 75 ? { label: 'B', color: 'bg-blue-100 text-blue-700' } :
                    model.accuracy >= 60 ? { label: 'C', color: 'bg-yellow-100 text-yellow-700' } :
                    { label: 'D', color: 'bg-red-100 text-red-700' };

                  return (
                    <tr key={model.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-400">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${MODEL_COLORS[model.name] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {model.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{model.accuracy}%</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{model.efficiency}%</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{model.syntaxErrors}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{model.gateCount ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{model.circuitDepth ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${grade.color}`}>{grade.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Stepper ─── */
  const steps = [
    { num: 1, label: 'Initialize' },
    { num: 2, label: 'Configure' },
    { num: 3, label: 'Results' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Cpu className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              QCircuitEval
            </span>
          </div>

          {/* Stepper */}
          <div className="hidden sm:flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                {i > 0 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step >= s.num ? 'bg-indigo-400' : 'bg-gray-200'
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    step === s.num
                      ? 'bg-indigo-100 text-indigo-700'
                      : step > s.num
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                      step === s.num
                        ? 'bg-indigo-600 text-white'
                        : step > s.num
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-white'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  {s.label}
                </div>
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}

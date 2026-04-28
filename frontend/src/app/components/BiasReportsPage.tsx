import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity, BarChart3, PieChart, ShieldCheck, TrendingUp, AlertTriangle, Target, AlertCircle, ArrowLeft } from "lucide-react";
import { API_BASE_URL, apiFetch } from "../api";

type AnalysisReport = {
  analysis_id: string;
  status: string;
  created_at?: string;
  dataset_id?: string;
  target_column?: string;
  sensitive_columns?: string[];
  result?: {
    aggregate_score?: {
      average_bias_score?: number;
      overall_bias_band?: string;
      average_fairness_score?: number;
    };
    structured_recommendations?: Record<string, Array<{ title?: string; action?: string; description?: string } | string>>;
    problematic_columns?: string[];
  };
};

export function BiasReportsPage() {
  const [latestReport, setLatestReport] = useState<AnalysisReport | null>(null);
  const [reportHistory, setReportHistory] = useState<AnalysisReport[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetId, setDatasetId] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [sensitiveColumns, setSensitiveColumns] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState("");
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const fetchLatestReport = () => {
    setIsLoadingReport(true);
    return apiFetch("/reports")
      .then((response) => {
        const reports = Array.isArray(response.data) ? response.data : [];
        const completedReports = reports.filter((report: AnalysisReport) => report.status === "completed" && report.result);
        const completedReport = completedReports[0];
        setReportHistory(completedReports);
        setLatestReport(completedReport || null);
      })
      .catch((error) => console.error("AI report fetch error:", error))
      .finally(() => setIsLoadingReport(false));
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const handleUploadDataset = async () => {
    if (!selectedFile) {
      setAiStatus("Please choose a CSV file first.");
      return;
    }

    setIsRunningAudit(true);
    setAiStatus("Uploading dataset...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const uploadResult = await response.json();

      if (!response.ok || uploadResult.success === false) {
        throw new Error(uploadResult.message || "Dataset upload failed");
      }

      const uploadedDatasetId = uploadResult.data.dataset_id;
      setDatasetId(uploadedDatasetId);
      setAiStatus("Reading dataset columns...");

      const datasetResult = await apiFetch(`/datasets/${uploadedDatasetId}`);
      const loadedColumns = datasetResult.data.column_names || [];
      setColumns(loadedColumns);
      setTargetColumn(loadedColumns[loadedColumns.length - 1] || "");
      setSensitiveColumns(loadedColumns.includes("gender") ? ["gender"] : []);
      setAiStatus("Dataset uploaded. Choose target and sensitive columns, then run AI audit.");
    } catch (error) {
      console.error("Dataset upload error:", error);
      setAiStatus(error instanceof Error ? error.message : "Dataset upload failed.");
    } finally {
      setIsRunningAudit(false);
    }
  };

  const toggleSensitiveColumn = (column: string) => {
    setSensitiveColumns((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column]
    );
  };

  const handleRunAudit = async () => {
    if (!datasetId || !targetColumn || sensitiveColumns.length === 0) {
      setAiStatus("Upload a dataset, select one target column, and choose at least one sensitive column.");
      return;
    }

    setIsRunningAudit(true);
    setAiStatus("Creating AI analysis...");

    try {
      const createResult = await apiFetch("/analysis/create", {
        method: "POST",
        body: JSON.stringify({
          dataset_id: datasetId,
          target_column: targetColumn,
          sensitive_columns: sensitiveColumns,
        }),
      });

      const analysisId = createResult.data.analysis_id;
      setAiStatus("Running AI fairness audit...");

      await apiFetch(`/analysis/run/${analysisId}`, { method: "POST" });

      let finalReport: AnalysisReport | null = null;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const reportResult = await apiFetch(`/analysis/${analysisId}`);
        const reportData = reportResult.data as AnalysisReport;
        if (reportData.status === "completed" || reportData.status === "failed") {
          finalReport = reportData;
          break;
        }
      }

      if (!finalReport) {
        setAiStatus("Analysis is still running. Refresh the page in a few seconds.");
        return;
      }

      if (finalReport.status === "failed") {
        setAiStatus("AI analysis failed. Please check the backend terminal.");
        return;
      }

      setLatestReport(finalReport);
      setAiStatus("AI audit completed and report updated.");
      fetchLatestReport();
    } catch (error) {
      console.error("AI audit error:", error);
      setAiStatus(error instanceof Error ? error.message : "AI audit failed.");
    } finally {
      setIsRunningAudit(false);
    }
  };

  const aggregateScore = latestReport?.result?.aggregate_score;
  const recommendationGroups = latestReport?.result?.structured_recommendations || {};
  const recommendations = Object.values(recommendationGroups).flat().slice(0, 4);

  const handleDownloadReport = () => {
    if (!latestReport) return;

    const blob = new Blob([JSON.stringify(latestReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-fairness-report-${latestReport.analysis_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 relative">
        <div className="flex justify-start -mb-8">
          <button 
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.href = "/dashboard";
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <Activity className="h-8 w-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-slate-900 mb-4">
            Bias Mitigation Reports
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-slate-600 max-w-3xl mx-auto space-y-4">
            <p>Our system performs automated fairness audits across all AI modules using advanced statistical techniques.</p>
            <p>Bias is not only detected but also corrected through intelligent mitigation strategies.</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">
            <BarChart3 className="h-4 w-4" />
            Run AI Fairness Audit
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Upload Dataset And Generate Report</h2>
          <p className="text-slate-500 mb-6">Choose a CSV file, select the decision column, mark sensitive attributes, and run the AI audit directly from the website.</p>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">CSV Dataset</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-indigo-700"
                />
                <button
                  type="button"
                  onClick={handleUploadDataset}
                  disabled={isRunningAudit || !selectedFile}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Upload And Read Columns
                </button>
              </div>

              {columns.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Column</label>
                    <select
                      value={targetColumn}
                      onChange={(event) => setTargetColumn(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      {columns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Sensitive Columns</p>
                    <div className="flex flex-wrap gap-2">
                      {columns.filter((column) => column !== targetColumn).map((column) => (
                        <button
                          key={column}
                          type="button"
                          onClick={() => toggleSensitiveColumn(column)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                            sensitiveColumns.includes(column)
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                          }`}
                        >
                          {column}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunAudit}
                    disabled={isRunningAudit || !targetColumn || sensitiveColumns.length === 0}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {isRunningAudit ? "Running AI Audit..." : "Run AI Audit"}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900 mb-3">Audit Status</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{aiStatus || "Upload a CSV file to begin the AI fairness audit."}</p>
              {datasetId && (
                <div className="mt-4 rounded-lg bg-white p-3 text-xs text-slate-500 border border-slate-100 break-all">
                  <span className="font-bold text-slate-700">Dataset ID:</span> {datasetId}
                </div>
              )}
              {columns.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Detected Columns</p>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((column) => (
                      <span key={column} className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">{column}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" />
                Live AI Audit Result
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Latest Fairness Analysis</h2>
              <p className="text-slate-500 mt-2 max-w-2xl">
                {isLoadingReport
                  ? "Loading the latest completed AI analysis..."
                  : latestReport
                    ? `Analysis ${latestReport.analysis_id} is completed and loaded from MongoDB.`
                    : "No completed AI analysis found yet. Run an analysis from Swagger or the app to populate this panel."}
              </p>
            </div>

            {aggregateScore && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full lg:min-w-[520px]">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Fairness Score</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{aggregateScore.average_fairness_score ?? 0}/100</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <p className="text-xs font-bold text-amber-700 uppercase">Bias Score</p>
                  <p className="text-2xl font-black text-amber-900 mt-1">{aggregateScore.average_bias_score ?? 0}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-600 uppercase">Bias Level</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 capitalize">{aggregateScore.overall_bias_band ?? "low"}</p>
                </div>
              </div>
            )}
          </div>

          {latestReport && (
            <>
              <div className="grid lg:grid-cols-2 gap-6 mt-8">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900 mb-3">Analysis Inputs</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-800">Target column:</span> {latestReport.target_column || "decision"}</p>
                    <p><span className="font-semibold text-slate-800">Sensitive columns:</span> {(latestReport.sensitive_columns || []).join(", ") || "gender"}</p>
                    <p><span className="font-semibold text-slate-800">Problematic columns:</span> {(latestReport.result?.problematic_columns || []).join(", ") || "None detected"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900 mb-3">Top Recommendations</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    {recommendations.length > 0 ? recommendations.map((item, index) => {
                      const text = typeof item === "string" ? item : item.action || item.description || item.title || "Review fairness metrics and rebalance data.";
                      return <p key={index} className="flex gap-2"><span className="font-bold text-indigo-600">{index + 1}.</span>{text}</p>;
                    }) : <p>No recommendations generated for this sample.</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <h3 className="font-bold text-slate-900">Export Current Report</h3>
                  <p className="text-sm text-slate-500 mt-1">Download the complete AI audit JSON for submission, debugging, or future report generation.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-slate-800"
                >
                  Download JSON Report
                </button>
              </div>

              {reportHistory.length > 0 && (
                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">Report History</h3>
                      <p className="text-sm text-slate-500">Completed AI audits saved in MongoDB.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">{reportHistory.length} reports</span>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {reportHistory.slice(0, 6).map((report) => {
                      const reportScore = report.result?.aggregate_score;
                      const isActive = report.analysis_id === latestReport.analysis_id;
                      return (
                        <button
                          key={report.analysis_id}
                          type="button"
                          onClick={() => setLatestReport(report)}
                          className={`text-left rounded-xl border p-4 transition-colors ${
                            isActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-400 uppercase">Analysis</p>
                          <p className="font-mono text-xs text-slate-600 truncate mt-1">{report.analysis_id}</p>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="font-bold text-slate-800">{reportScore?.average_fairness_score ?? 0}/100</span>
                            <span className="capitalize rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{reportScore?.overall_bias_band ?? "low"}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* ROW 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">AI Powered</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Demographic Equivalence</h2>
            <ul className="text-slate-600 space-y-2 text-sm flex-grow">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Measures whether outcomes are equally distributed across different user groups</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Detects imbalance in predictions (selection bias)</li>
            </ul>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">AI Powered</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Statistical Parity Difference</h2>
            <ul className="text-slate-600 space-y-2 text-sm flex-grow">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Calculates difference in favorable outcomes between privileged and unprivileged groups</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Helps identify discrimination patterns</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Critical</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Disparate Impact Ratio</h2>
            <ul className="text-slate-600 space-y-2 text-sm flex-grow">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Ensures fairness threshold (&gt;= 0.8 rule) is maintained</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Flags high-risk bias scenarios instantly</li>
            </ul>
          </motion.div>

          {/* ROW 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Real-time</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Aggregate Fairness Score</h2>
            <ul className="text-slate-600 space-y-2 text-sm flex-grow">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Combines all fairness metrics into a single understandable score</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Provides real-time fairness health of the system</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">AI Powered</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Feature-Level Bias Detection</h2>
            <ul className="text-slate-600 space-y-2 text-sm flex-grow">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Identifies which input feature (e.g. income, gender) is causing bias</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" /> Helps in targeted bias removal</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Critical</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Model Drift Monitoring</h2>
            <ul className="text-slate-600 space-y-2 text-sm flex-grow">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Detects performance and fairness degradation over time</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Alerts when model behavior changes significantly</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Ensures long-term unbiased AI decisions</li>
            </ul>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-16 border-t border-slate-200 pt-10">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Trust Indicators
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-center">
              {[
                { label: "Fairness Score", value: "99.8%" },
                { label: "Data Leakage Policy", value: "Zero" },
                { label: "Security Monitoring", value: "24/7" },
                { label: "Validation Layer", value: "AI + Human" }
              ].map((stat, i) => (
                <div key={i} className="px-6 py-3 bg-white rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                  <span className="font-bold text-slate-800">{stat.value}</span>
                  <span className="text-slate-500 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

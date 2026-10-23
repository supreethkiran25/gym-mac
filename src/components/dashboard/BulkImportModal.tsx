import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, AlertTriangle, FileCheck } from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { ImportValidationResult } from "../../lib/csv-import-validator";
import { toast } from "sonner";

export function BulkImportModal() {
  const { isBulkImportOpen, setIsBulkImportOpen, bulkImportMembers, validateImportBatch, settings } = useGymStore();
  const [csvText, setCsvText] = useState("");
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isBulkImportOpen) return null;

  const sampleCsv = `Name,Phone,Email,Plan,Due,JoinDate,HealthGoal
Alex Henderson,+91 98000 11111,alex.h@gmail.com,Monthly Flex,0,2026-05-19,Hypertrophy
Sara Khan,+91 98000 22222,sara.k@gmail.com,Quarterly Pro,2000,2026-05-19,Weight Loss
Nikhil Kamath,+91 98000 33333,nikhil.k@gmail.com,Annual Elite,0,2026-05-19,Strength
Divya Sharma,+91 98000 44444,divya.s@gmail.com,Monthly Flex,0,2026-05-19,Conditioning`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "peakrep_bulk_members_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded validated CSV sample template");
  };

  const handleParse = (textToParse: string) => {
    setErrorMsg("");
    try {
      const lines = textToParse.trim().split("\n");
      if (lines.length < 2) {
        setValidationResult(null);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rawRows: Array<Record<string, string>> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(",").map((v) => v.trim());

        const rowObj: Record<string, string> = {};
        headers.forEach((header, idx) => {
          rowObj[header] = values[idx] || "";
        });

        rawRows.push(rowObj);
      }

      const result = validateImportBatch(rawRows);
      setValidationResult(result);
    } catch (e) {
      const err = e as Error;
      setErrorMsg("Failed to parse CSV: " + err.message);
      setValidationResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setCsvText(content);
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationResult || validationResult.validRows.length === 0) {
      toast.error("No valid member rows found to import");
      return;
    }

    const count = bulkImportMembers(validationResult.validRows);
    toast.success(`Successfully imported ${count} validated members into directory!`);
    setIsBulkImportOpen(false);
    setCsvText("");
    setValidationResult(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setIsBulkImportOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0f19] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-black font-bold">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Safe CSV Member Importer</h3>
              <p className="text-xs text-slate-400">
                Authoritative validation, cross-directory duplicate detection, and dry-run preview.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBulkImportOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#05080f] border border-white/5 text-xs">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 font-semibold hover:bg-white/10 transition text-slate-200 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Download CSV Template</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer transition shadow-md">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload .CSV File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* CSV Text Input / Paste Box */}
        <div className="space-y-1.5 text-xs">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span>Or Paste Raw CSV Data Below:</span>
            <button
              type="button"
              onClick={() => {
                setCsvText(sampleCsv);
                handleParse(sampleCsv);
              }}
              className="text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Load Sample Demo Batch
            </button>
          </div>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder={`Name,Phone,Email,Plan,Due,JoinDate\nJohn Doe,+91 99999 88888,john@gym.com,Monthly Flex,0,2026-05-19`}
            className="w-full rounded-2xl border border-white/10 bg-[#05080f] p-3 font-mono text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* Dry-Run Validation Summary */}
        {validationResult && (
          <div className="space-y-3 text-xs">
            {/* Stat Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                <span className="block font-mono font-bold text-base text-emerald-400">
                  {validationResult.validCount}
                </span>
                Valid & Ready
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                <span className="block font-mono font-bold text-base text-amber-400">
                  {validationResult.duplicateCount}
                </span>
                Duplicates Skipped
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
                <span className="block font-mono font-bold text-base text-rose-400">
                  {validationResult.errorCount}
                </span>
                Errors Blocked
              </div>
            </div>

            {/* Error Diagnostics Table if any */}
            {validationResult.invalidRows.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1.5 max-h-28 overflow-y-auto">
                <p className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Validation Errors Detected:</span>
                </p>
                {validationResult.invalidRows.flatMap((inv) =>
                  inv.errors.map((err, i) => (
                    <p key={`${err.rowIndex}-${i}`} className="text-[11px] text-rose-300/90 font-mono">
                      Row {err.rowIndex}: {err.field} — {err.error} (value: "{err.value}")
                    </p>
                  )),
                )}
              </div>
            )}

            {/* Valid Rows Preview Table */}
            {validationResult.validRows.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  <FileCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>Validated Candidates ({validationResult.validRows.length} Members)</span>
                </span>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-white/5 bg-[#05080f]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2">Plan</th>
                        <th className="p-2">Initial Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {validationResult.validRows.map((r, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="p-2 font-medium text-white">{r.name}</td>
                          <td className="p-2 font-mono text-slate-400">{r.phone}</td>
                          <td className="p-2">{r.plan}</td>
                          <td className="p-2 font-mono text-amber-400">
                            {settings.currencySymbol}{(r.computedDue || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(false)}
            className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white font-semibold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={!validationResult || validationResult.validRows.length === 0}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md disabled:opacity-40 cursor-pointer"
          >
            Import {validationResult?.validCount || 0} Valid Members
          </button>
        </div>
      </div>
    </div>
  );
}


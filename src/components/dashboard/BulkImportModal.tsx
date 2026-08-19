import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";
import { toast } from "sonner";

export function BulkImportModal() {
  const { isBulkImportOpen, setIsBulkImportOpen, bulkImportMembers, settings } = useGymStore();
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<Array<Partial<Member>>>([]);
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
    toast.success("Downloaded sample CSV template");
  };

  const handleParse = (textToParse: string) => {
    setErrorMsg("");
    try {
      const lines = textToParse.trim().split("\n");
      if (lines.length < 2) {
        setParsedRows([]);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows: Array<Partial<Member>> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(",").map((v) => v.trim());

        const rowData: any = {};
        headers.forEach((header, idx) => {
          const val = values[idx] || "";
          if (header === "name") rowData.name = val;
          else if (header === "phone") rowData.phone = val;
          else if (header === "email") rowData.email = val;
          else if (header === "plan") rowData.plan = val;
          else if (header === "due") rowData.due = Number(val) || 0;
          else if (header === "joindate") rowData.joinDate = val;
          else if (header === "healthgoal") rowData.healthGoal = val;
        });

        if (rowData.name && rowData.phone) {
          rows.push(rowData);
        }
      }

      setParsedRows(rows);
    } catch (e: any) {
      setErrorMsg("Failed to parse CSV formatting: " + e.message);
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
    if (parsedRows.length === 0) {
      toast.error("No valid member rows found to import");
      return;
    }

    const count = bulkImportMembers(parsedRows);
    toast.success(`Successfully imported ${count} members to directory!`);
    setIsBulkImportOpen(false);
    setCsvText("");
    setParsedRows([]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={() => setIsBulkImportOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Bulk Member CSV Import</h3>
              <p className="text-xs text-muted-foreground">Import multiple members, plans, and opening balances at once</p>
            </div>
          </div>
          <button
            onClick={() => setIsBulkImportOpen(false)}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-canvas border border-border text-xs">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface font-semibold hover:bg-muted transition text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Sample CSV Template</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background font-semibold cursor-pointer hover:opacity-90 transition">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload .CSV File</span>
            <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* CSV Text Input / Paste Box */}
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center justify-between">
            <span>Or Paste Raw CSV Data Below</span>
            <button
              type="button"
              onClick={() => {
                setCsvText(sampleCsv);
                handleParse(sampleCsv);
              }}
              className="text-emerald hover:underline font-semibold"
            >
              Load Sample Demo Data
            </button>
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder={`Name,Phone,Email,Plan,Due,JoinDate\nJohn Doe,+91 99999 88888,john@gym.com,Monthly Flex,0,2026-05-19`}
            className="w-full rounded-2xl border border-border bg-canvas p-3 font-mono text-xs focus:border-foreground focus:outline-hidden"
          />
        </div>

        {/* Parse Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                Preview Parsed Records ({parsedRows.length} Valid Members Found)
              </span>
              <span className="text-emerald font-semibold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Import
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-b border-border text-muted-foreground text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Plan</th>
                    <th className="p-2">Pending Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/40">
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="p-2 font-mono text-muted-foreground">{r.phone}</td>
                      <td className="p-2">{r.plan || "Monthly Flex"}</td>
                      <td className="p-2 font-mono">
                        {settings.currencySymbol}
                        {(r.due || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(false)}
            className="px-4 py-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedRows.length === 0}
            className="px-5 py-2 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition shadow-md disabled:opacity-50"
          >
            Import {parsedRows.length} Members Now
          </button>
        </div>
      </div>
    </div>
  );
}

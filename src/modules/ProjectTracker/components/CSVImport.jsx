import React from "react";
import { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export default function CSVImport({ projectId }) {
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!csvFile || !projectId) return;

    setImporting(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        for (const row of results.data) {
          const due = row["Due Date"] ? new Date(row["Due Date"]) : null;

          await addDoc(collection(db, "trackerTasks"), {
            title: row["Title"],
            status: row["Status"]?.toLowerCase() || "todo",
            priority: row["Priority"]?.toLowerCase() || "medium",
            dueDate: due ? Timestamp.fromDate(due) : null,
            projectId: projectId,
            createdAt: Timestamp.now(),
            recurring: false, // default for imported tasks
          });
        }

        alert("✅ Tasks imported successfully!");
        setCsvFile(null);
        setImporting(false);
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        alert("❌ Failed to parse CSV file.");
        setImporting(false);
      },
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded mt-6 text-white">
      <h3 className="text-lg font-semibold mb-2">📁 Import Tasks from CSV</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-3 block w-full text-sm"
      />
      <button
        onClick={handleImport}
        disabled={!csvFile || importing}
        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {importing ? "Importing..." : "Import Tasks"}
      </button>
    </div>
  );
}

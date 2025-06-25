import React from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/config";

const downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const toCSV = (arr) => {
  if (!arr.length) return "";
  const keys = Object.keys(arr[0]);
  const header = keys.join(",");
  const rows = arr.map(obj => keys.map(k => JSON.stringify(obj[k] ?? "")).join(","));
  return [header, ...rows].join("\n");
};

export default function ExportControls() {
  const exportData = async (type = "csv") => {
    const [projSnap, taskSnap, noteSnap] = await Promise.all([
      getDocs(collection(db, "trackerProjects")),
      getDocs(collection(db, "trackerTasks")),
      getDocs(collection(db, "trackerNotes")),
    ]);

    const projects = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const tasks = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const notes = noteSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const fileType = type === "csv" ? "text/csv" : "application/json";

    const format = (data) =>
      type === "csv" ? toCSV(data) : JSON.stringify(data, null, 2);

    downloadFile(format(projects), `projects.${type}`, fileType);
    downloadFile(format(tasks), `tasks.${type}`, fileType);
    downloadFile(format(notes), `notes.${type}`, fileType);
  };

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-2">📤 Export Project Data</h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => exportData("csv")}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-white rounded"
        >
          Export All as CSV
        </button>
        <button
          onClick={() => exportData("json")}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-white rounded"
        >
          Export All as JSON
        </button>
      </div>
    </div>
  );
}

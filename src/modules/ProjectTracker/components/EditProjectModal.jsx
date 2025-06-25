import React, { useState, useEffect } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export default function EditProjectModal({ isOpen, onClose, project, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setTag(project.tag || "");
      setStartDate(
        project.startDate
          ? new Date(project.startDate.seconds * 1000).toISOString().split("T")[0]
          : ""
      );
    }
  }, [project]);

  const handleUpdate = async () => {
    if (!title.trim()) return;

    const updates = {
      title,
      description,
      tag: tag.toLowerCase(),
      startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
    };

    try {
      await updateDoc(doc(db, "trackerProjects", project.id), updates);
      onSave?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 rounded-lg p-5 sm:p-6 w-full max-w-lg shadow-xl border border-gray-700 space-y-5">
        <h2 className="text-xl font-bold text-white">✏️ Edit Project</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe this project"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. urgent, personal"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded shadow transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

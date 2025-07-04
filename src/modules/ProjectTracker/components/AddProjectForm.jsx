import React, { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddProjectForm({ onProjectAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [notify, setNotify] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await addDoc(collection(db, "trackerProjects"), {
        title,
        description,
        tags,
        reminderDate,
        notify,
        createdAt: serverTimestamp(),
      });

      // Reset all fields
      setTitle("");
      setDescription("");
      setTags([]); // ✅ correct reset
      setTagInput("");
      setReminderDate("");
      setNotify(false);
      onProjectAdded?.();
    } catch (err) {
      console.error("Error adding project:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 p-5 sm:p-6 md:p-8 rounded-xl shadow-md mb-10 space-y-4 w-full max-w-xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-white">➕ Add New Project</h2>

      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
        rows={3}
      />

      {/* Tags Input */}
      <div>
        <label className="text-white text-sm block mb-1">Tags (optional)</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {Array.isArray(tags) &&
            tags.map((t, index) => (
              <span
                key={index}
                className="bg-indigo-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="text-xs hover:text-red-400"
                >
                  ✕
                </button>
              </span>
            ))}
        </div>
        <input
          type="text"
          placeholder="Enter tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
              }
              setTagInput("");
            }
          }}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Reminder Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
        <div className="flex-1">
          <label className="block text-sm text-white mb-1">Reminder Date (optional)</label>
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-7">
          <input
            type="checkbox"
            checked={notify}
            onChange={() => setNotify(!notify)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <span className="text-sm text-white">Enable Reminder</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 text-right">
        <button
          type="submit"
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2 rounded-md shadow transition"
        >
          Add Project
        </button>
      </div>
    </form>
  );
}

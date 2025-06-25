import React, { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";



export default function AddProjectForm({ onProjectAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [notify, setNotify] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await addDoc(collection(db, "trackerProjects"), {
        title,
        description,
        tag,
        reminderDate,
        notify,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setTag("");
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
      className="bg-gray-900 border border-gray-800 p-6 sm:p-8 rounded-xl shadow-md mb-10 space-y-4"
    >
      <h2 className="text-2xl font-bold text-white mb-2">➕ Add New Project</h2>

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
      ></textarea>

      <input
        type="text"
        placeholder="Tag (e.g. client, personal, urgent)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />

      <div className="space-y-2 pt-2">
        <label className="block text-sm text-white">Reminder Date (optional)</label>
        <input
          type="date"
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />

        <label className="inline-flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={notify}
            onChange={() => setNotify(!notify)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <span className="text-sm text-white">Enable Reminder Notification</span>
        </label>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-md shadow transition duration-200"
        >
          Add Project
        </button>
      </div>
    </form>
  );
}

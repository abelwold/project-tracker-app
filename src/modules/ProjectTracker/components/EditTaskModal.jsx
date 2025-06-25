// src/pages/components/EditTaskModal.jsx
import React, { useEffect, useState } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export default function EditTaskModal({ task, onClose }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState("daily");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setPriority(task.priority || "medium");
      setIsRecurring(task.isRecurring || false);
      setRecurrenceFrequency(task.recurrenceFrequency || "daily");

      if (task.dueDate?.seconds) {
        setDueDate(new Date(task.dueDate.seconds * 1000).toISOString().slice(0, 10));
      }

      if (task.recurrenceEndDate?.seconds) {
        setRecurrenceEndDate(new Date(task.recurrenceEndDate.seconds * 1000).toISOString().slice(0, 10));
      }
    }
  }, [task]);

  const handleSave = async () => {
    const updates = {
      title,
      priority,
      isRecurring,
      recurrenceFrequency,
      dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
      recurrenceEndDate: recurrenceEndDate ? Timestamp.fromDate(new Date(recurrenceEndDate)) : null,
    };

    try {
      await updateDoc(doc(db, "trackerTasks", task.id), updates);
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 sm:px-0">
      <div className="bg-gray-900 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-indigo-600 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-5 text-center">Edit Task</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="accent-indigo-500"
            />
            <label className="text-sm text-white">Repeat</label>
          </div>

          {isRecurring && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Frequency</label>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                >
                  <option value="daily">📅 Daily</option>
                  <option value="weekly">📆 Weekly</option>
                  <option value="monthly">🗓 Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 w-full sm:w-auto"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

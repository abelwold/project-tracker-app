import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

export default function OverdueTasks() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const snap = await getDocs(collection(db, "trackerTasks"));
      const today = new Date();

      const overdue = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (task) =>
            task.status !== "done" &&
            task.dueDate &&
            new Date(task.dueDate.seconds * 1000) < today
        );

      setTasks(overdue);
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-sm text-gray-400 hover:text-indigo-400"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6 text-red-400">
        ⚠️ All Overdue Tasks
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-400">No overdue tasks 🎉</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-gray-800 border border-red-500 p-4 rounded shadow"
            >
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-300">
                Project ID: <code>{task.projectId}</code>
              </p>
              <p className="text-sm text-red-400">
                Due: {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
              </p>
              <button
                onClick={() =>
                  navigate(`/project-tracker?expand=${task.projectId}`)
                }
                className="mt-2 text-sm text-indigo-400 hover:underline"
              >
                View in Project →
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

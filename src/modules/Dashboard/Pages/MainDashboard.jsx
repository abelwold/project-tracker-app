import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

import SummaryCards from "../components/SummaryCards";
import DashboardShortcuts from "../components/DashboardShortcuts";
import ActivityFeed from "../components/ActivityFeed";
import ExportControls from "../components/ExportControls";
import TaskReminders from "../../ProjectTracker/components/TaskReminders";

export default function MainDashboard() {
  const [reminders, setReminders] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const snap = await getDocs(collection(db, "trackerProjects"));
      setProjects(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchOverdueTasks = async () => {
      const snapshot = await getDocs(collection(db, "trackerTasks"));
      const today = new Date();

      const overdue = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (task) =>
            task.status !== "done" &&
            task.dueDate &&
            new Date(task.dueDate.seconds * 1000) < today
        );

      setOverdueTasks(overdue);
    };

    fetchOverdueTasks();
  }, []);

  useEffect(() => {
    const fetchReminders = async () => {
      const today = new Date().toISOString().split("T")[0];

      const q = query(
        collection(db, "trackerProjects"),
        where("reminderDate", "==", today),
        where("notify", "==", true)
      );

      const snapshot = await getDocs(q);
      setReminders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchReminders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 sm:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            📊 Project Control Center
          </h1>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/project-tracker"
              className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow"
            >
              Open Project Tracker →
            </Link>
            <Link
              to="/overdue"
              className="bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow"
            >
              ⚠️ View Overdue Tasks
            </Link>
          </div>
        </div>

        {/* Linked Projects */}
        {projects.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow"
              >
                <h2 className="text-lg font-bold text-white mb-1">{proj.title}</h2>
                <p className="text-sm text-gray-400">{proj.description}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">#{proj.tag}</p>
                <Link
                  to={`/project/${proj.id}/tasks`}
                  className="mt-2 inline-block text-sm text-indigo-400 underline"
                >
                  View Tasks →
                </Link>
              </div>
            ))}
          </section>
        )}

        {/* Summary Cards */}
        <section className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
          <SummaryCards />
        </section>

        {/* Overdue Alert Box */}
        <div className="bg-red-600 text-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold">{overdueTasks.length}</p>
          <p className="text-sm">Overdue Tasks</p>
        </div>

        {/* Overdue Tasks Section */}
        {overdueTasks.length > 0 && (
          <section className="bg-gray-900 border border-red-500 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-red-400 mb-3">
              ⚠️ {overdueTasks.length} Overdue Task
              {overdueTasks.length > 1 ? "s" : ""}
            </h2>
            <ul className="space-y-2 text-sm text-white">
              {overdueTasks.slice(0, 3).map((task) => (
                <li key={task.id} className="bg-red-600/20 p-2 rounded">
                  <strong>{task.title}</strong> —{" "}
                  <span className="text-red-300">
                    Due: {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
            {overdueTasks.length > 3 && (
              <p className="text-xs text-gray-400 mt-2">
                ...and {overdueTasks.length - 3} more.
              </p>
            )}
          </section>
        )}

        {/* Task Reminders */}
        <section className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
          <TaskReminders />
        </section>

        {/* 🔔 Reminders Section */}
        {reminders.length > 0 && (
          <section className="bg-gray-900 border border-yellow-600 p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl font-semibold text-yellow-400">🔔 Reminders for Today</h2>
            <ul className="space-y-3">
              {reminders.map((project) => (
                <li
                  key={project.id}
                  className="bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-4 py-3 rounded-lg shadow"
                >
                  <div className="font-bold">{project.title}</div>
                  {project.description && (
                    <p className="text-sm mt-1">{project.description}</p>
                  )}
                  <p className="text-xs mt-1">Tag: {project.tag || "None"}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Shortcuts & Export */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl shadow-md">
            <DashboardShortcuts />
          </div>
          <div className="bg-gray-900 p-6 rounded-xl shadow-md">
            <ExportControls />
          </div>
        </section>

        {/* Activity Feed */}
        <section className="bg-gray-900 p-6 rounded-xl shadow-md">
          <ActivityFeed />
        </section>
      </div>
    </div>
  );
}

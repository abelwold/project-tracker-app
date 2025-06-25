import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { Timestamp } from "firebase/firestore";

export default function SummaryCards() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    trashedProjects: 0,
    tasksThisWeek: 0,
    notesThisWeek: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const projectsSnap = await getDocs(collection(db, "trackerProjects"));
      const projects = projectsSnap.docs.map((doc) => doc.data());
      const active = projects.filter((p) => !p.deleted).length;
      const trashed = projects.filter((p) => p.deleted).length;

      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
      const timestamp = Timestamp.fromDate(startOfWeek);

      const taskSnap = await getDocs(
        query(collection(db, "trackerTasks"), where("createdAt", ">=", timestamp))
      );
      const tasksThisWeek = taskSnap.size;

      const noteSnap = await getDocs(
        query(collection(db, "trackerNotes"), where("createdAt", ">=", timestamp))
      );
      const notesThisWeek = noteSnap.size;

      setStats({
        activeProjects: active,
        trashedProjects: trashed,
        tasksThisWeek,
        notesThisWeek,
      });
    };

    fetchStats();
  }, []);

  const summary = [
    { label: "Active Projects", value: stats.activeProjects, icon: "📂" },
    { label: "In Trash", value: stats.trashedProjects, icon: "🗑️" },
    { label: "Tasks This Week", value: stats.tasksThisWeek, icon: "📅" },
    { label: "Notes Created", value: stats.notesThisWeek, icon: "📝" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {summary.map((item, idx) => (
        <div key={idx} className="bg-gray-800 p-4 rounded shadow">
          <div className="text-2xl">{item.icon}</div>
          <div className="text-lg font-semibold mt-2">{item.value}</div>
          <div className="text-sm text-gray-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

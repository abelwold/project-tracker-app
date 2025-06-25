import React from "react";
import { Link } from "react-router-dom";

const shortcuts = [
  { label: "Go to Project Tracker", path: "/project-tracker", icon: "🚀" },
  { label: "Add New Project", path: "/project-tracker", icon: "➕" },
  { label: "View Trash", path: "/project-tracker?view=trash", icon: "🗑️" },
  { label: "Export Projects", path: "/project-tracker", icon: "📤" },
];

export default function DashboardShortcuts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {shortcuts.map((item, idx) => (
        <Link
          key={idx}
          to={item.path}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-3 rounded shadow flex items-center justify-between"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

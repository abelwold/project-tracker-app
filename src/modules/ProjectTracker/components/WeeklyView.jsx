import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { format, addDays, startOfToday } from "date-fns";
import { isBefore, parseISO } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


export default function WeeklyView({ projectId }) {

  const handleExport = async () => {
  const element = document.getElementById("weekly-view");
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("weekly-planner.pdf");
};

  const [tasks, setTasks] = useState([]);
const getOverdueTasks = () => {
  return tasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    const due = t.dueDate.toDate?.() || new Date(t.dueDate);
    return isBefore(due, today);
  });
};


  const fetchWeeklyTasks = async () => {
    const q = query(collection(db, "trackerTasks"), where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(data);
  };

  useEffect(() => {
    fetchWeeklyTasks();
  }, [projectId]);

  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

const getTasksForDay = (day) => {
  return tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = t.dueDate.toDate?.() || new Date(t.dueDate); // Support both Timestamp and raw Date
    return format(due, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
  });
};


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {getOverdueTasks().length > 0 && (
            
            <div id="weekly-view" className="bg-gray-900 p-6 rounded">
                <button
  onClick={handleExport}
  className="mb-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
>
  📄 Export as PDF
</button>

  <div className="mb-6">
    <h2 className="text-red-400 text-lg font-bold mb-2">⚠️ Overdue Tasks</h2>
    <ul className="space-y-1">
      {getOverdueTasks().map(task => (
        <li key={task.id} className="text-sm text-red-300">
          ⏰ {task.title} (Due: {format(task.dueDate.toDate?.() || new Date(task.dueDate), "MMM d")})

        </li>
      ))}
    </ul>
  </div>
  </div>
)}

      {days.map(day => (
        <div key={day} className="bg-gray-800 rounded p-4">
          <h3 className="text-lg font-semibold text-indigo-400 mb-2">
            {format(day, "EEE, MMM d")}
          </h3>
          <ul className="space-y-1">
            {getTasksForDay(day).length === 0 ? (
              <li className="text-gray-400 text-sm">No tasks</li>
            ) : (
              getTasksForDay(day).map(task => (
                <li key={task.id} className={`text-sm ${
  task.status === "done"
    ? "text-green-400"
    : task.status === "in-progress"
    ? "text-yellow-300"
    : "text-white"
}`}>
  ⏺ {task.title} ({task.status})
</li>

              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

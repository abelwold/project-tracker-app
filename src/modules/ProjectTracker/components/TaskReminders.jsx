import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, onSnapshot, query } from "firebase/firestore";
import { toast } from "react-toastify";

export default function TaskReminders() {
  const [reminders, setReminders] = useState({ today: [], tomorrow: [] });

  useEffect(() => {
    const q = query(collection(db, "trackerTasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const dueToday = [];
      const dueTomorrow = [];

      allTasks.forEach((task) => {
        if (!task.dueDate || task.status === "done") return;
        const dueDate = new Date(task.dueDate.seconds * 1000);
        if (isSameDay(dueDate, today)) dueToday.push(task);
        else if (isSameDay(dueDate, tomorrow)) dueTomorrow.push(task);
      });

      if (dueToday.length > 0) toast.warn(`🕒 ${dueToday.length} task(s) due today!`);
      if (dueTomorrow.length > 0) toast.info(`📅 ${dueTomorrow.length} task(s) due tomorrow.`);

      setReminders({ today: dueToday, tomorrow: dueTomorrow });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-900 border border-yellow-500 p-4 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold text-yellow-400 mb-3">🔔 Task Reminders</h2>

      {reminders.today.length === 0 && reminders.tomorrow.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks due today or tomorrow.</p>
      ) : (
        <div className="space-y-4">
          {reminders.today.length > 0 && (
            <div>
              <p className="text-yellow-300 font-medium mb-1">Due Today:</p>
              <ul className="text-sm list-disc list-inside text-white space-y-1">
                {reminders.today.map((task) => (
                  <li key={task.id}>{task.title}</li>
                ))}
              </ul>
            </div>
          )}
          {reminders.tomorrow.length > 0 && (
            <div>
              <p className="text-yellow-300 font-medium mb-1">Due Tomorrow:</p>
              <ul className="text-sm list-disc list-inside text-white space-y-1">
                {reminders.tomorrow.map((task) => (
                  <li key={task.id}>{task.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

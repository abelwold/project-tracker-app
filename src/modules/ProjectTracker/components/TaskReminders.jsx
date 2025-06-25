import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  
  onSnapshot,
  query
} from "firebase/firestore";




export default function TaskReminders() {
  const [reminders, setReminders] = useState({ today: [], tomorrow: [] });




  useEffect(() => {
    const fetchReminders = async () => {
      const snap = await getDocs(collection(db, "trackerTasks"));
      const tasks = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const isSameDay = (date1, date2) =>
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();

      const todayTasks = [];
      const tomorrowTasks = [];

      tasks.forEach((task) => {
        if (!task.dueDate || task.status === "done") return;
        const due = new Date(task.dueDate.seconds * 1000);

        if (isSameDay(due, today)) {
          todayTasks.push(task);
        } else if (isSameDay(due, tomorrow)) {
          tomorrowTasks.push(task);
        }
      });

      setReminders({ today: todayTasks, tomorrow: tomorrowTasks });
    };

    fetchReminders();
  }, []);

useEffect(() => {
  const q = query(collection(db, "trackerTasks"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const allTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dueToday = allTasks.filter((task) => {
      const taskDate = task.dueDate?.seconds
        ? new Date(task.dueDate.seconds * 1000)
        : null;
      return taskDate && taskDate.toDateString() === today.toDateString();
    });

    const dueTomorrow = allTasks.filter((task) => {
      const taskDate = task.dueDate?.seconds
        ? new Date(task.dueDate.seconds * 1000)
        : null;
      return taskDate && taskDate.toDateString() === tomorrow.toDateString();
    });

    if (dueToday.length > 0) {
      toast.warn(`🕒 ${dueToday.length} task(s) due today!`);
    }

    if (dueTomorrow.length > 0) {
      toast.info(`📅 ${dueTomorrow.length} task(s) due tomorrow.`);
    }

    setReminders({ today: dueToday, tomorrow: dueTomorrow }); // ✅ Fixed here
  });

  return () => unsubscribe();
}, []);



  return (
    <div className="bg-gray-900 border border-yellow-500 p-4 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-yellow-400 mb-2">🔔 Task Reminders</h2>

      {reminders.today.length === 0 && reminders.tomorrow.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks due today or tomorrow.</p>
      ) : (
        <div className="space-y-4">
          {reminders.today.length > 0 && (
            <div>
              <p className="text-yellow-300 font-medium">Due Today:</p>
              <ul className="text-sm list-disc list-inside text-white">
                {reminders.today.map((task) => (
                  <li key={task.id}>{task.title}</li>
                ))}
              </ul>
            </div>
          )}
          {reminders.tomorrow.length > 0 && (
            <div>
              <p className="text-yellow-300 font-medium">Due Tomorrow:</p>
              <ul className="text-sm list-disc list-inside text-white">
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

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const logs = [];

      // Fetch recent projects
      const projectSnap = await getDocs(
        query(collection(db, "trackerProjects"), orderBy("createdAt", "desc"), limit(5))
      );
      projectSnap.forEach(doc => {
        const d = doc.data();
        if (d.createdAt) {
          logs.push({
            type: d.deleted ? "🗑️ Project Trashed" : "📁 Project Added",
            message: d.title,
            time: d.createdAt.toDate(),
          });
        }
      });

      // Fetch recent tasks
      const taskSnap = await getDocs(
        query(collection(db, "trackerTasks"), orderBy("createdAt", "desc"), limit(5))
      );
      taskSnap.forEach(doc => {
        const d = doc.data();
        if (d.createdAt) {
          logs.push({
            type: "✅ Task Created",
            message: d.title || "Unnamed Task",
            time: d.createdAt.toDate(),
          });
        }
      });

      // Fetch recent notes
      const noteSnap = await getDocs(
        query(collection(db, "trackerNotes"), orderBy("createdAt", "desc"), limit(5))
      );
      noteSnap.forEach(doc => {
        const d = doc.data();
        if (d.createdAt) {
          logs.push({
            type: "📝 Note Created",
            message: d.content?.slice(0, 40) || "Note",
            time: d.createdAt.toDate(),
          });
        }
      });

      // Sort all combined logs by time (descending)
      logs.sort((a, b) => b.time - a.time);
      setEvents(logs.slice(0, 10)); // Limit to top 10 recent events
    };

    fetchActivity();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">📢 Recent Activity</h2>
      {events.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity to show.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e, idx) => (
            <li key={idx} className="text-sm text-gray-300">
              <span className="mr-2">{e.type}</span>
              <span className="text-white">{e.message}</span>
              <span className="block text-xs text-gray-500">
                {formatDistanceToNow(e.time, { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

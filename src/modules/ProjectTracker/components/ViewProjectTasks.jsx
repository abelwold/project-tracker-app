// src/modules/ProjectTracker/components/ViewProjectTasks.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { CSVLink } from "react-csv";

export default function ViewProjectTasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;
  const [projectTitle, setProjectTitle] = useState("");

  useEffect(() => {
  const fetchProjectTitle = async () => {
    try {
      const ref = doc(db, "trackerProjects", projectId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProjectTitle(snap.data().title || "Untitled Project");
      } else {
        setProjectTitle("Unknown Project");
      }
    } catch (err) {
      console.error("Failed to fetch project title:", err);
      setProjectTitle("Error loading project");
    }
  };

  fetchProjectTitle();
}, [projectId]);

  useEffect(() => {
    const q = query(collection(db, "trackerTasks"), where("projectId", "==", projectId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(fetched);
    });
    return () => unsubscribe();
  }, [projectId]);

  const headers = [
    { label: "Title", key: "title" },
    { label: "Status", key: "status" },
    { label: "Priority", key: "priority" },
    { label: "Due Date", key: "dueDate" },
  ];

  const csvData = tasks.map((task) => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.seconds
      ? new Date(task.dueDate.seconds * 1000).toLocaleDateString()
      : "",
  }));

  // Pagination logic
  const indexOfLast = currentPage * tasksPerPage;
  const indexOfFirst = indexOfLast - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <Link to="/" className="mb-4 inline-block text-sm text-indigo-400 hover:underline">
        ← Back to Dashboard
      </Link>

     <h1 className="text-2xl font-bold mb-6">📌 Tasks for: {projectTitle}</h1>


      {tasks.length > 0 && (
        <div className="mb-6">
          <CSVLink
            data={csvData}
            headers={headers}
            filename={`tasks-${projectId}.csv`}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
          >
            Export CSV
          </CSVLink>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-400">No tasks found for this project.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentTasks.map((task) => (
              <div key={task.id} className="bg-gray-800 p-4 rounded shadow">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-300">Status: {task.status}</p>
                <p className="text-sm text-gray-300">Priority: {task.priority}</p>
                <p className="text-sm text-gray-300">
                  Due Date:{" "}
                  {task.dueDate?.seconds
                    ? new Date(task.dueDate.seconds * 1000).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-3 text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

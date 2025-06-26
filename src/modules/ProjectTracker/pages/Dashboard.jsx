
// ✅ Responsive ProjectTrackerDashboard.jsx with improved layout handling
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import AddProjectForm from "../components/AddProjectForm";
import TaskList from "../components/TaskList";
import WeeklyView from "../components/WeeklyView";
import NotesTab from "../components/NotesTab";
import { useNavigate, useLocation } from "react-router-dom";
import EditProjectModal from "../components/EditProjectModal";
import EditTaskModal from "../components/EditTaskModal";

const tagColorMap = {};
const getColorForTag = (tag) => {
  if (tagColorMap[tag]) return tagColorMap[tag];
  const colors = [
    "bg-indigo-500", "bg-green-500", "bg-yellow-500",
    "bg-pink-500", "bg-red-500", "bg-blue-500",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  tagColorMap[tag] = color;
  return color;
};

export default function ProjectTrackerDashboard() {
  const [projects, setProjects] = useState([]);
  const [trashedProjects, setTrashedProjects] = useState([]);
  const [filterTag, setFilterTag] = useState("all");
  const [availableTags, setAvailableTags] = useState(["all"]);
  const [showTrash, setShowTrash] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const navigate = useNavigate();
  const [editingProject, setEditingProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const location = useLocation();

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getFullProjectData = async (project) => {
    const notesSnap = await getDocs(
      query(collection(db, "trackerNotes"), where("projectId", "==", project.id))
    );
    const notes = notesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const tasksSnap = await getDocs(
      query(collection(db, "trackerTasks"), where("projectId", "==", project.id))
    );
    const tasks = tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return { ...project, notes, tasks };
  };

  const exportSelectedProjects = async () => {
    const selectedProjects = projects.filter((p) => selectedIds.includes(p.id));
    const enriched = await Promise.all(selectedProjects.map((p) => getFullProjectData(p)));
    const json = JSON.stringify(enriched, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected-projects-with-notes.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchProjects = async () => {
    const allSnap = await getDocs(collection(db, "trackerProjects"));
    const data = await Promise.all(
      allSnap.docs.map(async (docSnap) => {
        const project = { id: docSnap.id, ...docSnap.data() };
        const tasksSnap = await getDocs(query(collection(db, "trackerTasks"), where("projectId", "==", docSnap.id)));
        const notesSnap = await getDocs(query(collection(db, "trackerNotes"), where("projectId", "==", docSnap.id)));

        const tasks = tasksSnap.docs.map((t) => t.data());
        const notes = notesSnap.docs.map((n) => n.data());
        const latestTask = tasks.filter((t) => t.createdAt).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)[0];
        const latestNote = notes.filter((n) => n.createdAt).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)[0];

        const latestTimestamp = latestTask?.createdAt?.seconds > latestNote?.createdAt?.seconds
          ? latestTask?.createdAt : latestNote?.createdAt;

        return {
          ...project,
          tags: project.tags?.map((t) => t.toLowerCase()) || [],
          totalTasks: tasks.length,
          todoTasks: tasks.filter((t) => t.status === "todo").length,
          inProgressTasks: tasks.filter((t) => t.status === "in progress").length,
          doneTasks: tasks.filter((t) => t.status === "done").length,
          lastUpdated: latestTimestamp,
        };
      })
    );

    setProjects(data.filter((p) => !p.deleted));
    setTrashedProjects(data.filter((p) => p.deleted));
    setAvailableTags([
  "all",
  ...new Set(
    data.flatMap((p) => (Array.isArray(p.tags) ? p.tags.map((t) => t.toLowerCase()) : []))
  ),
]);

  };

  useEffect(() => {
    fetchProjects();
    const params = new URLSearchParams(location.search);
    setShowTrash(params.get("view") === "trash");
  }, [location]);

  const filteredProjects = filterTag === "all"
    ? projects
    : projects.filter((p) =>
  Array.isArray(p.tags) && p.tags.includes(filterTag.toLowerCase())
)


  const toggleExpand = (id) =>
    setExpandedProject((prev) => (prev === id ? null : id));

  const handleTrashProject = async (id) => {
    await updateDoc(doc(db, "trackerProjects", id), {
      deleted: true,
      deletedAt: new Date(),
    });
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={fetchProjects}
      />

      <div className="top-4 z-50 mb-4">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white text-sm shadow"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        📋 Project Tracker
      </h1>

      <AddProjectForm onProjectAdded={fetchProjects} />

      <div className="sticky top-0 z-40 bg-gray-900 py-2 mb-4 flex flex-wrap gap-2 border-b border-gray-700 items-center">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition capitalize ${
              filterTag === tag
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tag === "all" ? "All Projects" : `#${tag}`}
          </button>
        ))}
        <button
          onClick={() => setShowTrash(!showTrash)}
          className={`ml-auto px-3 py-1 rounded ${
            showTrash ? "bg-red-500" : "bg-gray-600"
          } text-white`}
        >
          {showTrash ? "Back to Projects" : "View Trash"}
        </button>
      </div>

      {selectedIds.length > 0 && (
        <button
          onClick={exportSelectedProjects}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          📁 Export Selected ({selectedIds.length})
        </button>
      )}

      <ul className="space-y-4">
        {(showTrash ? trashedProjects : filteredProjects).map((proj) => (
          <li
            key={proj.id}
            className={`p-4 rounded-lg border shadow transition duration-300 ${
              showTrash
                ? "bg-gray-900 border-red-500"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(proj.id)}
                  onChange={() => toggleSelection(proj.id)}
                  className="accent-indigo-500 mt-1"
                />
                <div>
                  <h2 className="text-xl font-semibold">{proj.title}</h2>
                  <p className="text-sm text-gray-300">{proj.description}</p>
                  <div className="text-xs text-blue-300 mt-1 flex flex-wrap gap-x-4">
                    <span>Total: {proj.totalTasks}</span>
                    <span>Todo: {proj.todoTasks}</span>
                    <span>In Progress: {proj.inProgressTasks}</span>
                    <span>Done: {proj.doneTasks}</span>
                  </div>
                  {proj.lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated:{" "}
                      {new Date(proj.lastUpdated.seconds * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-col items-start gap-2">
                <div className="flex gap-1 flex-wrap mt-1">
  {proj.tags?.map((tag, idx) => (
    <span
      key={idx}
      className={`text-xs px-2 py-1 rounded-full text-white ${getColorForTag(tag)}`}
    >
      {tag}
    </span>
  ))}
</div>

                {!showTrash ? (
                  <>
                    <button onClick={() => handleTrashProject(proj.id)} className="text-xs text-red-400 hover:underline">Trash</button>
                    <button onClick={() => toggleExpand(proj.id)} className={`text-xs underline ${expandedProject === proj.id ? "text-pink-400" : "text-indigo-400"}`}>
                      {expandedProject === proj.id ? "Hide" : "View More"}
                    </button>
                    <button onClick={() => setEditingProject(proj)} className="text-xs text-yellow-400 hover:underline">Edit</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => updateDoc(doc(db, "trackerProjects", proj.id), { deleted: false, deletedAt: null }).then(fetchProjects)} className="text-green-400 text-xs hover:underline">Restore</button>
                    <button onClick={() => deleteDoc(doc(db, "trackerProjects", proj.id)).then(fetchProjects)} className="text-red-400 text-xs hover:underline">Delete Permanently</button>
                  </>
                )}
              </div>
            </div>

            {expandedProject === proj.id && (
              <div className="mt-4 space-y-6">
                <div className="border-t border-gray-700 pt-4">
                  <TaskList projectId={proj.id} setSelectedTask={setSelectedTask} />
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <WeeklyView projectId={proj.id} />
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <NotesTab projectId={proj.id} />
                </div>
                {selectedTask && (
                  <EditTaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

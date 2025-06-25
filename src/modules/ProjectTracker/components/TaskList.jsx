import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import TaskStatusChart from "./TaskStatusChart";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";

export default function TaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingPriority, setEditingPriority] = useState("medium");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState("daily");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  useEffect(() => {
    const q = query(collection(db, "trackerTasks"), where("projectId", "==", projectId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskData);

      taskData.forEach((task) => {
        const due = task.dueDate?.seconds ? new Date(task.dueDate.seconds * 1000) : null;
        if (due && task.status !== "done" && due < new Date()) {
          toast.warn(`⚠️ Task "${task.title}" is overdue!`);
        }
      });
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    const baseDate = dueDate ? new Date(dueDate) : new Date();
    const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null;

    const createTask = async (date) => {
      await addDoc(collection(db, "trackerTasks"), {
        title: newTask,
        status: "todo",
        projectId,
        createdAt: serverTimestamp(),
        dueDate: Timestamp.fromDate(date),
        priority,
        isRecurring,
        recurrenceFrequency,
        recurrenceEndDate: endDate ? Timestamp.fromDate(endDate) : null,
      });
    };

    if (isRecurring && endDate && baseDate <= endDate) {
      const dates = [];
      let current = new Date(baseDate);

      while (current <= endDate) {
        dates.push(new Date(current));
        if (recurrenceFrequency === "daily") current.setDate(current.getDate() + 1);
        else if (recurrenceFrequency === "weekly") current.setDate(current.getDate() + 7);
        else if (recurrenceFrequency === "monthly") current.setMonth(current.getMonth() + 1);
      }

      await Promise.all(dates.map((date) => createTask(date)));
    } else {
      await createTask(baseDate);
    }

    setNewTask("");
    setDueDate("");
    setPriority("medium");
    setIsRecurring(false);
    setRecurrenceFrequency("daily");
    setRecurrenceEndDate("");
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDueDate(task.dueDate?.seconds ? new Date(task.dueDate.seconds * 1000).toISOString().slice(0, 10) : "");
    setEditingPriority(task.priority || "medium");
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editingTitle.trim()) return;

    await updateDoc(doc(db, "trackerTasks", editingTaskId), {
      title: editingTitle,
      dueDate: Timestamp.fromDate(new Date(editingDueDate)),
      priority: editingPriority,
    });

    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDueDate("");
    setEditingPriority("medium");
  };

  const filtered = statusFilter === "all" ? tasks : tasks.filter((t) => t.status === statusFilter);

  const headers = [
    { label: "Title", key: "title" },
    { label: "Status", key: "status" },
    { label: "Priority", key: "priority" },
    { label: "Due Date", key: "dueDate" },
  ];

  const csvData = filtered.map((task) => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.seconds ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : "",
  }));

  return (
    <div className="mb-4">
      <TaskStatusChart tasks={tasks} />

      <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
        <div className="flex gap-2">
          {["all", "todo", "in progress", "done"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                statusFilter === status ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <CSVLink
            data={csvData}
            headers={headers}
            filename={`tasks-${projectId}.csv`}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500"
          >
            Export to CSV
          </CSVLink>
        )}
      </div>

      {/* New Task Form */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 text-white flex-1"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 text-white"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 text-white"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        <label className="text-white text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="accent-indigo-500"
          />
          Repeat
        </label>

        {isRecurring && (
          <>
            <select
              value={recurrenceFrequency}
              onChange={(e) => setRecurrenceFrequency(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white"
            >
              <option value="daily">📅 Daily</option>
              <option value="weekly">📆 Weekly</option>
              <option value="monthly">🗓 Monthly</option>
            </select>
            <input
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white"
            />
          </>
        )}

        <button
          onClick={handleAddTask}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((task) => (
            <li key={task.id} className="bg-gray-700 p-3 rounded">
              {editingTaskId === task.id ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-gray-600 text-white text-sm"
                  />
                  <input
                    type="date"
                    value={editingDueDate}
                    onChange={(e) => setEditingDueDate(e.target.value)}
                    className="px-2 py-1 rounded bg-gray-600 text-white text-sm"
                  />
                  <select
                    value={editingPriority}
                    onChange={(e) => setEditingPriority(e.target.value)}
                    className="px-2 py-1 rounded bg-gray-600 text-white text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{task.title}</p>
                    <div className="text-xs text-gray-400">
                      Due:{" "}
                      {task.dueDate?.seconds
                        ? new Date(task.dueDate.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="text-xs mt-1">
                      Priority:{" "}
                      <span className="font-semibold capitalize">{task.priority}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-sm text-indigo-300 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

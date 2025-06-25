import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { updateDoc, doc,deleteDoc } from "firebase/firestore";

export default function NotesTab({ projectId }) {
const [searchQuery, setSearchQuery] = useState("");

const handleDeleteNote = async (noteId) => {
  if (!window.confirm("Are you sure you want to delete this note?")) return;

  await deleteDoc(doc(db, "trackerNotes", noteId));
  fetchNotes();
};

const handleEdit = (note) => {
  setEditingNoteId(note.id);
  setEditingContent(note.content);
};

const handleSaveEdit = async () => {
  const noteRef = doc(db, "trackerNotes", editingNoteId);
  await updateDoc(noteRef, { content: editingContent });
  setEditingNoteId(null);
  setEditingContent("");
  fetchNotes();
};



 
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
const [editingContent, setEditingContent] = useState("");

  const fetchNotes = async () => {
    const q = query(collection(db, "trackerNotes"), where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotes(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addDoc(collection(db, "trackerNotes"), {
      content: newNote.trim(),
      projectId,
      createdAt: serverTimestamp()
    });

    setNewNote("");
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  return (
    <div className="mt-8 bg-gray-800 p-4 rounded">
      <h2 className="text-xl font-semibold text-white mb-2">📝 Notes</h2>
      <form onSubmit={handleAddNote} className="mb-4">
        <textarea
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-2"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Add Note
        </button>
      </form>
      <input
  type="text"
  placeholder="Search notes..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full p-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400"
/>
    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
  {notes
    .filter((note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((note) => (
      <li key={note.id} className="border-t border-gray-700 pt-2">
        <div className="text-xs text-gray-400 mb-1">
          {new Date(note.createdAt?.seconds * 1000).toLocaleString()}
        </div>

        {editingNoteId === note.id ? (
          <>
            <textarea
              className="w-full p-2 bg-gray-700 rounded text-white mb-2"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 px-3 py-1 rounded text-white text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setEditingNoteId(null)}
                className="bg-gray-600 px-3 py-1 rounded text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p>{note.content}</p>
            <div className="flex gap-4 mt-1">
              <button
                onClick={() => handleEdit(note)}
                className="text-xs text-indigo-400 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="text-xs text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </li>
    ))}
</ul>

    </div>
  );
}

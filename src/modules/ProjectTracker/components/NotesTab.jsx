import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";




export default function NotesTab({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const fetchNotes = async () => {
    const q = query(collection(db, "trackerNotes"), where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNotes(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addDoc(collection(db, "trackerNotes"), {
      content: newNote.trim(),
      projectId,
      createdAt: serverTimestamp(),
    });

    setNewNote("");
    fetchNotes();
  };

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
    if (!editingContent.trim()) return;
    const noteRef = doc(db, "trackerNotes", editingNoteId);
    await updateDoc(noteRef, { content: editingContent });
    setEditingNoteId(null);
    setEditingContent("");
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  return (
    <div className="mt-8 bg-gray-900 border border-gray-800 p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">📝 Project Notes</h2>

      <form onSubmit={handleAddNote} className="mb-4 space-y-2">
        <textarea
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md transition"
        >
          Add Note
        </button>
      </form>

      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-3 rounded bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
      />

      <ul className="space-y-4 text-sm">
        {notes
          .filter((note) =>
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((note) => (
            <li key={note.id} className="border-t border-gray-700 pt-2">
              <div className="text-xs text-gray-500 mb-1">
                {note.createdAt?.seconds
                  ? new Date(note.createdAt.seconds * 1000).toLocaleString()
                  : "Loading..."}
              </div>

              {editingNoteId === note.id ? (
                <>
                  <textarea
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white">{note.content}</p>
                  <div className="flex gap-4 mt-1 text-xs">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-indigo-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-400 hover:underline"
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

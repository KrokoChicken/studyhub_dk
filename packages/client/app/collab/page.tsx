/*
"use client";

import { useEffect, useState } from "react";
import CollaborativeEditor from "@/components/CollaborativeEditor/CollaborativeEditor";
import styles from "./page.module.css";

type Note = {
  roomId: string;
  title: string;
  updatedAt: string;
};

export default function CollabPage() {
  const [userName] = useState(() => `User${Math.floor(Math.random() * 10000)}`);
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [currentNoteTitle, setCurrentNoteTitle] = useState("");

  useEffect(() => {
    fetchMyNotes();
  }, []);

  async function fetchMyNotes() {
    try {
      const res = await fetch("/api/collabNotes/list");
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setMyNotes(data.notes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }

  async function createCollabNote() {
    if (!newTitle.trim()) {
      alert("Please enter a title");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/collabNotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to create note: ${errText}`);
      }

      const data = await res.json();
      setRoomId(data.note.roomId);
      setCurrentNoteTitle(data.note.title); // set title directly
      setNewTitle("");
      fetchMyNotes();
    } catch (error) {
      alert("Error creating note, check console");
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  function joinRoom() {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
    }
  }

  function leaveRoom() {
    setRoomId("");
    setInputRoomId("");
    setCurrentNoteTitle("");
  }

  // ⬇️ Fetch the note title when roomId is set (joined or created)
  useEffect(() => {
    async function fetchNoteTitle(roomId: string) {
      try {
        const res = await fetch(`/api/collabNotes/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch note data");
        const data = await res.json();
        setCurrentNoteTitle(data.note.title);
      } catch (err) {
        console.error("Error fetching note title:", err);
        setCurrentNoteTitle("Untitled Note");
      }
    }

    if (roomId) {
      fetchNoteTitle(roomId);
    }
  }, [roomId]);

  if (roomId) {
    return (
      <div className={styles.container}>
        <div className={styles.flexHeader}>
          <div>
            <h2 className={styles.subTitle}>Title: {currentNoteTitle}</h2>
            <p className={styles.roomId}>Room ID: {roomId}</p>
          </div>
          <button className={styles.leaveButton} onClick={leaveRoom}>
            Leave Room
          </button>
        </div>
        <p>Share this room ID to collaborate with others.</p>
        <CollaborativeEditor roomId={roomId} userName={userName} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Samarbejdsnoter</h1>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="New Note Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className={styles.input}
          disabled={creating}
        />
        <button
          onClick={createCollabNote}
          disabled={creating}
          className={styles.createButton}
        >
          {creating ? "Creating..." : "Create Collaborative Note"}
        </button>
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter Room ID to Join"
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
          className={styles.input}
        />
        <button onClick={joinRoom} className={styles.joinButton}>
          Join Room
        </button>
      </div>

      {myNotes.length > 0 && (
        <div className={styles.notesSection}>
          <h2 className={styles.subTitle}>Your Notes</h2>
          <ul className={styles.noteList}>
            {myNotes.map((note) => (
              <li key={note.roomId} className={styles.noteItem}>
                <button
                  onClick={() => {
                    setRoomId(note.roomId);
                    setCurrentNoteTitle(note.title); // immediate fallback
                  }}
                  className={styles.noteButton}
                >
                  <strong>{note.title}</strong>
                  <div className={styles.noteDate}>
                    Last edited: {new Date(note.updatedAt).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
*/

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Note = {
  roomId: string;
  title: string;
  updatedAt: string;
};

export default function CollabLobbyPage() {
  const router = useRouter();
  const [userName] = useState(() => `User${Math.floor(Math.random() * 10000)}`);
  const [inputRoomId, setInputRoomId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [myNotes, setMyNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  async function fetchMyNotes() {
    try {
      const res = await fetch("/api/collabNotes/list");
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setMyNotes(data.notes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }

  async function createCollabNote() {
    if (!newTitle.trim()) {
      alert("Please enter a title");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/collabNotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to create note: ${errText}`);
      }

      const data = await res.json();
      router.push(`/collab/${data.note.roomId}`);
    } catch (error) {
      alert("Error creating note, check console");
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  function joinRoom() {
    if (inputRoomId.trim()) {
      router.push(`/collab/${inputRoomId.trim()}`);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Samarbejdsnoter</h1>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="New Note Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className={styles.input}
          disabled={creating}
        />
        <button
          onClick={createCollabNote}
          disabled={creating}
          className={styles.createButton}
        >
          {creating ? "Creating..." : "Create Collaborative Note"}
        </button>
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter Room ID to Join"
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
          className={styles.input}
        />
        <button onClick={joinRoom} className={styles.joinButton}>
          Join Room
        </button>
      </div>

      {myNotes.length > 0 && (
        <div className={styles.notesSection}>
          <h2 className={styles.subTitle}>Your Notes</h2>
          <ul className={styles.noteList}>
            {myNotes.map((note) => (
              <li key={note.roomId} className={styles.noteItem}>
                <button
                  onClick={() => router.push(`/collab/${note.roomId}`)}
                  className={styles.noteButton}
                >
                  <strong>{note.title}</strong>
                  <div className={styles.noteDate}>
                    Last edited: {new Date(note.updatedAt).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CollaborativeEditor from "@/components/CollaborativeEditor/CollaborativeEditor";
import styles from "../page.module.css";

export default function CollabRoomPage() {
  const { roomId } = useParams() as { roomId: string };
  const router = useRouter();
  const [userName] = useState(() => `User${Math.floor(Math.random() * 10000)}`);
  const [noteTitle, setNoteTitle] = useState("");

  useEffect(() => {
    async function fetchNoteTitle() {
      try {
        const res = await fetch(`/api/collabNotes/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch note");
        const data = await res.json();
        setNoteTitle(data.note.title);
      } catch (error) {
        console.error("Error fetching note title:", error);
        setNoteTitle("Untitled Note");
      }
    }

    if (roomId) fetchNoteTitle();
  }, [roomId]);

  return (
    <div className={styles.container}>
      <div className={styles.flexHeader}>
        <div>
          <h2 className={styles.subTitle}>Title: {noteTitle}</h2>
          <p className={styles.roomId}>Room ID: {roomId}</p>
        </div>
        <button
          className={styles.leaveButton}
          onClick={() => router.push("/collab")}
        >
          Leave Room
        </button>
      </div>
      <p>Share this room ID to collaborate with others.</p>
      <CollaborativeEditor roomId={roomId} userName={userName} />
    </div>
  );
}

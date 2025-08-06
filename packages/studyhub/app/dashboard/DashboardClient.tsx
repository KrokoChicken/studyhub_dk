"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubjectList from "@/components/SubjectList/SubjectList";
import styles from "./page.module.css"; // Import CSS module

export default function DashboardClient() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      const res = await fetch("/api/subjects/get");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
      setLoading(false);
    }
    fetchSubjects();
  }, []);

  // Function to add a new subject and refresh the list
  async function handleAddSubject(name: string) {
    await fetch("/api/subjects/add", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    });
    // Refresh subjects list after adding
    const res = await fetch("/api/subjects/get");
    if (res.ok) {
      const data = await res.json();
      setSubjects(data);
    }
  }

  if (loading) return <p>Loading subjects...</p>;

  return (
    <div className={styles.dashboardLayout}>
      <SubjectList subjects={subjects} onAddSubject={handleAddSubject} />
      <div className={styles.content}>
        <h1>Welcome to Dashboard</h1>
        <button
          onClick={() => router.push("/collab")}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Go to Collaborative Notes
        </button>
      </div>
    </div>
  );
}

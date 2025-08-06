import { useState, useEffect } from "react";
import { getSubjects, addSubject as addSubjectAPI } from "../api/subjects";

export function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (err) {
        setError("Noget gik galt");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addSubject = async (name: string) => {
    try {
      await addSubjectAPI(name);
      const updated = await getSubjects();
      setSubjects(updated);
    } catch (err) {
      setError("Kunne ikke tilføje fag");
    }
  };

  return { subjects, addSubject, loading, error };
}
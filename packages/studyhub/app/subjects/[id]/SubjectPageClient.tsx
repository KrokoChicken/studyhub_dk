"use client";

import { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import TiptapEditor from "@/components/TiptapEditor/TiptapEditor";
import TopicList from "@/components/TopicList/TopicList";
import styles from "./page.module.css";

type Topic = {
  id: string;
  name: string;
  order?: number;
  note?: string;
};

type Props = {
  subjectId: string;
};

export default function SubjectPageClient({ subjectId }: Props) {
  const [subjectName, setSubjectName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  // Debounced save to limit API calls while typing notes
  const debouncedSave = useRef(
    debounce(async (topicId: string, content: string) => {
      await fetch("/api/topics/updateNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, content }),
      });
    }, 5000)
  ).current;

  useEffect(() => {
    async function fetchTopics() {
      const res = await fetch(`/api/subjects/${subjectId}/topics`);
      const data = await res.json();
      setSubjectName(data.name);

      // Sort topics by order ascending
      const sortedTopics = data.topics.sort(
        (a: Topic, b: Topic) => (a.order ?? 0) - (b.order ?? 0)
      );
      setTopics(sortedTopics);
    }
    fetchTopics();
  }, [subjectId]);

  const handleSelectTopic = async (topic: Topic) => {
    setLoadingTopic(true);
    setSelectedTopic(null);
    const res = await fetch(`/api/topics/${topic.id}`);
    const data = await res.json();
    setSelectedTopic(data);
    setLoadingTopic(false);
  };

  const handleAddTopic = async (name: string) => {
    await fetch("/api/topics/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subjectId }),
    });

    // Refresh list
    const res = await fetch(`/api/subjects/${subjectId}/topics`);
    const data = await res.json();
    const sortedTopics = data.topics.sort(
      (a: Topic, b: Topic) => (a.order ?? 0) - (b.order ?? 0)
    );
    setSubjectName(data.name);
    setTopics(sortedTopics);
  };

  const handleNoteSave = (content: string) => {
    if (!selectedTopic) return;
    debouncedSave(selectedTopic.id, content);
  };

  const handleReorderTopics = async (reorderedTopics: Topic[]) => {
    setTopics(reorderedTopics);

    await fetch("/api/topics/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicOrders: reorderedTopics.map(({ id }, index) => ({
          id: parseInt(id),
          order: index,
        })),
      }),
    });
  };

  return (
    <div className={styles.pageLayout}>
      <TopicList
        subjectName={subjectName}
        topics={topics}
        selectedTopicId={selectedTopic?.id || null}
        onSelectTopic={handleSelectTopic}
        onAddTopic={handleAddTopic}
        onReorderTopics={handleReorderTopics}
      />

      <section className={styles.content}>
        {loadingTopic ? (
          <p>Indlæser emne...</p>
        ) : selectedTopic ? (
          <>
            <h1>{selectedTopic.name}</h1>
            <TiptapEditor
              content={selectedTopic.note || ""}
              onChange={handleNoteSave}
            />
          </>
        ) : (
          <p>Vælg et emne for at se indhold</p>
        )}
      </section>
    </div>
  );
}

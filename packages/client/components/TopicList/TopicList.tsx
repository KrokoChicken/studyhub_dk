/*
"use client";

import React, { useState } from "react";
import styles from "./TopicList.module.css";

type Topic = { id: string; name: string };

type Props = {
  subjectName: string;
  topics: Topic[];
  selectedTopicId: string | null;
  onSelectTopic: (topic: Topic) => void;
  onAddTopic: (name: string) => Promise<void>;
};

export default function TopicList({
  subjectName,
  topics,
  selectedTopicId,
  onSelectTopic,
  onAddTopic,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTopic(newTopic);
    setNewTopic("");
    setShowModal(false);
  };

  return (
    <aside className={styles.sidebar}>
      <h2>{subjectName}</h2>
      <ul className={styles.topicList}>
        {topics.map((topic) => (
          <li
            key={topic.id}
            className={styles.topicItem}
            onClick={() => onSelectTopic(topic)}
            style={{
              backgroundColor:
                selectedTopicId === topic.id ? "#cbd5ff" : undefined,
              cursor: "pointer",
            }}
          >
            {topic.name}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowModal(true)} className={styles.addButton}>
        + Tilføj emne
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Nyt emne</h2>
            <form onSubmit={handleAdd} className={styles.form}>
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Skriv emnenavn"
                required
                className={styles.input}
              />
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button}>
                  Gem
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancel}
                >
                  Annuller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
*/

"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./TopicList.module.css";

type Topic = { id: string; name: string; order?: number };

type Props = {
  subjectName: string;
  topics: Topic[];
  selectedTopicId: string | null;
  onSelectTopic: (topic: Topic) => void;
  onAddTopic: (name: string) => Promise<void>;
  onReorderTopics: (topics: Topic[]) => Promise<void>;
};

function SortableItem({
  id,
  name,
  selected,
  onClick,
}: {
  id: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? `translateY(${transform.y ?? 0}px)` : undefined,
    transition,
    backgroundColor: selected ? "#cbd5ff" : undefined,
    cursor: "pointer",
    userSelect: "none",
    padding: "0.5rem 0.75rem",
    borderRadius: 4,
    marginBottom: 4,
  };

  return (
    <li ref={setNodeRef} style={style}>
      {/* Clickable name area */}
      <span
        style={{ flexGrow: 1, cursor: "pointer" }}
        onClick={() => {
          if (!isDragging) onClick();
        }}
      >
        {name}
      </span>

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          border: "none",
          background: "transparent",
          padding: "0 8px",
          fontSize: "1.2rem",
          lineHeight: 1,
          userSelect: "none",
        }}
        aria-label="Drag handle"
        tabIndex={-1}
      >
        ☰
      </button>
    </li>
  );
}

export default function TopicList({
  subjectName,
  topics,
  selectedTopicId,
  onSelectTopic,
  onAddTopic,
  onReorderTopics,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [localTopics, setLocalTopics] = useState(topics);

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTopic(newTopic);
    setNewTopic("");
    setShowModal(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localTopics.findIndex((t) => t.id === active.id);
      const newIndex = localTopics.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(localTopics, oldIndex, newIndex);
      setLocalTopics(newOrder);
      await onReorderTopics(
        newOrder.map((topic, index) => ({ ...topic, order: index }))
      );
    }
  };

  return (
    <aside className={styles.sidebar}>
      <h2>{subjectName}</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localTopics.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className={styles.topicList}>
            {localTopics.map((topic) => (
              <SortableItem
                key={topic.id}
                id={topic.id}
                name={topic.name}
                selected={selectedTopicId === topic.id}
                onClick={() => onSelectTopic(topic)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button onClick={() => setShowModal(true)} className={styles.addButton}>
        + Tilføj emne
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Nyt emne</h2>
            <form onSubmit={handleAdd} className={styles.form}>
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Skriv emnenavn"
                required
                className={styles.input}
              />
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button}>
                  Gem
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancel}
                >
                  Annuller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}

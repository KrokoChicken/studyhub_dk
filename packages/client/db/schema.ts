import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  customType,
  
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const bytea = customType<{ data: Buffer }>({
  dataType: () => 'bytea',
});

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Subjects
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notes


export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  note: text("note"),
  order: integer('order').default(0).notNull(), // New order column
});


// New table for collaborative notes
export const collabNotes = pgTable('collab_notes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 150 }).notNull(),
  createdByUserId: integer('created_by_user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
  .defaultNow()
  .$onUpdateFn(() => sql`NOW()`)
  .notNull(),
  
  ydocState: bytea('ydoc_state').notNull(),

  collaborators: jsonb('collaborators').default('[]').notNull(),

  roomId: varchar('room_id', { length: 100 }).notNull().unique(),
});


/*
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  isShared: boolean('is_shared').default(false),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
*/
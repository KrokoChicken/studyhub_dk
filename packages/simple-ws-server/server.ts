import "dotenv/config";
import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Load persisted Y.Doc from Postgres
async function loadYDoc(roomId: string) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT ydoc_state FROM collab_notes WHERE room_id = $1 LIMIT 1",
      [roomId]
    );
    const row = res.rows[0];
    if (row?.ydoc_state) {
      console.log(`[${roomId}] 📦 Loaded persisted Y.Doc (${row.ydoc_state.length} bytes)`);
      return row.ydoc_state;
    }
    return null;
  } finally {
    client.release();
  }
}

// Save Y.Doc to Postgres
async function saveYDoc(roomId: string, ydocState: Uint8Array) {
  const client = await pool.connect();
  try {
    await client.query(
      `
      INSERT INTO collab_notes (room_id, ydoc_state, created_by_user_id, title)
      VALUES ($2, $1, 1, 'Untitled')
      ON CONFLICT (room_id) DO UPDATE
      SET ydoc_state = EXCLUDED.ydoc_state,
          updated_at = NOW()
      `,
      [ydocState, roomId]
    );
    console.log(`[${roomId}] 💾 Saved to DB (${ydocState.length} bytes)`);
  } finally {
    client.release();
  }
}

// Start Hocuspocus server
const server = new Server({
  port: 1234,

  async onLoadDocument({ documentName, document }) {
    const persisted = await loadYDoc(documentName);
    if (persisted) {
      Y.applyUpdate(document, persisted);
      console.log(`[${documentName}] ✅ Y.Doc loaded into memory`);
    } else {
      console.log(`[${documentName}] 🆕 New document`);
    }
  },

  async onStoreDocument({ documentName, document }) {
    const state = Y.encodeStateAsUpdate(document);
    await saveYDoc(documentName, state);
    console.log(`[${documentName}] 💾 onStoreDocument: saved`);
  },

  async onConnect({ documentName }) {
    console.log(`🔌 Connected to room: ${documentName}`);
  },
});

server.listen();
console.log("✅ Hocuspocus running at ws://localhost:1234");
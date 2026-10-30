# WebSocket Event Contract

## Overview

StudySync uses Socket.IO for real-time communication between clients and the backend server.
All events are scoped to a specific **room** (identified by a 6-character room code).

## Authentication

Clients authenticate via JWT token in the Socket.IO handshake:

```javascript
const socket = io(URL, {
  auth: { token: 'Bearer <jwt_token>' }
});
```

## Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomCode: string }` | Join a whiteboard session room. Triggers participant registration, sends initial canvas state, and notifies other users. |
| `leave-room` | `{ roomCode: string }` | Leave a room voluntarily. Also triggered on socket disconnect. |
| `object-added` | `{ objectId: string, objectData: object, timestamp: number }` | A new canvas object (shape, text, drawing) was created locally. |
| `object-modified` | `{ objectId: string, objectData: object, timestamp: number }` | An existing canvas object was modified (moved, resized, text changed). Uses **last-write-wins** — the latest timestamp wins on conflict. |
| `object-removed` | `{ objectId: string, timestamp: number }` | A canvas object was deleted. |
| `cursor-move` | `{ x: number, y: number }` | Local cursor position update. Should be throttled to ~30fps by the client. |
| `canvas-save` | `{ canvasJSON: object }` | Full canvas state save request. Sent by auto-save (every 10s) or on significant changes. |
| `request-sync` | `(no payload)` | Request the full canvas state from the server (used after reconnection). |

## Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `user-joined` | `{ userId: string, displayName: string, color: string }` | A new user joined the room. |
| `user-left` | `{ userId: string }` | A user left the room or disconnected. |
| `participants-update` | `{ participants: ParticipantInfo[] }` | Full participant list update. Sent after join/leave events. |
| `remote-object-added` | `{ objectId: string, objectData: object, userId: string, timestamp: number }` | Another user created a new object. |
| `remote-object-modified` | `{ objectId: string, objectData: object, userId: string, timestamp: number }` | Another user modified an object (LWW — apply directly). |
| `remote-object-removed` | `{ objectId: string, userId: string, timestamp: number }` | Another user removed an object. |
| `remote-cursor-move` | `{ x: number, y: number, userId: string, userName: string, color: string }` | Another user's cursor position. |
| `canvas-state` | `{ canvasJSON: object }` | Full canvas state sent on initial join or sync request. |
| `error` | `{ message: string }` | Error notification. |

## ParticipantInfo Type

```typescript
interface ParticipantInfo {
  userId: string;
  displayName: string;
  color: string;    // Hex color assigned per session
  isOnline: boolean;
}
```

## Conflict Resolution

**Strategy: Last-Write-Wins (LWW) per Object**

1. Each canvas object has a unique `objectId` (UUID assigned on creation).
2. Every modification includes a `timestamp` (Date.now()).
3. The server broadcasts changes to all OTHER clients in the room.
4. If two users modify the same object simultaneously, the last event received at each client wins visually.
5. The periodic auto-save captures the final merged state.
6. Object-level granularity means edits to **different** objects never conflict.

## Latency Expectations

| Operation | Expected Latency |
|---|---|
| Object sync (LAN) | < 50ms |
| Object sync (Internet) | 50–200ms |
| Cursor position | 50–150ms |
| Full canvas sync | 100–500ms (depends on canvas size) |
| Auto-save to database | ~100ms (async, non-blocking) |

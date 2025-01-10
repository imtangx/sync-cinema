import { RoomState } from './RoomState.js';
import WebSocket from 'ws';

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> RoomState
    this.userConnections = new Map(); // username -> websocket
  }

  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new RoomState());
    }
    return this.rooms.get(roomId);
  }

  includeUser(username, roomId) {
    const room = this.getRoom(roomId);
    return room.onlineUsers.includes(username);
  }

  addUserToRoom(username, roomId, ws) {
    const room = this.getRoom(roomId);
    room.onlineUsers.push(username);
    this.userConnections.set(username, ws);
    return room;
  }

  removeUserFromRoom(username, roomId) {
    const room = this.getRoom(roomId);
    room.onlineUsers = room.onlineUsers.filter(user => user !== username);
    this.userConnections.delete(username);

    if (room.onlineUsers.length === 0) {
      this.rooms.delete(roomId);
    }
  }

  broadcast(roomId, message) {
    const room = this.getRoom(roomId);
    room.onlineUsers.forEach(username => {
      const ws = this.userConnections.get(username);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}



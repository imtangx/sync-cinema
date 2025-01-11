import { RoomState } from "./RoomState.js";
import { MessageType } from "../constants.js";
import { Message } from "./Message.js";
import WebSocket from "ws";

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> RoomState
    this.userConnections = new Map(); // username -> websocket
    this.homeConnections = new Set(); // homepage -> websocket
  }

  addHomeConnection(ws) {
    this.homeConnections.add(ws);
  }

  removeHomeConnection(ws) {
    this.homeConnections.delete(ws);
  }

  broadcastToHome() {
    const onlineRooms = [];
    this.rooms.forEach((room, roomId) => {
      if (room.onlineUsers.length > 0) {
        onlineRooms.push({
          roomId,
          userCount: room.onlineUsers.length
        });
      }
    });

    this.homeConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        const message = new Message(MessageType.ONLINE_ROOMS_UPDATE, { onlineRooms });
        ws.send(JSON.stringify(message));
      } else {
        this.removeHomeConnection(ws);
      }
    });
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
    this.broadcastToHome();
    return room;
  }

  removeUserFromRoom(username, roomId) {
    const room = this.getRoom(roomId);
    room.onlineUsers = room.onlineUsers.filter((user) => user !== username);
    this.userConnections.delete(username);
    if (room.onlineUsers.length === 0) {
      this.rooms.delete(roomId);
    }

    this.broadcastToHome();
  }

  broadcast(roomId, message) {
    const room = this.getRoom(roomId);
    room.onlineUsers.forEach((username) => {
      const ws = this.userConnections.get(username);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

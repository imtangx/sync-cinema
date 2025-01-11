import express from "express";
import cors from "cors";
import { HttpStatusCode } from "axios";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { MessageType } from "../shared/constants.js";
import { RoomState } from "../shared/models/RoomState.js";
import { RoomManager } from "../shared/models/RoomManager.js";
import { Message } from "../shared/models/Message.js";


const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const roomManager = new RoomManager();
const timers = new Map();

const getKey = (payload) => {
  return String(payload.username + "," + payload.roomId);
};

const getTimer = (payload) => {
  return timers.get(getKey(payload));
};

const setTimer = (payload) => {
  const { username, roomId } = payload;
  const key = getKey(payload);
  const timer = getTimer(payload);
  if (timer) {
    clearTimeout(timer);
  }
  const newTimer = setTimeout(() => {
    //回调 删除用户
    timers.delete(key);
    roomManager.removeUserFromRoom(username, roomId);
    roomManager.broadcast(roomId, new Message(MessageType.USER_LEFT, { username }));
  }, 2000);
  timers.set(key, newTimer);
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  let curUsername = null;
  let curRoomId = null;

  ws.on("message", (message) => {
    const payload = JSON.parse(message);
    const { type, data } = payload;
    switch (type) {
      case MessageType.HOME_JOIN:
        roomManager.addHomeConnection(ws);
        roomManager.broadcastToHome();
        break;
      case MessageType.USER_JOIN:
        handleUserEntered(payload);
        break;
      case MessageType.VIDEO_PAUSE:
      case MessageType.VIDEO_PLAY:
      case MessageType.VIDEO_URL_UPDATE:
        handleVideoStatusChanged(payload);
        break;
      case MessageType.SYSTEM_MESSAGE:
      case MessageType.CHAT_MESSAGE:
        handleMessages(payload);
        break;
    }
  });

  const handleUserEntered = (payload) => {
    const { type, data } = payload;
    const { username, roomId } = data;
    curUsername = username;
    curRoomId = roomId;

    const key = getKey(data);
    const timer = getTimer(data);
    if (timer) {
      clearTimeout(timer);
    }

    // 查看用户是否真的退出
    if (!roomManager.includeUser(username, roomId)) {
      roomManager.addUserToRoom(username, roomId, ws);
      roomManager.broadcast(roomId, new Message(MessageType.USER_JOIN, { username }));
    } else {
      // 对刷新后的窗口重新进行ws连接
      roomManager.userConnections.set(username, ws);
    }

    const room = roomManager.getRoom(roomId);
    // 更新视频状态的时间戳和实际进度
    if (room.videoState.isPlaying) {
      const elapsedTime = (Date.now() - room.videoState.lastUpdated) / 1000;
      room.videoState.currentTime += elapsedTime;
      room.videoState.lastUpdated = Date.now();
    }

    // 给用户发送这个房间的状态
    ws.send(
      JSON.stringify(
        new Message(MessageType.ROOM_STATE, {
          onlineUsers: room.onlineUsers,
          messages: room.messages,
          videoState: room.videoState
        })
      )
    );
  };

  const handleVideoStatusChanged = (payload) => {
    const { type, data } = payload;
    const { username, roomId, videoState } = data;
    const room = roomManager.getRoom(roomId);
    room.videoState = {
      ...room.videoState,
      ...videoState,
      lastUpdated: Date.now()
    };
    roomManager.broadcast(roomId, new Message(type, { username, roomId, videoState }));
  };

  const handleMessages = (payload) => {
    const { type, data } = payload;
    const { roomId } = data;
    const room = roomManager.getRoom(roomId);  // 使用传入的roomId
    room.messages.push(payload);
    roomManager.broadcast(roomId, payload);
  };

  ws.on("close", () => {
    //Home离开
    roomManager.removeHomeConnection(ws);
    //不为null Room离开
    if (curUsername && curRoomId) {
      setTimer({ username: curUsername, roomId: curRoomId });
    }
  });
});

app.use(cors());
app.use(express.json());

app.get("/users", (request, response) => {
  response.send("<h1>Sync Cinema Server</h1>");
});

app.post("/users/check", (request, response) => {
  const { username, roomId } = request.body;
  if (roomManager.includeUser(username, roomId)) {
    return response.status(HttpStatusCode.Conflict).send({});
  }
  return response.status(200).send();
});

// 修改服务器启动方式
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

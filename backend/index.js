import express from "express";
import cors from "cors";
import { HttpStatusCode } from "axios";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
// import User from '../shared/models/User.js'
// import Message from "../shared/models/Message.js";

class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

class User {
  constructor(username, roomId) {
    this.username = username;
    this.roomId = roomId;
  }
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const roomVideoPlayTimes = new Map();
const roomVideoUrls = new Map();

const clients = new Map();
const timers = new Map();
const initialVideoUrl = "https://vjs.zencdn.net/v/oceans.mp4";

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
  clearTimeout(timer);
  const newTimer = setTimeout(() => {
    clients.delete(key);
    timers.delete(key);
    //更新删除后的在线用户列表
    const onlineUsers = [];
    for (const [key, ws] of clients) {
      if (key.split(",")[1] === payload.roomId) {
        onlineUsers.push(key.split(",")[0]);
      }
    }

    const userLeftedMessage = new Message("userLefted", {
      username,
      onlineUsers
    });
    broadcast(userLeftedMessage, roomId);
  }, 2000);
  timers.set(key, newTimer);
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  //发送客户端它的id
  ws.on("message", (message) => {
    const payload = JSON.parse(message);
    const { type, data } = payload;
    switch (type) {
      case "userEntered":
        handleUserEntered(data);
        break;
      case "videoStatusChanged":
        handleVideoStatusChanged(data);
        break;
      case "chatMessage":
        handleChatMessages(data);
        break;
      case "videoUrlChanged":
        handleVideoUrlChanged(data);
        break;
    }
  });

  const handleUserEntered = (payload) => {
    const { username, roomId } = payload;
    const key = getKey(payload);
    const timer = getTimer(payload);
    clearTimeout(timer);

    ws.client = new User(username, roomId);

    if (clients.has(key) === false) {
      const userJoinedMessage = new Message("userJoined", { username });
      broadcast(userJoinedMessage, roomId);
    }

    //有重复键也要设定新的ws窗口
    clients.set(key, ws);

    const getVideoStateMessage = new Message("getVideoState", {
      url: roomVideoUrls.has(roomId) ? roomVideoUrls.get(roomId) : (roomVideoUrls.set(roomId, initialVideoUrl), initialVideoUrl),
      time: roomVideoPlayTimes.has(roomId) ? roomVideoPlayTimes.get(roomId) : (roomVideoPlayTimes.set(roomId, 0), 0)
    });

    ws.send(JSON.stringify(getVideoStateMessage));

    //发送在线用户列表
    const onlineUsers = [];
    for (const [key, ws] of clients) {
      if (key.split(",")[1] === roomId) {
        onlineUsers.push(key.split(",")[0]);
      }
    }

    const showOnlineUsersMessage = new Message("showOnlineUsers", {
      onlineUsers
    });
    broadcast(showOnlineUsersMessage, roomId);
  };

  const handleVideoStatusChanged = (payload) => {
    const { type, username, roomId, time } = payload;
    if (roomVideoPlayTimes.has(roomId)) {
      roomVideoPlayTimes.set(roomId, time);
    }
    switch (type) {
      case "videoPlay":
        const videoPlayMessage = new Message(type, { username, time });
        broadcast(videoPlayMessage, roomId);
        break;
      case "videoPause":
        const videoPauseMessage = new Message(type, { username, time });
        broadcast(videoPauseMessage, roomId);
        break;
    }
  };

  const handleChatMessages = (payload) => {
    const { username, roomId, message } = payload;
    const chatMessage = new Message("chatMessage", { username, message });
    broadcast(chatMessage, roomId);
  };

  const handleVideoUrlChanged = (payload) => {
    const { username, roomId, url } = payload;
    if (roomVideoUrls.has(roomId)) {
      roomVideoUrls.set(roomId, url);
      console.log(roomId, url);
    }
    const videoUrlChangedMessage = new Message("videoUrlChanged", { username, url });
    broadcast(videoUrlChangedMessage, roomId);
  };

  ws.on("close", () => {
    if (ws.client) {
      setTimer(ws.client);
    }
  });
});

const broadcast = (message, roomId) => {
  for (const [key, ws] of clients) {
    if (ws.readyState === WebSocket.OPEN && key.split(",")[1] === roomId) {
      ws.send(JSON.stringify(message));
    }
  }
};

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
  response.send("<h1>User Data</h1>");
});

app.get("/users", (request, response) => {
  // 将 Map 转换成一个数组
  const clientsArray = Array.from(clients, ([key, value]) => key);
  response.json(clientsArray);
});

app.post("/users/check", (request, response) => {
  const key = getKey(request.body);
  if (clients.has(key)) {
    response.status(HttpStatusCode.Conflict).send({});
  }

  return response.status(200).send();
});

// 修改服务器启动方式
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

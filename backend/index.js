const express = require("express");
const cors = require("cors");
const uuid = require("uuid");
const { HttpStatusCode } = require("axios");
const app = express();

// 创建 HTTP 服务器 将 WebSocket 服务器附加到 HTTP 服务器
const WebSocket = require("ws");
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

class User {
  constructor(username, roomId) {
    this.uid = uuid.v4();
    this.username = username;
    this.roomId = roomId;
  }
}

class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

const clients = new Map();
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
      onlineUsers,
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
    const uid = ws.client.uid;

    if (clients.has(key) === false) {
      const sendIdMessage = new Message("sendId", { uid });
      ws.send(JSON.stringify(sendIdMessage));

      const userJoinedMessage = new Message("userJoined", { username });
      broadcast(userJoinedMessage, roomId);
    }

    //有重复键也要设定新的ws窗口
    clients.set(key, ws);

    //发送在线用户列表
    const onlineUsers = [];
    for (const [key, ws] of clients) {
      if (key.split(",")[1] === roomId) {
        console.log(key.split(",")[1], ws.client.roomId);
        onlineUsers.push(key.split(",")[0]);
      }
    }

    const showOnlineUsersMessage = new Message("showOnlineUsers", {
      onlineUsers,
    });
    broadcast(showOnlineUsersMessage, roomId);
  };

  const handleVideoStatusChanged = (payload) => {
    const { type, username, roomId, time } = payload;
    switch (type) {
      case "videoPlay":
        const videoPlayMessage = new Message(type, { time });
        broadcast(videoPlayMessage, roomId);
        break;
      case "videoPause":
        const videoPauseMessage = new Message(type, { time });
        broadcast(videoPauseMessage, roomId);
        break;
    }
  };

  const handleChatMessages = (payload) => {
    const {username, roomId, message} = payload;
    const chatMessage = new Message('chatMessage', {username, message});
    broadcast(chatMessage, roomId);
  }

  const handleVideoUrlChanged = (payload) => {
    const {username, roomId, url} = payload;
    const videoUrlChangedMessage = new Message("videoUrlChanged", {username, url});
    broadcast(videoUrlChangedMessage, roomId);
  }

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

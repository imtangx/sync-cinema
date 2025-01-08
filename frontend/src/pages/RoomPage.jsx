import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import OnlineUsersList from "../components/OnlineUsersList";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";
import { Layout, message } from "antd";
import VideoUrlChanger from "../components/VideoUrlChanger";
// import Message from "../../../../shared/models/Message";

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

const { Header, Content, Footer, Sider } = Layout;

const RoomPage = () => {
  const [socket, setSocket] = useState(null);
  const [curUsers, setCurUsers] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("https://vjs.zencdn.net/v/oceans.mp4");
  const lastTimeRef = useRef(0);

  const { username, roomId } = JSON.parse(localStorage.getItem("payload"));
  useEffect(() => {
    const video = videoRef.current;
    video.muted = true;

    const socket = new WebSocket(import.meta.env.VITE_WS_URL);
    setSocket(socket);
    socket.addEventListener("open", (event) => {
      console.log("opened");
      const userEnteredMessage = new Message("userEntered", {
        username,
        roomId
      });
      socket.send(JSON.stringify(userEnteredMessage));
    });

    socket.addEventListener("message", (event) => {
      const broadMessage = JSON.parse(event.data);
      const now = Date.now();
      const { type, data } = broadMessage;
      switch (type) {
        case "getVideoState":
          setVideoSrc(data.url);
          video.currentTime = data.time;
          break;
        case "chatMessage":
          setMessagesList((prevMessages) => [...prevMessages, broadMessage]);
          break;
        case "userJoined":
          setMessagesList((prevMessages) => [...prevMessages, broadMessage]);
          break;
        case "userLefted":
          setMessagesList((prevMessages) => [...prevMessages, broadMessage]);
          setCurUsers(data.onlineUsers);
          break;
        case "showOnlineUsers":
          setCurUsers(data.onlineUsers);
          break;
        case "videoUrlChanged":
          message.success(`视频源已被${data.username}更新`);
          setVideoSrc(data.url);
          break;
        case "videoPlay":
          if (video.paused && now - lastTimeRef.current >= 200) {
            lastTimeRef.current = now;
            video.play();
            video.currentTime = data.time;
            message.success(`视频进度被${data.username}更新`);
          }
          break;
        case "videoPause":
          if (!video.paused && now - lastTimeRef.current >= 200) {
            // lastTimeRef.current = now;
            video.pause();
          }
          break;
      }
    });

    return () => {
      /**
       * TODO
       * 清理监听器
       * 关闭socket
       */
    };
  }, []);

  const handlePlay = () => {
    sendVideoStatus("videoPlay");
  };

  const handlePause = () => {
    if (document.visibilityState !== "hidden") {
      sendVideoStatus("videoPause");
    }
  };

  const sendVideoStatus = (type) => {
    console.log(type);
    if (socket) {
      const time = videoRef.current.currentTime;
      const message = new Message("videoStatusChanged", {
        type,
        username,
        roomId,
        time
      });
      console.log(message);
      socket.send(JSON.stringify(message));
    }
  };

  const handleVideoUrlChanged = (url) => {
    setVideoSrc(url);
    const message = new Message("videoUrlChanged", {
      username,
      roomId,
      url
    });
    socket.send(JSON.stringify(message));
  };

  const sendChatMessage = (message) => {
    const chatMessage = new Message("chatMessage", {
      username,
      roomId,
      message
    });
    socket.send(JSON.stringify(chatMessage));
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header style={{ background: "skyblue", textAlign: "center", height: "64px" }}>Room {roomId}</Header>
      <Layout>
        <Content>
          <VideoPlayer videoRef={videoRef} videoSrc={videoSrc} onPlay={handlePlay} onPause={handlePause} />
        </Content>
        <Sider width="22.8%">
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgb(234, 239, 241)" }}>
            <div style={{ maxHeight: "120px", overflow: "auto" }}>
              <OnlineUsersList users={curUsers} />
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <ChatBox messages={messagesList} handleSend={sendChatMessage} />
            </div>
          </div>
        </Sider>
      </Layout>
      <Footer style={{ background: "skyblue", height: "64px" }}>
        <VideoUrlChanger handleVideoUrlChanged={handleVideoUrlChanged} />
      </Footer>
    </Layout>
  );
};

export default RoomPage;

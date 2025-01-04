import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import testVideoSrc from "../../assets/video1.mp4";
import OnlineUsersList from "../../components/OnlineUsersList";
import VideoPlayer from "../../components/VideoPlayer";
import ChatBox from "../../components/ChatBox";
import { Layout, message } from "antd";
import "./index.css";
import VideoUrlChanger from "../../components/VideoUrlChanger";
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
  const [videoSrc, setVideoSrc] = useState(testVideoSrc);

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
      const message = JSON.parse(event.data);
      const { type, data } = message;
      switch (type) {
        case "chatMessage":
          setMessagesList((prevMessages) => [...prevMessages, message]);
          break;
        case "userJoined":
          setMessagesList((prevMessages) => [...prevMessages, message]);
          break;
        case "userLefted":
          setMessagesList((prevMessages) => [...prevMessages, message]);
          setCurUsers(data.onlineUsers);
          break;
        case "showOnlineUsers":
          setCurUsers(data.onlineUsers);
          break;
        case "videoUrlChanged":
          message.success("视频已更新");
          setVideoSrc(data.url);
          break;
        case "videoPlay":
          video.play();
          video.currentTime = data.time;
          break;
        case "videoPause":
          video.pause();
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
    sendVideoStatus("videoPause");
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

  const handldVideoUrlChanged = (url) => {
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
        <VideoUrlChanger handldVideoUrlChanged={handldVideoUrlChanged} />
      </Footer>
    </Layout>
  );
};

export default RoomPage;

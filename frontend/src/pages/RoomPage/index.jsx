import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import RoomHeader from "../../components/RoomHeader";
import testVideoSrc from "../../assets/video1.mp4";
import OnlineUsersList from "../../components/OnlineUsersList";
import VideoPlayer from "../../components/VideoPlayer";
import ChatBox from "../../components/ChatBox";
import { Layout, message } from "antd";
import "./index.css";
import VideoUrlChanger from "../../components/VideoUrlChanger";
import Message from "../../../../shared/models/Message";

const { Header, Content, Footer, Sider } = Layout;

const RoomPage = () => {
  const [socket, setSocket] = useState(null);
  const [curUsers, setCurUsers] = useState([]);
  const [broadMessages, setBroadMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
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
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case "chatMessage":
          console.log(`用户${data.username}说:${data.message}`);
          setChatMessages((prevMessages) => [...prevMessages, data]);
          break;
        case "userJoined":
          console.log(`用户${data.username}加入了房间`);
          setBroadMessages((prevMessages) => [...prevMessages, `用户${data.username}加入了房间`]);
          break;
        case "userLefted":
          console.log(`用户${data.username}离开了房间`);
          setBroadMessages((prevMessages) => [...prevMessages, `用户${data.username}离开了房间`]);
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
              <ChatBox messages={chatMessages} handleSend={sendChatMessage} />
            </div>
          </div>
        </Sider>
      </Layout>
      <Footer style={{ background: "skyblue", height: "64px" }}>
        <VideoUrlChanger onChange={handldVideoUrlChanged} />
      </Footer>
    </Layout>
  );
};

export default RoomPage;

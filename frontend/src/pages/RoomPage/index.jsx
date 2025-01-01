import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import RoomHeader from "../../components/RoomHeader";
import testVideoSrc from "../../assets/video1.mp4";
import OnlineUsersList from "../../components/OnlineUsersList";
import VideoPlayer from "../../components/VideoPlayer";
import ChatBox from "../../components/ChatBox";
import { Flex, List, Avatar, Row, Col, Layout, Menu, Button } from "antd";
import "./index.css";
import VideoUrlChanger from "../../components/VideoUrlChanger";

const { Header, Content, Footer, Sider } = Layout;

class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

const RoomPage = () => {
  const [socket, setSocket] = useState(null);
  const [curUsers, setCurUsers] = useState([]);
  const [broadMessages, setBroadMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const videoRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState(testVideoSrc);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // 当开始拖动进度条时
      video.addEventListener("seeking", () => {
        setIsSeeking(true); // 标识正在拖动
        if (video.paused) {
          setIsPlaying(false); // 如果视频是暂停的，避免在拖动过程中恢复播放
        }
      });

      // 当拖动完成时
      video.addEventListener("seeked", () => {
        setIsSeeking(false); // 标识拖动已完成
        if (isPlaying) {
          video
            .play()
            .catch((err) => console.error("Error playing video:", err)); // 如果之前是播放状态，恢复播放
        }
      });

      // 监听 play 事件
      video.addEventListener("play", () => {
        setIsPlaying(true); // 设置播放状态
      });

      // 监听 pause 事件
      video.addEventListener("pause", () => {
        setIsPlaying(false); // 设置暂停状态
      });

      return () => {
        // 清理事件监听器
        video.removeEventListener("seeking", () => {});
        video.removeEventListener("seeked", () => {});
        video.removeEventListener("play", () => {});
        video.removeEventListener("pause", () => {});
      };
    }
  }, [videoRef.current]);

  const { username, roomId } = JSON.parse(localStorage.getItem("payload"));
  useEffect(() => {
    const video = videoRef.current;
    video.muted = true;

    const socket = new WebSocket(`ws://localhost:3001`);
    setSocket(socket);
    socket.addEventListener("open", (event) => {
      console.log("opened");
      const userEnteredMessage = new Message("userEntered", {
        username,
        roomId,
      });
      socket.send(JSON.stringify(userEnteredMessage));
    });

    socket.addEventListener("message", (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case "sendId":
          localStorage.setItem(
            "payload",
            JSON.stringify({ uid: data.uid, username, roomId })
          );
          console.log(`您的用户id为${data.uid}`);
          break;
        case "chatMessage":
          console.log(`用户${data.username}说:${data.message}`);
          setChatMessages((prevMessages) => [...prevMessages, data]);
          break;
        case "userJoined":
          console.log(`用户${data.username}加入了房间`);
          setBroadMessages((prevMessages) => [
            ...prevMessages,
            `用户${data.username}加入了房间`,
          ]);
          break;
        case "userLefted":
          console.log(`用户${data.username}离开了房间`);
          setBroadMessages((prevMessages) => [
            ...prevMessages,
            `用户${data.username}离开了房间`,
          ]);
          setCurUsers(data.onlineUsers);
          break;
        case "showOnlineUsers":
          setCurUsers(data.onlineUsers);
          break;
        case "videoPlay":
          if (isSeeking === false) {
            video.play();
            video.currentTime = data.time;
          }
          break;
        case "videoPause":
          if (isSeeking === false) {
            video.pause();
            //暂停不要更新时间
            // video.currentTime = data.time;
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
    sendVideoStatus("videoPause");
  };

  const sendVideoStatus = (type) => {
    console.log(type);
    const time = videoRef.current.currentTime;
    const message = new Message("videoStatusChanged", {
      type,
      username,
      roomId,
      time,
    });
    socket.send(JSON.stringify(message));
  };

  const sendChatMessage = (message) => {
    const chatMessage = new Message("chatMessage", {
      username,
      roomId,
      message,
    });
    socket.send(JSON.stringify(chatMessage));
  };

  return (
    <Layout>
      <Header style={{ background: "#8ECAE6", textAlign: "center" }}>Room {roomId}</Header>
      <Layout>
        <Content>
          <VideoPlayer
            videoRef={videoRef}
            videoSrc={videoSrc}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        </Content>
        <Sider
          width="25%"
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#F8F9FA", // 浅灰色背景
          }}
        >
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            <OnlineUsersList users={curUsers} />
          </div>
          <div style={{ flex: 1, height: "calc(100vh - 200px)" }}>
            <ChatBox messages={chatMessages} handleSend={sendChatMessage} />
          </div>
        </Sider>
      </Layout>
      <Footer>
        <VideoUrlChanger setVideoUrl={setVideoSrc}/>
      </Footer>
    </Layout>
  );
};

export default RoomPage;

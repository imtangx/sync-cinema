import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import OnlineUsersList from "../components/OnlineUsersList";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";
import { Layout, message } from "antd";
import VideoUrlChanger from "../components/VideoUrlChanger";
import { MessageType } from "../../../shared/constants.js";
import { useRoomStore } from "../stores/roomStore.js";
import { Message } from "../../../shared/models/Message.js";

const { Header, Content, Footer, Sider } = Layout;

const RoomPage = () => {
  const store = useRoomStore();
  const [socket, setSocket] = useState(null);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);

  const { username, roomId } = JSON.parse(localStorage.getItem("payload"));
  useEffect(() => {
    const video = videoRef.current;
    video.muted = true;

    const socket = new WebSocket(import.meta.env.VITE_WS_URL);
    setSocket(socket);
    socket.addEventListener("open", (event) => {
      console.log("opened");
      const userJoinMessage = new Message(MessageType.USER_JOIN, {
        username,
        roomId
      });
      socket.send(JSON.stringify(userJoinMessage));
    });

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      const { type, data } = payload;
      const now = Date.now();
      switch (type) {
        case MessageType.USER_JOIN:
          //更新用户列表
          store.addUserToRoom(data.username);
          store.addMessage(new Message(type, data));
          break;
        case MessageType.USER_LEFT:
          //更新用户列表
          store.removeUserFromRoom(data.username);
          store.addMessage(new Message(type, data));
          break;
        case MessageType.ROOM_STATE:
          // 获取房间状态
          // 计算实际播放进度
          const currentTime = data.videoState.isPlaying ? data.videoState.currentTime + (Date.now() - data.videoState.lastUpdated) / 1000 : data.videoState.currentTime;
          // 更新状态
          store.setRoomState(data.onlineUsers, data.messages, {
            ...data.videoState,
            currentTime
          });

          // 同步视频状态
          video.currentTime = currentTime;
          if (data.videoState.isPlaying) {
            video.play().catch((error) => {
              console.error("播放失败:", error);
            });
          } else {
            video.pause();
          }
          break;
        case MessageType.VIDEO_PLAY:
          //节流
          console.log(data);
          if (video.paused && now - lastTimeRef.current >= 200) {
            store.setVideoState(data.videoState);
            lastTimeRef.current = now;
            video.currentTime = data.videoState.currentTime;
            video.play().catch((error) => {
              console.error("播放失败:", error);
            });
          }
          message.success(`视频进度被${data.username}更改`);
          break;
        case MessageType.VIDEO_PAUSE:
          if (!video.paused && now - lastTimeRef.current >= 200) {
            store.setVideoState(data.videoState);
            video.pause();
          }
          break;
        case MessageType.VIDEO_URL_UPDATE:
          //更新视频地址
          store.setVideoState(data.videoState);
          message.success(`视频源被${data.username}更新`);
          break;
        case MessageType.SYSTEM_MESSAGE:
        case MessageType.CHAT_MESSAGE:
          //新增信息
          store.addMessage(payload);
          break;
      }
    });

    return () => {
      /*
      TODO
      清理监听器
      关闭socket
      */
    };
  }, []);

  const handlePlay = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const newVideoState = {
        ...store.videoState,
        isPlaying: true,
        currentTime: videoRef.current.currentTime,
        lastUpdated: Date.now() // 添加时间戳
      };
      store.setVideoState(newVideoState);
      socket.send(
        JSON.stringify(
          new Message(MessageType.VIDEO_PLAY, {
            username,
            roomId,
            videoState: newVideoState
          })
        )
      );
    }
  };

  const handlePause = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      //窗口隐藏/切屏 不自动暂停
      if (document.visibilityState !== "hidden") {
        const newVideoState = {
          ...store.videoState,
          isPlaying: false,
          currentTime: videoRef.current.currentTime,
          lastUpdated: Date.now() // 添加时间戳
        };
        store.setVideoState(newVideoState);
        socket.send(
          JSON.stringify(
            new Message(MessageType.VIDEO_PAUSE, {
              username,
              roomId,
              videoState: newVideoState
            })
          )
        );
      }
    }
  };

  const handleVideoUrlChanged = (url) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const newVideoState = {
        ...store.videoState,
        url,
        currentTime: 0, // URL改变时重置播放进度
        isPlaying: true
      };
      store.setVideoState(newVideoState);
      socket.send(
        JSON.stringify(
          new Message(MessageType.VIDEO_URL_UPDATE, {
            username,
            roomId,
            videoState: newVideoState
          })
        )
      );
    }
  };
  const sendChatMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(new Message(MessageType.CHAT_MESSAGE, { username, roomId, message })));
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          borderBottom: "1px solid #e5e5e5",
          textAlign: "center",
          height: "64px",
          alignItems: "center",
          justifyContent: "center"
        }}>
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 500,
            color: "#1d1d1f"
          }}>
          Room {roomId}
        </h1>
      </Header>
      <Layout>
        <Content style={{ background: "rgba(255,255,255, 0.8)", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <VideoPlayer videoRef={videoRef} videoSrc={store.videoState.url} onPlay={handlePlay} onPause={handlePause} />
        </Content>
        <Sider width="20%">
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgb(234, 239, 241)" }}>
            <div style={{ maxHeight: "120px", overflow: "auto" }}>
              <OnlineUsersList users={store.onlineUsers} />
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <ChatBox messages={store.messages} handleSend={sendChatMessage} />
            </div>
          </div>
        </Sider>
      </Layout>
      <Footer
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          borderTop: "1px solid #e5e5e5",
          textAlign: "center",
          height: "64px",
          alignItems: "center",
          justifyContent: "center",
          color: "#86868b"
        }}>
        <VideoUrlChanger handleVideoUrlChanged={handleVideoUrlChanged} />
      </Footer>
    </Layout>
  );
};

export default RoomPage;

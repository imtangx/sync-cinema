import React, { useEffect, useState } from "react";
import EnterRoomCard from "../components/EnterRoomCard";
import OnlineRoomsList from "../components/OnlineRoomsList";
import { MessageType } from "../../../shared/constants.js";
import { Message } from "../../../shared/models/Message.js";
import { Layout } from "antd";
const { Header, Content, Sider, Footer } = Layout;

const HomePage = () => {
  const [onlineRooms, setOnlineRooms] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WS_URL);
    socket.addEventListener("open", () => {
      console.log("opened HomePage");
      const message = new Message(MessageType.HOME_JOIN, {});
      socket.send(JSON.stringify(message));
    });

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      const { type, data } = payload;
      switch (type) {
        case MessageType.ONLINE_ROOMS_UPDATE:
          setOnlineRooms(data.onlineRooms);
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
          Sync Cinema
        </h1>
      </Header>
      <Layout>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#ffffff",
            padding: "40px 0"
          }}>
          <EnterRoomCard />
        </Content>
        <Sider
          style={{
            background: "#f5f5f7",
            height: "100%",
            padding: "12px",
            borderLeft: "1px solid #e5e5e5"
          }}
          width="20%">
          <OnlineRoomsList onlineRooms={onlineRooms} />
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
        Sync Cinema © 2024
      </Footer>
    </Layout>
  );
};

export default HomePage;

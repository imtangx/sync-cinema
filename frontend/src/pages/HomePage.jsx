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
    socket.addEventListener("open", (event) => {
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
      <Header style={{ background: "skyblue", textAlign: "center", height: "64px" }}>header</Header>
      <Layout>
        <Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <EnterRoomCard />
        </Content>
        <Sider style={{ background: "white", height: "100%" }} width={400}>
          <OnlineRoomsList onlineRooms={onlineRooms} />
        </Sider>
      </Layout>
      <Footer style={{ background: "skyblue", textAlign: "center", height: "64px" }}>footer</Footer>
    </Layout>
  );
};

export default HomePage;

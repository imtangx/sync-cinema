// src/components/ChatBox.js
import React, { useState, useEffect, useRef } from "react";
import { Input, Button, List, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { MessageType } from "../../../shared/constants.js";

// 聊天气泡组件
const ChatBubble = ({ msg, isSelf }) => {
  console.log(msg);
  return (
    <div style={{ display: "flex", justifyContent: isSelf ? "flex-end" : "flex-start", padding: "4px 8px" }}>
      <div style={{ maxWidth: "70%" }}>
        {/* 用户名 */}
        <div style={{ fontSize: "12px", color: "#8C8C8C", marginBottom: "4px", textAlign: isSelf ? "right" : "left" }}>{msg.username}</div>
        {/* 气泡 */}
        <div
          style={{
            background: isSelf ? "#219EBC" : "#F5F5F5",
            color: isSelf ? "#FFFFFF" : "#333333",
            padding: "8px 12px",
            borderRadius: "12px",
            position: "relative",
            wordBreak: "break-word",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            borderTopRightRadius: isSelf ? "4px" : "12px",
            borderTopLeftRadius: isSelf ? "12px" : "4px"
          }}>
          {msg.message}
        </div>
      </div>
    </div>
  );
};

// 系统通知组件
const SystemMessage = ({ message }) => {
  const state = message.type === MessageType.USER_JOIN ? "加入" : "离开";
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
      <div
        style={{
          background: "#F5F5F5",
          color: "#8C8C8C",
          fontSize: "12px",
          padding: "4px 12px",
          borderRadius: "100px",
          maxWidth: "80%"
        }}>
        {`${message.data.username}${state}了房间`}
      </div>
    </div>
  );
};

const ChatBox = ({ messages, handleSend }) => {
  const [messageInput, setMessageInput] = useState("");
  const listRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("payload")).username;

  // 确保聊天框显示最新消息
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) {
      message.warning("消息不能为空");
      return;
    }
    handleSend(messageInput);
    setMessageInput("");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      {/* 消息列表区域 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px", marginBottom: "10px" }} ref={listRef}>
        <List
          dataSource={messages}
          renderItem={(msg) => {
            // 判断是否为系统消息
            if (msg.type === MessageType.USER_JOIN || msg.type === MessageType.USER_LEFT) {
              return <SystemMessage message={msg} />;
            }
            // 普通聊天消息
            return <ChatBubble msg={msg.data} isSelf={msg.data.username === currentUser} />;
          }}
        />
      </div>

      {/* 输入区域 */}
      <div style={{ padding: "10px", borderTop: "1px solid #E9ECEF", backgroundColor: "#ffffff" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onPressEnter={sendMessage} placeholder="输入消息..." style={{ borderColor: "#8ECAE6" }} />
          <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} style={{ backgroundColor: "#219EBC", borderColor: "#219EBC" }}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

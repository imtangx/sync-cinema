// src/components/ChatBox.js
import React, { useState, useEffect, useRef } from "react";
import { Input, Button, List, message } from "antd";
import { SendOutlined } from "@ant-design/icons";

const ChatBox = ({ messages, handleSend }) => {
  const [messageInput, setMessageInput] = useState("");
  const listRef = useRef(null);

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
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* 消息列表区域 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
          height: 0,
          background: '#ffffff' // 纯白背景
        }}
        ref={listRef}
      >
        <List
          dataSource={messages}
          renderItem={(msg, index) => (
            <List.Item 
              key={index} 
              style={{ 
                padding: "8px 0",
                background: msg.username === JSON.parse(localStorage.getItem("payload")).username 
                  ? '#E9F5FF'  // 自己发送的消息背景色
                  : '#ffffff'  // 他人发送的消息背景色
              }}
            >
              <List.Item.Meta
                title={<span style={{ color: '#219EBC' }}>{msg.username}</span>}
                description={
                  <div
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                      maxWidth: "100%",
                      color: '#495057'  // 消息文本颜色
                    }}
                  >
                    {msg.message}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* 输入区域 */}
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #E9ECEF",
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            placeholder="输入消息..."
            maxLength={10}
            style={{ 
              borderColor: '#8ECAE6',
              '&:focus': {
                borderColor: '#219EBC'
              }
            }}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={sendMessage}
            style={{ 
              backgroundColor: '#219EBC',
              borderColor: '#219EBC'
            }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/users";
import { Button, Input } from "antd";
import "../styles/EnterRoomCard.css";

const EnterRoomCard = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    console.log("handleSubmit");
    event.preventDefault();
    if (roomId === "") {
      alert("请输入房间 ID");
      return;
    }
    if (username === "") {
      alert("请输入用户名");
      return;
    }

    userService
      .checkUser({ username, roomId })
      .then((res) => {
        console.log("用户创建成功");
        localStorage.setItem("payload", JSON.stringify({ username, roomId }));
        navigate(`/room/${roomId}`);
      })
      .catch((error) => {
        console.error("用户创建失败", error);
        alert(`房间${roomId}已经存在用户${username}，请换个名字试试`);
      });
  };

  return (
    <div className="EnterRoomCard">
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="房间 ID"
        />
        <br />
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="用户名"
        />
        <br />
        <Button type="primary" htmlType="submit">
          加入房间
        </Button>
      </form>
    </div>
  );
};

export default EnterRoomCard;

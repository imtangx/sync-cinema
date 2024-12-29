import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/users";

const EnterRoomCard = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (roomId === "") {
      alert("请输入房间 ID");
      return;
    }
    if (username === "") {
      alert("请输入用户名");
      return;
    }

    userService.checkUser({ username, roomId }).then((res) => {
      console.log("用户创建成功");
      localStorage.setItem("payload", JSON.stringify({ username, roomId }));
      navigate(`/room/${roomId}`);
    }).catch((error) => {
      console.error("用户创建失败", error);
      alert(`房间${roomId}已经存在用户${username}，请换个名字试试`);
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={roomId}
          onChange={() => setRoomId(event.target.value)}
          placeholder="房间 ID"
        />
        <br />
        <input
          type="text"
          value={username}
          onChange={() => setUsername(event.target.value)}
          placeholder="用户名"
        />
        <br />
        <button type="submit">加入房间</button>
      </form>
    </>
  );
};

export default EnterRoomCard;

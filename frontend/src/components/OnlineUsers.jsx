import React from "react";
import "../styles/OnlineUsers.css";

const OnlineUsers = ({ users }) => {
  return (
    <div className="OnlineUsers">
      <p>在线用户：</p>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
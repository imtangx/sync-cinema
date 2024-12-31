import React from "react";

const RoomHeader = ({id, broadMessages}) => {
  return (
    <div>
      <h1>Room {id}</h1>
      <ul>
        {broadMessages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}; 

export default RoomHeader;
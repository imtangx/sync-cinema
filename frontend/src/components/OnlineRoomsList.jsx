import React from "react";
import { List, Card } from "antd";
import { UserOutlined } from "@ant-design/icons";

const OnlineRoomsList = ({ onlineRooms }) => {
  return (
    <List
      header={<div style={{ fontWeight: "bold", padding: "0 16px" }}>在线房间</div>}
      dataSource={onlineRooms}
      renderItem={(room) => (
        <List.Item key={room.roomId}>
          <Card hoverable style={{ width: "100%", margin: "0 16px" }}>
            <Card.Meta
              title={`房间 ${room.roomId}`}
              description={
                <span>
                  <UserOutlined /> {room.userCount} 人在线
                </span>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );
};

export default OnlineRoomsList;

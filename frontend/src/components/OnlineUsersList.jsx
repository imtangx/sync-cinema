import React from "react";
import { List, Avatar } from "antd";

const OnlineUsersList = ({ users }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={users}
      renderItem={(user, index) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar
                src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
              />
            }
            title={user}
          />
        </List.Item>
      )}
    />
  );
};

export default OnlineUsersList;

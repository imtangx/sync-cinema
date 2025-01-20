import React, { useState } from "react";
import { Input, Button } from "antd";

const VideoUrlChanger = ({ handleVideoUrlChanged }) => {
  const [inputUrl, setInputUrl] = useState("");
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Input placeholder="请输入视频 URL" onChange={(e) => setInputUrl(e.target.value)} />
      <Button type="primary" onClick={() => handleVideoUrlChanged(inputUrl)} style={{ background: "#219EBC", marginLeft: "8px" }}>
        提交
      </Button>
    </div>
  );
};

export default VideoUrlChanger;

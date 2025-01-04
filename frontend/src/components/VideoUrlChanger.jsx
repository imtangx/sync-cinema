import React, { useState } from "react";
import { Input, Button, Flex } from "antd";

const VideoUrlChanger = ({ handleVideoUrlChanged }) => {
  const [inputUrl, setInputUrl] = useState("");
  return (
    <Flex>
      <Input placeholder="请输入视频 URL" onChange={(e) => setInputUrl(e.target.value)} />
      <Button type="primary" onClick={() => handleVideoUrlChanged(inputUrl)} style={{marginLeft: "8px"}}>提交</Button>
    </Flex>
  );
};

export default VideoUrlChanger;

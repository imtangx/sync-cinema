import React, { useState } from "react";
import { Input, Button, Flex } from "antd";

const VideoUrlChanger = ({ setVideoUrl }) => {
  const [inputUrl, setInputUrl] = useState("");
  return (
    <Flex>
      <Input placeholder="请输入视频 URL" onChange={(e) => setInputUrl(e.target.value)} />
      <Button type="primary" onClick={() => setVideoUrl(inputUrl)}/>
    </Flex>
  );
};

export default VideoUrlChanger;
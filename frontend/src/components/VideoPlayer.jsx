import React from "react";

const VideoPlayer = ({ videoRef, videoSrc, onPlay, onPause }) => {
  return (
    <video
      ref={videoRef}
      width={"100%"}
      controls
      onPlay={onPlay}
      onPause={onPause}
    >
      <source src={videoSrc} type="video/mp4" />
      您的浏览器不支持视频标签
    </video>
  );
};

export default VideoPlayer;

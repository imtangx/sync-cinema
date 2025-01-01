import React, { useEffect } from "react";

const VideoPlayer = ({ videoRef, videoSrc, onPlay, onPause }) => {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // 重新加载视频
      videoRef.current.play().catch((err) => {
        console.log("Video autoplay failed:", err);
      });
    }
  }, [videoSrc]); // 依赖于 videoSrc
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

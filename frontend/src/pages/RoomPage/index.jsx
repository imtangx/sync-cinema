import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import videoSrc from "../../assets/video2.mp4";
import OnlineUsers from "../../components/OnlineUsers";
import userService from "../../services/users";
import "./index.css";
import { use } from "react";
import users from "../../services/users";

class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

const RoomPage = () => {
  const [socket, setSocket] = useState(null);
  const id = useParams().id;
  const [curUsers, setCurUsers] = useState([]);
  const [broadmessage, setBroadmessage] = useState("");
  const videoRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // 当开始拖动进度条时
      video.addEventListener('seeking', () => {
        setIsSeeking(true);  // 标识正在拖动
        if (video.paused) {
          setIsPlaying(false);  // 如果视频是暂停的，避免在拖动过程中恢复播放
        }
      });

      // 当拖动完成时
      video.addEventListener('seeked', () => {
        setIsSeeking(false);  // 标识拖动已完成
        if (isPlaying) {
          video.play().catch((err) => console.error('Error playing video:', err));  // 如果之前是播放状态，恢复播放
        }
      });

      // 监听 play 事件
      video.addEventListener('play', () => {
        setIsPlaying(true);  // 设置播放状态
      });

      // 监听 pause 事件
      video.addEventListener('pause', () => {
        setIsPlaying(false);  // 设置暂停状态
      });

      return () => {
        // 清理事件监听器
        video.removeEventListener('seeking', () => {});
        video.removeEventListener('seeked', () => {});
        video.removeEventListener('play', () => {});
        video.removeEventListener('pause', () => {});
      };
    }
  }, [videoRef.current]);

  const { username, roomId } = JSON.parse(localStorage.getItem("payload"));
  useEffect(() => {
    const video = videoRef.current;
    video.muted = true;

    const socket = new WebSocket(`ws://localhost:3001`);
    setSocket(socket);
    socket.addEventListener("open", (event) => {
      console.log("opened");
      const userEnteredMessage = new Message("userEntered", {
        username,
        roomId,
      });
      socket.send(JSON.stringify(userEnteredMessage));
    });

    socket.addEventListener("message", (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case "sendId":
          localStorage.setItem(
            "payload",
            JSON.stringify({ uid: data.uid, username, roomId })
          );
          console.log(`您的用户id为${data.uid}`);
          break;
        case "userJoined":
          console.log(`用户${data.username}加入了房间`);
          setBroadmessage(`用户${data.username}加入了房间`);
          break;
        case "userLefted":
          console.log(`用户${data.username}离开了房间`);
          setBroadmessage(`用户${data.username}离开了房间`);
          setCurUsers(data.onlineUsers);
          break;
        case "removeUser":
          setCurUsers(
            curUsers.filter((user) => user.username !== data.username)
          );
          break;
        case "showOnlineUsers":
          setCurUsers(data.onlineUsers);
          break;
        case "videoPlay":
          if (isSeeking === false) {
            video.play();
            video.currentTime = data.time;
          }
          break;
        case "videoPause":
          if (isSeeking === false) {
            video.pause();
            //暂停不要更新时间
            // video.currentTime = data.time;
          }
          break;
      }
    });

    return () => {
      /**
       * TODO
       * 清理监听器
       * 关闭socket
       */
    };
  }, []);

  const handlePlay = () => {
    sendVideoStatus("videoPlay");
  };

  const handlePause = () => {
    sendVideoStatus("videoPause");
  };

  const sendVideoStatus = (type) => {
    console.log(type);
    const time = videoRef.current.currentTime;
    const message = new Message("videoStatusChanged", {
      type,
      username,
      roomId,
      time,
    });
    socket.send(JSON.stringify(message));
  };

  return (
    <>
      <h1>Room {id}</h1>
      <p>{broadmessage}</p>
      <div className="video-container">
        <video
          ref={videoRef}
          height="400"
          controls
          onPlay={handlePlay}
          onPause={handlePause}
        >
          <source src={videoSrc} type="video/mp4" />
          您的浏览器不支持视频标签
        </video>
        <OnlineUsers users={curUsers} />
      </div>
    </>
  );
};

export default RoomPage;

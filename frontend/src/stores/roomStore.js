import { create } from "zustand";
import { RoomState } from "../../../shared/models/RoomState.js";

export const useRoomStore = create((set, get) => ({
  roomId: null,
  username: null,
  onlineUsers: [],
  messages: [],
  videoState: {
    url: "https://vjs.zencdn.net/v/oceans.mp4",
    currentTime: 0,
    isPlaying: true,
    lastUpdated: Date.now()
  },
  /*
  ...new RoomState(),
  */

  setUserInfo: (username, roomId) => set({ username, roomId }),
  addUserToRoom: (username) => set((state) => ({ onlineUsers: [...state.onlineUsers, username] })),
  removeUserFromRoom: (username) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((user) => user !== username)
    })),
  setRoomState: (onlineUsers, messages, videoState) => set({ onlineUsers, messages, videoState }),
  setVideoState: (newVideoState) =>
    set((state) => ({
      videoState: { ...state.videoState, ...newVideoState }
    })),
  addMessage: (newMessage) => set((state) => ({ messages: [...state.messages, newMessage] }))
}));

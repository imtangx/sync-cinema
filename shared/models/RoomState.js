export class RoomState {
  constructor() {
    this.onlineUsers = [];
    this.messages = [];
    this.videoState = {
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
      currentTime: 0,
      isPlaying: true,
      lastUpdated: Date.now(),
    };
  }
}
export type LogEntry = {
  level: string;
  timestamp: string;
  message: string;
};

export type ClientInfo = {
  ipAddr: string;
  viewportWidth: number;
  viewportHeight: number;
  deviceType: "ios-phone"|"ios-tablet"|"android-phone"|"android-tablet"|"other";
};



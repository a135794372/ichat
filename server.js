const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise"); // 使用 mysql2/promise 來處理資料庫操作

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // 允許的前端來源
    methods: ["GET", "POST"],
  },
});

// 建立資料庫連線池
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "mysql123", // 替換為你的資料庫密碼
  database: "iChat", // 替換為你的資料庫名稱
});

// 當用戶連接時
io.on("connection", (socket) => {
  console.log("使用者已連線");

  // 接收訊息並儲存到資料庫
  socket.on("sendMessage", async (message) => {
    console.log("收到訊息:", message);

    try {
      // 儲存訊息到資料庫
      await db.execute(
        "INSERT INTO messages (group_id, user_id, content) VALUES (?, ?, ?)",
        [message.groupId, message.userId, message.content]
      );

      // 廣播訊息給所有連接的用戶
      io.emit("receiveMessage", message);
    } catch (error) {
      console.error("儲存訊息失敗:", error);
    }
  });

  // 當用戶斷開連接時
  socket.on("disconnect", () => {
    console.log("使用者已斷線");
  });
});

// 啟動伺服器
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket 伺服器運行於 http://localhost:${PORT}`);
});
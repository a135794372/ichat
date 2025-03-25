"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // 連接 WebSocket 伺服器

const ChatPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupName = searchParams.get("name"); // 獲取群組名稱
  const groupId = searchParams.get("id"); // 獲取群組 ID
  const userId = searchParams.get("userId"); // 獲取 userId
  interface Message {
    id: string;
    username: string;
    content: string;
    created_at: string;
  }

  const [messages, setMessages] = useState<Message[]>([]); // 聊天訊息
  const [newMessage, setNewMessage] = useState<string>(""); // 新訊息
  interface Member {
    user_id: string;
    username: string;
    joined_at: string;
  }

  const [members, setMembers] = useState<Member[]>([]); // 群組成員

  // 獲取群組成員
  useEffect(() => {
    const fetchMembers = async () => {
      console.log("開始獲取群組成員..."); // 確認函數被呼叫
      console.log("傳遞的 groupId:", groupId); // 輸出傳遞的群組 ID
      try {
        const response = await fetch("/api/group-members", {
          method: "GET",
          headers: {
            "group-id": groupId || "", // 傳遞群組 ID
          },
        });
        console.log("API 回應狀態碼:", response.status); // 輸出 API 回應的狀態碼

        if (response.ok) {
          const data = await response.json();
          console.log("獲取的群組成員資料:", data); // 輸出獲取的群組成員資料
          setMembers(data);
        } else {
          console.error("獲取群組成員失敗");
        }
      } catch (error) {
        console.error("伺服器錯誤", error);
      }
    };
  
    if (groupId) {
      fetchMembers();
    } else {
      console.log("groupId 為空，未執行 fetchMembers");
    }
  }, [groupId]);

const [username, setUsername] = useState<string>("");//根據id取得username

useEffect(() => {
  const fetchUsername = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "GET",
        headers: {
          "user-id": userId || "", // 傳遞 userId
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsername(data.username); // 設置當前使用者名稱
      } else {
        console.error("獲取使用者名稱失敗");
      }
    } catch (error) {
      console.error("伺服器錯誤", error);
    }
  };

  if (userId) {
    fetchUsername();
  }
}, [userId]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/messages", {
        method: "GET",
        headers: {
          "group-id": groupId || "",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessages(data); // 更新訊息列表
      } else {
        console.error("獲取訊息失敗");
      }
    } catch (error) {
      console.error("伺服器錯誤", error);
    }
  }, [groupId]);
  
  // 在組件初始化時獲取訊息
  useEffect(() => {
    if (groupId) {
      fetchMessages();
    }
  }, [groupId, fetchMessages]);

  useEffect(() => {
    // 接收訊息
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage"); // 清理事件監聽器
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(), // 假設使用時間戳作為 ID
        groupId: groupId, // 傳遞群組 ID
        userId: userId, // 傳遞使用者 ID
        username: username, // 替換為實際的使用者名稱
        content: newMessage,
        created_at: new Date().toISOString(),
      };

      socket.emit("sendMessage", message); // 發送訊息到伺服器
      setNewMessage(""); // 清空輸入框
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左側聊天框 */}
      <div className="flex-1 flex flex-col items-center justify-start p-4">
        <h2 className="text-2xl font-semibold mb-4">{groupName}</h2>
        <div className="flex-1 w-full max-w-2xl bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="mb-2">
                <span className="block text-sm text-gray-500">{message.username}</span> {/* 顯示發送者名稱 */}
                <span className="block bg-gray-200 p-2 rounded-md">{message.content}</span> {/* 顯示訊息內容 */}
                <span className="block text-xs text-gray-400">{new Date(message.created_at).toLocaleString()}</span> {/* 顯示訊息時間 */}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">尚無訊息</p>
          )}
        </div>
        <div className="w-full max-w-2xl mt-4 flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="輸入訊息..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
          >
            發送
          </button>
        </div>
      </div>

      {/* 右側功能選單 */}
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between">
        <h3 className="text-lg font-semibold mb-4">群組成員</h3>
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.user_id} className="flex justify-between items-center">
              <span>{member.username}</span>
            </li>
          ))}
        </ul>
        <button
          className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          onClick={() => router.push("/login")}
        >
          返回主頁
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
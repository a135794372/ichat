"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 匯入 useRouter
import Link from "next/link";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter(); // 初始化 useRouter

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("密碼與確認密碼不一致");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "註冊失敗");
        return;
      }

      const data = await res.json();
      alert(data.message); // 顯示註冊結果

      // 跳轉到主頁面
      router.push("/");
    } catch (error) {
      console.error("註冊請求失敗", error);
      alert("伺服器錯誤，請稍後再試");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">註冊 iChat 帳號</h2>
        <input
          type="text"
          placeholder="輸入用戶名"
          className="w-full p-2 mb-4 border rounded-md"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="輸入電子郵件"
          className="w-full p-2 mb-4 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="設置密碼"
          className="w-full p-2 mb-4 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="確認密碼"
          className="w-full p-2 mb-4 border rounded-md"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          onClick={handleRegister}
        >
          註冊
        </button>
        <div className="mt-4">
          <Link href="/" className="text-blue-500 text-sm">返回登入</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
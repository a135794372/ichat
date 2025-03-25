"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "登入失敗");
        return;
      }

      const data = await res.json();

      // 儲存 Token 到 localStorage
      localStorage.setItem("token", data.token);

      // 跳轉到新頁面
      router.push("/login");
    } catch (error) {
      console.error("登入請求失敗", error);
      alert("伺服器錯誤，請稍後再試");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">iChat</h2>
        <input
          type="email"
          placeholder="輸入電子郵件"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="輸入密碼"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          onClick={handleLogin}
        >
          登入
        </button>
        <div className="mt-4 flex justify-center space-x-4">
          <a href="/register" className="text-blue-500 text-sm">註冊</a>
          <a href="/forgetpass" className="text-blue-500 text-sm">忘記密碼？</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
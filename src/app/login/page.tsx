"use client";

import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

// 定義解碼後的 JWT 資料結構
type DecodedToken = {
  id: number;
  username: string;
  email: string;
  exp?: number; // 選填: Token 的過期時間
};

const DashboardPage = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token); // 指定解碼後的型別
      setUser({ id: decoded.id, username: decoded.username, email: decoded.email });
    }
  }, []);

  if (!user) {
    return <div>載入中...</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">歡迎, {user.username}!</h2>
        <p className="text-gray-600">電子郵件: {user.email}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
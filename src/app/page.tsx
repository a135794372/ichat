import React from "react";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">iChat</h2>
        <input
          type="email"
          placeholder="1111111111@qq.com"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="••••••••••••"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">登入</button>
        <div className="mt-4">
          <a href="/login" className="text-blue-500 text-sm">忘記密碼？</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

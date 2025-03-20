import Link from "next/link";
import React from "react";

const ForgotPasswordPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">忘記密碼</h2>
        <p className="text-sm text-gray-600 mb-4">請輸入您的電子郵件以重設密碼</p>
        <input
          type="email"
          placeholder="輸入您的電子郵件"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">發送重設連結</button>
        <div className="mt-4">
          <Link href="/">
            <a className="text-blue-500 text-sm">返回登入</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

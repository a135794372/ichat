import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import bcryptjs from "bcryptjs";
import mysql from "mysql2/promise"; // 匯入 mysql2/promise 的型別

type User = {
  id: number;
  username: string;
  email: string;
  password: string;
};

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "請填寫所有欄位" }, { status: 400 });
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "請輸入有效的電子郵件地址" }, { status: 400 });
    }

    // 檢查用戶名或郵箱是否已存在
    const [existingUsers] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if ((existingUsers as User[]).length > 0) {
      return NextResponse.json({ message: "用戶名或郵箱已被使用" }, { status: 400 });
    }

    // 加密密碼
    const hashedPassword = await bcryptjs.hash(password, 10);

    // 插入新用戶
    await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    return NextResponse.json({ message: "註冊成功！" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise"; // 匯入 mysql2 的型別

// 定義使用者資料結構
type User = {
  id: number;
  username: string;
  email: string;
  password: string;
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "請填寫所有欄位" }, { status: 400 });
    }

    // 查詢使用者
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    // 將查詢結果轉換為 User[]
    const users = rows as User[];
    const user = users[0];

    if (!user) {
      return NextResponse.json({ message: "使用者不存在" }, { status: 404 });
    }

    // 驗證密碼
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "密碼錯誤" }, { status: 401 });
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      "your-secret-key", // 替換為你的密鑰
      { expiresIn: "1h" }
    );

    return NextResponse.json({ message: "登入成功", token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
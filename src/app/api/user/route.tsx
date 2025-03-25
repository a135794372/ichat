import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import mysql from "mysql2/promise"; // 匯入 mysql2/promise 的型別

export async function GET(req: Request) {
  const userId = req.headers.get("user-id");

  if (!userId) {
    return NextResponse.json({ message: "缺少 userId" }, { status: 400 });
  }

  try {
    // 查詢使用者名稱
    const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await db.execute(
      "SELECT username FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "使用者不存在" }, { status: 404 });
    }

    return NextResponse.json({ username: rows[0].username }, { status: 200 });
  } catch (error) {
    console.error("查詢使用者名稱失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
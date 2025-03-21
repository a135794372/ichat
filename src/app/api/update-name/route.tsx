import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import mysql from "mysql2/promise"; // 匯入 mysql2 的型別

export async function POST(req: Request) {
  try {
    const { id, username } = await req.json();

    if (!id || !username) {
      return NextResponse.json({ message: "缺少必要參數" }, { status: 400 });
    }

    // 更新資料庫中的名稱
    await db.execute<mysql.RowDataPacket[]>(
      "UPDATE users SET username = ? WHERE id = ?",
      [username, id]
    );

    return NextResponse.json({ message: "名稱更新成功" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
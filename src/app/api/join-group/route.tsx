import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import mysql from "mysql2/promise"; // 匯入 mysql2 的型別

export async function POST(req: Request) {
  try {
    const { groupName, userId } = await req.json();

    if (!groupName || !userId) {
      return NextResponse.json({ message: "群組名稱和用戶 ID 是必填的" }, { status: 400 });
    }

    // 檢查群組是否存在
    const [groupResult] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id FROM `groups` WHERE name = ?",
      [groupName]
    );

    if (groupResult.length === 0) {
      return NextResponse.json({ message: "群組不存在" }, { status: 404 });
    }

    const groupId = groupResult[0].id;

    // 檢查是否已經有加入群組的請求
    const [requestCheck] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id FROM group_requests WHERE group_id = ? AND user_id = ? AND status = 'pending'",
      [groupId, userId]
    );

    if (requestCheck.length > 0) {
      return NextResponse.json({ message: "已經有一個待處理的加入請求" }, { status: 400 });
    }

    // 儲存加入群組的請求到 group_requests 資料表
    await db.execute(
      "INSERT INTO group_requests (group_id, user_id, status, created_at) VALUES (?, ?, 'pending', NOW())",
      [groupId, userId]
    );

    return NextResponse.json({ message: "加入群組請求已送出" }, { status: 200 });
  } catch (error) {
    console.error("加入群組請求失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
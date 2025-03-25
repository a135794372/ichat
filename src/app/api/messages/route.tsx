import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池

export async function POST(req: Request) {
  try {
    const { groupId, userId, content } = await req.json();

    if (!groupId || !userId || !content) {
      return NextResponse.json({ message: "缺少必要參數" }, { status: 400 });
    }

    // 儲存訊息到資料庫
    await db.execute(
      "INSERT INTO messages (group_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [groupId, userId, content]
    );

    return NextResponse.json({ message: "訊息儲存成功" }, { status: 200 });
  } catch (error) {
    console.error("儲存訊息失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const groupId = req.headers.get("group-id");

  if (!groupId) {
    return NextResponse.json({ message: "缺少群組 ID" }, { status: 400 });
  }

  try {
    // 從資料庫獲取訊息
    const [rows] = await db.execute(
      "SELECT messages.id, messages.content, messages.created_at, users.username FROM messages JOIN users ON messages.user_id = users.id WHERE messages.group_id = ? ORDER BY messages.created_at ASC",
      [groupId]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("獲取訊息失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("user-id"); // 從請求標頭中獲取用戶 ID

    if (!userId) {
      return NextResponse.json({ message: "缺少用戶 ID" }, { status: 400 });
    }

    // 查詢用戶所屬的群組
    const [groups] = await db.execute(
      `
      SELECT g.id, g.name, g.description
      FROM group_members gm
      JOIN \`groups\` g ON gm.group_id = g.id
      WHERE gm.user_id = ?
      `,
      [userId]
    );

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("獲取群組失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
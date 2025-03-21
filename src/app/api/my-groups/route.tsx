import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("user-id"); // 從請求標頭中獲取用戶 ID

    if (!userId) {
      return NextResponse.json({ message: "缺少用戶 ID" }, { status: 400 });
    }

    // 查詢用戶創建的群組
    const [groups] = await db.execute(
      "SELECT id, name, description FROM `groups` WHERE created_by = ?",
      [userId]
    );

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("獲取群組失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
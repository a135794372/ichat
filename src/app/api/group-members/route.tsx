import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池

export async function GET(req: Request) {
  try {
    console.log("API 被呼叫"); // 確認 API 是否被呼叫

    const groupId = req.headers.get("group-id"); // 從請求標頭中獲取群組 ID
    console.log("接收到的 group-id:", groupId); // 輸出接收到的群組 ID

    if (!groupId) {
      console.log("缺少群組 ID"); // 如果群組 ID 缺失，輸出錯誤訊息
      return NextResponse.json({ message: "缺少群組 ID" }, { status: 400 });
    }

    // 查詢群組成員
    console.log("開始查詢群組成員...");
    const [members] = await db.execute(
      `
      SELECT u.id AS user_id, u.username, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      `,
      [groupId]
    );
    console.log("查詢結果:", members); // 輸出查詢結果

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error("獲取群組成員失敗", error); // 輸出錯誤訊息
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
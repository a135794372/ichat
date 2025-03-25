import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池

export async function GET(req: Request) {
  const userId = req.headers.get("user-id");
  console.log("接收到的 user-id:", userId);
  if (!userId) {
    return NextResponse.json({ message: "缺少 userId" }, { status: 400 });
  }

  try {
    // 查詢當前使用者創建的群組的加入申請
    const [rows] = await db.query(
      `
      SELECT gr.id AS request_id, gr.group_id, gr.user_id, gr.status, gr.created_at, 
             g.name AS group_name, u.username AS applicant_name
      FROM group_requests gr
      JOIN \`groups\` g ON gr.group_id = g.id
      JOIN users u ON gr.user_id = u.id
      WHERE g.created_by = ? AND gr.user_id != ?
      ORDER BY gr.created_at DESC
      `,
      [userId, userId] // 第二個 userId 用於排除組長自己的申請
    );
    console.log("查詢結果:", rows);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("查詢群組申請失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
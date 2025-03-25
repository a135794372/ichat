import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import mysql from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const { requestId, status } = await req.json();

    if (!requestId || !status) {
      return NextResponse.json({ message: "缺少必要參數" }, { status: 400 });
    }

    // 獲取申請的詳細資訊
    const [requestDetails] = await db.execute<mysql.RowDataPacket[]>(
      `
      SELECT gr.group_id, gr.user_id
      FROM group_requests gr
      WHERE gr.id = ?
      `,
      [requestId]
    );

    if (requestDetails.length === 0) {
      return NextResponse.json({ message: "申請不存在" }, { status: 404 });
    }

    const { group_id, user_id } = requestDetails[0];

    if (status === "approved") {
      // 將使用者加入群組
      await db.execute(
        `
        INSERT INTO group_members (group_id, user_id, joined_at)
        VALUES (?, ?, NOW())
        `,
        [group_id, user_id]
      );
    }

    // 更新申請的狀態
    await db.execute(
      `
      UPDATE group_requests
      SET status = ?
      WHERE id = ?
      `,
      [status, requestId]
    );

    return NextResponse.json({ message: "操作成功" }, { status: 200 });
  } catch (error) {
    console.error("更新申請狀態失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
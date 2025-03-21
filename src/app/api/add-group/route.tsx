import { NextResponse } from "next/server";
import db from "../../../db"; // 匯入資料庫連線池
import { ResultSetHeader } from "mysql2"; // 匯入 ResultSetHeader 類型

export async function POST(req: Request) {
  try {
    const { name, description, createdBy } = await req.json();

    // 驗證請求參數
    if (!name || !description || !createdBy) {
      return NextResponse.json({ message: "缺少必要參數" }, { status: 400 });
    }

    if (description.length > 100) {
      return NextResponse.json({ message: "描述不能超過100個字元" }, { status: 400 });
    }

    // 插入群組資料到資料庫
    const [result] = await db.execute<ResultSetHeader>(
        "INSERT INTO `groups` (name, description, created_by) VALUES (?, ?, ?)",
        [name, description, createdBy]
      );

    return NextResponse.json({ message: "群組新增成功", groupId: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("新增群組失敗", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
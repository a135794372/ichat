"use client";

import React, { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation"; // 用於重定向

// 定義解碼後的 JWT 資料結構
type DecodedToken = {
  id: number;
  username: string;
  email: string;
  exp?: number; // 選填: Token 的過期時間
};
type GroupRequest = {
  request_id: number;
  group_id: number;
  user_id: number;
  status: string;
  created_at: string;
  group_name: string;
  applicant_name: string;
};

type Group = {
  id: number;
  name: string;
  description: string;
};
const DashboardPage = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [activeTab, setActiveTab] = useState<string>("profile"); // 控制顯示內容的狀態
  const [isEditing, setIsEditing] = useState<boolean>(false); // 控制是否處於編輯模式
  const [editedName, setEditedName] = useState<string>(""); // 暫存編輯的姓名
  const router = useRouter(); // 用於重定向
  const [groupName, setGroupName] = useState<string>(""); // 群組名稱
  const [groupDescription, setGroupDescription] = useState<string>(""); // 群組描述
  const [myGroups, setMyGroups] = useState<Group[]>([]); // 用戶的群組列表
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]); // 儲存群組申請資料

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token); // 指定解碼後的型別
      setUser({ id: decoded.id, username: decoded.username, email: decoded.email });
      setEditedName(decoded.username); // 初始化編輯姓名
    }
  }, []);
  const handleFetchGroupRequests = async () => {
    if (!user?.id) {
      console.error("userId 未定義");
      return;
    }
  
    console.log("傳遞的 userId:", user.id); // 調試用，檢查 userId 是否正確
  
    try {
      const response = await fetch("/api/group-requests", {
        method: "GET",
        headers: {
          "user-id": user.id.toString(), // 傳遞當前使用者 ID
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setGroupRequests(data); // 更新群組申請資料
      } else {
        console.error("獲取群組申請失敗");
      }
    } catch (error) {
      console.error("伺服器錯誤", error);
    }
  };
  const handleLogout = () => {
    const confirmLogout = window.confirm("確定要登出嗎？");
    if (confirmLogout) {
      localStorage.removeItem("token"); // 清除 token
      router.push("/"); // 重定向到登入頁面
    }
  };
  const handleUpdateRequestStatus = async (requestId: number, status: "approved" | "rejected") => {
    try {
      const response = await fetch("/api/update-request-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          status,
        }),
      });
  
      if (response.ok) {
        alert("操作成功");
  
        // 從 groupRequests 狀態中移除該申請
        setGroupRequests((prevRequests) =>
          prevRequests.filter((request) => request.request_id !== requestId)
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || "操作失敗");
      }
    } catch (error) {
      console.error("伺服器錯誤", error);
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const fetchMyGroups = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/my-groups", {
        method: "GET",
        headers: {
          "user-id": user.id.toString(), // 傳遞用戶 ID
        },
      });

      if (response.ok) {
        const groups: Group[] = await response.json(); // 明確指定返回的類型
        setMyGroups(groups); // 更新群組列表
      } else {
        console.error("獲取群組失敗");
      }
    } catch (error) {
      console.error("伺服器錯誤", error);
    }
  }, [user]);// 將 user 作為依賴項

  useEffect(() => {
    if (activeTab === "Mygroup") {
      fetchMyGroups();
    }
  }, [activeTab, fetchMyGroups]); // 添加 fetchMyGroups 作為依賴項
  
  const handleSaveName = async () => {
    if (user) {
      try {
        const response = await fetch("/api/update-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: user.id, username: editedName }),
        });

        if (response.ok) {
          const updatedUser = { ...user, username: editedName };
          setUser(updatedUser); // 更新前端顯示的用戶資料
          setIsEditing(false); // 結束編輯模式
        } else {
          console.error("更新失敗");
        }
      } catch (error) {
        console.error("伺服器錯誤", error);
      }
    }
  };

  if (!user) {
    return <div>載入中...</div>;
  }

  // 根據 activeTab 顯示不同的內容
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">個人資訊</h2>
            <div className="text-gray-600 mb-4">
              <span>名稱: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <span>{user.username}</span>
              )}
              <button
                onClick={isEditing ? handleSaveName : () => setIsEditing(true)}
                className="ml-2 text-blue-500 hover:underline"
              >
                {isEditing ? "保存" : "編輯"}
              </button>
            </div>
            <p className="text-gray-600">電子郵件: {user.email}</p>
          </div>
        );
      case "chat":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">聊天室</h2>
            <p className="text-gray-600">這裡是聊天室的內容。</p>
          </div>
        );
      case "Mygroup":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">我的群組</h2>
            {/* 群組列表容器 */}
            <div className="text-left max-h-[192px] overflow-y-auto border border-gray-300 rounded-lg p-4">
              {myGroups.length > 0 ? (
                myGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex justify-between items-center mb-4 pb-2"
                  >
                    {/* 群組名稱 */}
                    <h3 className="text-lg font-semibold flex-1 text-center">{group.name}</h3>
                    {/* 進入群組按鈕 */}
                    <button
                      onClick={() =>
                        router.push(
                          `/chat/${group.id}?name=${encodeURIComponent(group.name)}&id=${group.id}&userId=${user?.id}`
                        )
                      }
                      className="ml-4 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                    >
                      群組聊天室
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">尚未創建任何群組。</p>
              )}
            </div>
          </div>
        );
      case "Joingroup":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">加入群組</h2>
            <form
              onSubmit={async (e) => {
              e.preventDefault(); // 防止表單的預設提交行為
              if (!groupName) {
                alert("請輸入群組名稱");
                return;
              }
    try {
      const response = await fetch("/api/join-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName,
          userId: user?.id, // 傳遞用戶 ID
        }),
      });

      if (response.ok) {
        alert("已請求加入群組！");
        setGroupName(""); // 清空輸入框
      } else {
        const errorData = await response.json();
        alert(errorData.message || "加入群組失敗");
      }
    } catch (error) {
      console.error("加入群組請求失敗", error);
      alert("伺服器錯誤，請稍後再試");
    }
  }}
>
  <input
    type="text"
    placeholder="群組名稱"
    className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={groupName}
    onChange={(e) => setGroupName(e.target.value)}
  />
  <button
    type="submit" // 使用 type="submit"，讓按鈕只觸發表單的 onSubmit
    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
  >
    申請
  </button>
</form>
          </div>
        );
      case "Addgroup":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">新增群組</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!groupName || !groupDescription) {
                  alert("請填寫所有欄位");
                  return;
                }
                if (groupDescription.length > 100) {
                  alert("描述不能超過100個字元");
                  return;
                }
                try {
                  const response = await fetch("/api/add-group", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: groupName,
                      description: groupDescription,
                      createdBy: user?.id,
                    }),
                  });

                  if (response.ok) {
                    const data = await response.json();
                    alert(`群組新增成功，群組 ID: ${data.groupId}`);
                    setGroupName("");
                    setGroupDescription("");
                  } else {
                    const errorData = await response.json();
                    alert(errorData.message || "新增群組失敗");
                  }
                } catch (error) {
                  console.error("新增群組請求失敗", error);
                  alert("伺服器錯誤，請稍後再試");
                }
              }}
            >
              <input
                type="text"
                placeholder="群組名稱"
                className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <textarea
                placeholder="群組描述 (最多100字)"
                className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                maxLength={100}
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                新增群組
              </button>
            </form>
          </div>
        );
        case "GroupRequests":
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
      <h2 className="text-xl font-semibold mb-4">群組申請</h2>
      <div className="text-left max-h-[192px] overflow-y-auto border border-gray-300 rounded-lg p-4">
        {groupRequests.length > 0 ? (
          groupRequests.map((request) => (
            <div key={request.request_id} className="mb-4">
              <p>
                <strong>群組名稱:</strong> {request.group_name}
              </p>
              <p>
                <strong>申請者:</strong> {request.applicant_name}
              </p>
              <p>
                <strong>申請時間:</strong> {new Date(request.created_at).toLocaleString()}
              </p>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleUpdateRequestStatus(request.request_id, "approved")}
                  className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                >
                  同意
                </button>
                <button
                  onClick={() => handleUpdateRequestStatus(request.request_id, "rejected")}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                >
                  拒絕
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">目前沒有任何申請。</p>
        )}
      </div>
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 主內容區域 */}
      <div className="flex-1 flex items-center justify-center">
        {renderContent()}
      </div>

      {/* 右側固定欄位 */}
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between">
        <h3 className="text-lg font-semibold mb-4">功能選單</h3>
        <div className="space-y-4">
          <button
            className={`w-full py-2 px-4 rounded-lg ${activeTab === "profile" ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            onClick={() => setActiveTab("profile")}
          >
            個人資料
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg ${activeTab === "Mygroup" ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            onClick={() => setActiveTab("Mygroup")}
          >
            我的群組
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg ${activeTab === "Joingroup" ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            onClick={() => setActiveTab("Joingroup")}
          >
            加入群組
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg ${activeTab === "Addgroup" ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            onClick={() => setActiveTab("Addgroup")}
          >
            新增群組
          </button>
          <button
  className={`w-full py-2 px-4 rounded-lg ${
    activeTab === "GroupRequests" ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
  }`}
  onClick={() => {
    setActiveTab("GroupRequests");
    handleFetchGroupRequests(); // 獲取群組申請資料
  }}
>
  群組申請
</button>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full mt-8 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          登出
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
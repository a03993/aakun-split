# 分帳AA君

LINE LIFF 分帳 Web App，讓群組成員可以快速記帳、分帳。

## 功能

- 建立帳本，手動新增成員
- 分享連結邀請其他人認領身份加入
- 新增、編輯、刪除帳單（餐飲、交通、住宿、娛樂、日用、其他）
- 結算：貪心法最小化轉帳次數，金額四捨五入取整數
- 結算後帳本鎖定，僅供查看

## Tech Stack

| 層級         | 技術                                |
| ------------ | ----------------------------------- |
| Frontend     | Next.js 16 (App Router) + Tailwind CSS 4 |
| Backend / DB | Supabase (Postgres + Auth)          |
| 部署         | Vercel                              |
| LINE 整合    | LINE LIFF SDK + Messaging API       |
| Icon         | Lucide React                        |

## 專案結構

```
aakun-split/
├── app/
│   ├── layout.tsx                        # Root Layout（Header + Providers）
│   ├── page.tsx                          # 首頁入口
│   ├── providers.tsx                     # Context Provider 嵌套
│   ├── _components/
│   │   ├── Header.tsx                    # 共用 Header（Logo + 使用者資訊）
│   │   ├── GroupList.tsx                 # 帳本列表
│   │   ├── CreateGroupModal.tsx          # 新增帳本 Modal
│   │   ├── ShareModal.tsx               # 分享連結 Modal
│   │   ├── AvatarStack.tsx              # 頭貼堆疊組件
│   │   └── Spinner.tsx                  # 共用載入畫面
│   └── group/[id]/
│       ├── page.tsx                      # 帳本頁入口（含 generateMetadata）
│       ├── loading.tsx                   # Next.js Suspense fallback
│       └── _components/
│           ├── GroupDetail/
│           │   ├── index.tsx             # 帳本內頁 UI
│           │   └── useGroupDetail.ts     # 帳本資料與邏輯
│           ├── AddBillModal.tsx          # 新增帳單 Modal
│           ├── AddMemberModal.tsx        # 新增成員 Modal
│           ├── BillCard.tsx             # 帳單卡片
│           ├── BillDetailModal.tsx       # 帳單詳情（查看/編輯/刪除）
│           ├── ClaimModal.tsx           # 認領身份 Modal
│           ├── MemberListModal.tsx       # 成員列表 Modal
│           └── SettlementModal.tsx       # 結算結果 Modal
├── contexts/
│   ├── liff.tsx                          # LIFF Context + Provider
│   └── loading.tsx                       # Loading overlay Context + Provider
├── hooks/
│   └── useLiff.ts                        # re-export useLiff
├── lib/
│   ├── config.ts                         # 環境判斷（isDev）
│   ├── constants.ts                      # 分類標籤
│   ├── liff.ts                           # LINE LIFF 工具函式
│   ├── mock.ts                           # Mock 靜態資料
│   ├── supabase.ts                       # Supabase Client
│   └── services/
│       ├── mockStore.ts                  # Mock in-memory 可變資料
│       ├── billing/                      # 帳本/成員/帳單 CRUD
│       └── settlement/                   # 結算計算與通知
├── types/
│   └── index.ts                          # 共用型別
└── supabase/
    └── migrations/
        └── init_schema.sql               # Database Schema
```

## 本地開發

```bash
npm install
npm run dev
```

本地開發自動使用 Mock 資料（`NODE_ENV === "development"`），不需要 LINE 登入或 Supabase 連線。

## 環境變數

```
NEXT_PUBLIC_LIFF_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 上線前準備

1. LINE Developers Console 設定 LINE Login channel + LIFF endpoint
2. Supabase Dashboard 執行 `supabase/migrations/init_schema.sql` 建表
3. 串接 LINE OAuth → Supabase Auth（取代目前的 `signInAnonymously`）
4. Vercel 部署 + 設定環境變數

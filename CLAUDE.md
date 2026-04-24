# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案簡介

分帳AA君 — LINE LIFF 分帳 Web App。

## 常用指令

```bash
npm run dev        # 本地開發（自動使用 Mock 資料）
npm run build      # 建置
npm run lint       # ESLint 檢查
npm run format     # Prettier 格式化全專案
npx tsc --noEmit   # TypeScript 型別檢查
```

## 技術選型

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS 4
- **Backend**: Supabase (Postgres + Auth)
- **部署**: Vercel
- **LINE 整合**: LIFF SDK + Messaging API
- **Icon**: Lucide React

## 架構

### Server / Client Component 分離

- `app/layout.tsx`（Server Component）渲染 `<Header />` 並用 `<Providers>` 包裹子組件
- `app/providers.tsx`（Client Component）嵌套所有 Context Provider
- `app/page.tsx` 維持 Server Component，只做入口 wrapper
- `app/group/[id]/page.tsx` 用 `generateMetadata` 動態產生 OG metadata
- 互動邏輯拆到 `app/_components/` 或 `app/group/[id]/_components/` 下的 Client Component
- 帳本相關組件命名成對：`GroupList`（列表）/ `GroupDetail`（明細）
- `GroupDetail` 拆成子目錄：`GroupDetail/index.tsx`（渲染）+ `GroupDetail/useGroupDetail.ts`（資料與邏輯）
- `GroupList` 的新增帳本表單拆為獨立組件 `CreateGroupModal`，放在 `app/_components/`
- 帳單卡片 `BillCard` 可點擊開啟 `BillDetailModal`（查看/編輯/刪除）
- 點擊 `AvatarStack` 開啟 `MemberListModal`，owner 可從中新增成員
- 共用載入畫面用 `app/_components/Spinner.tsx`；`app/group/[id]/loading.tsx` 作為 Next.js Suspense fallback
- Next.js 的 `params` 是 Promise — Server Component 用 `await params`，Client Component 用 `use(params)`

### Mock / Supabase 資料來源分離

- `lib/config.ts` 的 `isDev`（`NODE_ENV === "development"`）控制環境切換
- Mock 模式：`lib/mock.ts` 靜態資料 + `lib/services/mockStore.ts` in-memory 可變 state
- Supabase 模式：LIFF SDK 認證 + Supabase RLS 保護的 API 呼叫
- 每個 service 目錄有 `mock.ts`、`supabase.ts`、`index.ts`（入口），`isDev` 只在 `index.ts` 判斷一次

### Service 層

```
lib/services/
  mockStore.ts                 # 所有 mock service 共用的 in-memory 資料
  billing/
    index.ts                   # isDev 分流
    mock.ts                    # 帳本/成員/帳單 CRUD（in-memory）
    supabase.ts                # 帳本/成員/帳單 CRUD（Supabase）
  settlement/
    index.ts                   # 結算計算（純邏輯，四捨五入取整數）+ isDev 分流
    mock.ts                    # 結算儲存 + console.log 通知
    supabase.ts                # 結算儲存 + LINE 通知
```

- 組件不直接呼叫 Supabase，一律透過 service function
- 型別統一從 `@/types` import，service 入口不 re-export 型別
- `mockStore.ts` 的成員資料使用 `{ ...MOCK_MEMBERS[n] }` 展開，避免跨帳本共用 reference
- mock 的 `addMember` 用 spread 建立新陣列，避免跟 state reference 共用導致重複新增

### Context / Provider 層

```
contexts/
  liff.tsx                     # LiffContext + LiffProvider + useLiff
  loading.tsx                  # LoadingContext + LoadingProvider + useLoading
hooks/
  useLiff.ts                   # re-export useLiff（穩定的 import path）
app/
  providers.tsx                # 嵌套所有 Provider（LiffProvider + LoadingProvider）
```

- Context hook 在 Provider 外呼叫會拋出錯誤（null guard）
- `useLiff` 消費端統一從 `@/hooks/useLiff` import
- `useLoading` 提供 `showLoading(message)` / `hideLoading()` 控制全螢幕遮罩，用於耗時操作（結算、認領、新增成員）

### 認領機制

- 使用者透過分享連結進入帳本 → 系統檢查是否已認領 → 未認領時只顯示 `ClaimModal`，不渲染帳本內容
- `ClaimModal` 列出 `user_id === null` 的成員供選擇
- 無可認領身份時顯示提示 + 返回按鈕
- `claimMember` 需要 `billGroupId` 參數，避免跨帳本認領同 id 成員

### 結算機制

- 結算使用貪心法最小化轉帳次數，金額四捨五入取整數
- 結算確認後呼叫 `closeBillGroup` 設 `is_active = false`
- 已結算帳本：隱藏新增帳單/結算按鈕、帳單只能查看不能編輯刪除、不能新增成員
- 已結算帳本仍顯示在帳本列表，標記「已結算」

## 程式碼風格

- Prettier：tab size 4、雙引號、printWidth 120、semi true
- Import 排序：prettier-plugin-sort-imports（React/Next → 第三方 → @/lib → @/contexts → @/hooks → @/app/\_components → @/types → 相對路徑）
- Tailwind class 排序：prettier-plugin-tailwindcss
- 組件檔案 PascalCase，其他檔案 camelCase
- Props type 統一命名為 `Props`，共用型別放 `types/index.ts`
- Service 參數型別用 `Params` 後綴，UI 表單 state 用 `Form` 後綴
- Boolean state 用 `is` 前綴（`isFormOpen`、`isLoading`）
- Handler 用 `handle` 前綴（`handleAddBill`、`handleSettle`）
- 註解統一使用中文，不使用箭頭或分隔線，直白敘述
- JSX 兄弟元素之間不加空行
- JSX 條件渲染：二選一用三元式，有或沒有用 `&&`
- 手機 App，不需要 hover 樣式
- 外部圖片用 `next/image` 的 `<Image />`，不用 `<img>`
- Modal 組件的關閉/返回邏輯統一用 `onClose` prop，由父組件決定行為
- 按鈕圓角統一 `rounded-xl`，filter chips 用 `rounded-full`
- 按鈕高度：Modal 內按鈕 `py-3 text-sm`，FAB 按鈕 `py-3.5 text-base`
- disabled 樣式統一 `disabled:opacity-50`
- `AvatarStack` 預設最多顯示 6 個 avatar，第 7 個起顯示 +N badge 取代第 6 位
- 帳單分類：餐飲、交通、住宿、娛樂、日用、其他

## 環境變數

```
NEXT_PUBLIC_LIFF_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`service_role` key 絕對不放前端，不加 `NEXT_PUBLIC_` 前綴。

## 已知待修

- Supabase Auth：`signInAnonymously` 需改為 LINE OAuth 正式串接，否則 prod 環境跨 session 資料會斷連

## 未來擴充方向

- LINE OAuth 正式串接 Supabase Auth
- AA君角色養成系統（設計確認後再加入 schema 和組件）
- iOS App（Expo React Native，共用 Supabase + service layer）
- Branding / Landing 頁面（同專案，Server Component + SEO）

# Haylo — Web build

Haylo 的網頁版，從 `HAYLO-Android` 的 WebView asset 轉出來，可直接發布到 GitHub Pages。
純靜態、無 build step、無外部依賴，安裝後可離線使用。

## 檔案結構

```
.
├── index.html                 # App 本體（單檔，含 CSS/JS）
├── manifest.webmanifest       # PWA manifest（可安裝到桌面／主畫面）
├── sw.js                      # Service worker（離線快取）
├── .nojekyll                  # 關掉 Jekyll，避免 GitHub Pages 忽略檔案
├── fonts/                     # 自架字體 woff2（latin subset，共 244 KB）
└── icons/                     # App icon / favicon
```

## 發布到 GitHub Pages（`<username>.github.io` 根目錄）

```bash
git init
git add -A
git commit -m "Haylo web build"
git branch -M main
git remote add origin https://github.com/<username>/<username>.github.io.git
git push -u origin main
```

在 repo 的 **Settings → Pages** 把 Source 設成 `Deploy from a branch`，
branch 選 `main`、資料夾選 `/ (root)`。一兩分鐘後即可在
`https://<username>.github.io/` 看到。

> 所有路徑都用相對寫法（`./sw.js`、`./fonts/…`），所以放到子路徑的專案 repo
> （`https://<username>.github.io/haylo/`）一樣能跑，不用改任何程式碼。

## 本機預覽

Service worker 不能在 `file://` 下運作，要用 HTTP：

```bash
python3 -m http.server 8080
# 開 http://localhost:8080
```

## 更新版本時

改完 `index.html` 後，**務必把 `sw.js` 裡的 `CACHE` 版號往上加**
（`haylo-v1` → `haylo-v2`），否則舊的 service worker 會繼續送快取版本給已安裝的使用者。

## 與 Android 版的差異

| 項目 | Android (WebView) | Web build |
|---|---|---|
| 資料保存 | 無（記憶體，關掉即消失） | localStorage，key = `haylo.v1` |
| 字體 | Google Fonts CDN，需連網 | 自架 woff2，完全離線 |
| 深色模式 | 每次開啟都回到淺色 | 記住選擇；首次開啟跟隨系統設定 |
| 開場動畫 | 每次都播 | 每天第一次才播（見下方） |
| 鎖定畫面提醒 | `Android.scheduleLockPopup` bridge | 無（呼叫有 try/catch，網頁上安全略過） |

### 可調整的開關

`index.html` 裡：

```js
const INTRO_ONCE_PER_DAY = true;   // 改成 false 就每次載入都播完整開場動畫
```

### 清空資料

瀏覽器 console 輸入 `resetHaylo()`，或手動清除該網站的 localStorage。

## 儲存的資料格式

單一 key `haylo.v1`：

```json
{
  "v": 1,
  "nextId": 5,
  "TASKS": [{ "id": 1, "t": "Write project brief", "done": false, "dueDate": "2026-08-04" }],
  "HISTORY": { "2026-08-04": { "done": 1, "total": 3 } },
  "sessions": 0,
  "setMin": 30,
  "dark": true,
  "savedAt": 1754280000000
}
```

`v` 欄位保留給未來 schema migration 用；讀取端對壞掉的資料會靜默 fallback 成預設值，
不會把 app 卡死。

## Icon 來源

`icons/` 全部由 Android 專案的 adaptive icon 向量原稿轉出，不是重新設計的：

- 原稿：`app/src/main/res/drawable/ic_launcher_foreground.xml`（108×108 viewport）
- focus ring：圓心 (54,54)、r=22、stroke 7、`#F3F3F1`
- Haylo dot：圓心 (74,40)、r=6、實心 `#F3F3F1`
- 背景：`#1A1A1A`（`@color/haylo_icon_bg`）

`icon-maskable-512.png` 用 zoom=1.0，等同 Android 的 72/108 安全區；其餘用 zoom=1.25 裁近一點，
因為網頁的一般 icon 不會被 launcher 再套遮罩。`favicon.svg` 直接就是同一組路徑的 SVG 寫法，
要改 logo 只需改那一個檔加上重跑 `icons.py`。

## 字體授權

Space Grotesk、Inter、Space Mono、Comfortaa 皆為 SIL Open Font License 1.1，
可自由重新發布。字體檔取自 [Fontsource](https://fontsource.org/)。

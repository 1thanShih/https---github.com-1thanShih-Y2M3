# Y2M3 - YouTube URL to MP3

這是一個用 Flask + yt-dlp 做的簡單轉檔工具。
你貼上 YouTube 網址，它會下載音訊並轉成 MP3，介面裡也有進度條和大小/時間預估。

## 你可以做什麼

- 一次貼多個 YouTube 連結（每行一個）
- 選 MP3 音質（128 / 192 / 320 kbps）
- 先看預估檔案大小與處理時間
- 下載時看即時進度

## 執行前準備

請先確認你的電腦有這些東西：

- Python 3.10+
- pip
- FFmpeg（一定要，否則無法轉成 MP3）

## 安裝 FFmpeg（Windows）

### 方法 A：用 winget（最快）

```powershell
winget install --id Gyan.FFmpeg --source winget
```

安裝後，關掉目前終端機再開一個新的，檢查：

```powershell
ffmpeg -version
```

如果能看到版本資訊就 OK。

### 方法 B：手動安裝

1. 到[FFmpeg](https://www.gyan.dev/ffmpeg/builds/) 官方網站下載 Windows build
2. 解壓縮到固定路徑，例如 `C:\ffmpeg`
3. 把 `C:\ffmpeg\bin` 加進系統環境變數 PATH
4. 重新開終端機後執行 `ffmpeg -version` 確認

## 安裝專案

在專案資料夾執行：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 啟動程式

```powershell
python app.py
```

看到 Flask 啟動訊息後，打開瀏覽器進入：

- http://127.0.0.1:5000

## 使用方式

1. 保存先フォルダ：可填下載路徑，不填就會存到專案內的 `downloads` 資料夾
2. YouTube の URL：一行一個連結
3. 音質選擇：128 / 192 / 320 kbps
4. 先按「サイズ・時間見積」看預估（可選）
5. 按「ダウンロード開始」開始轉檔

## 常見問題

### 1) `ffmpeg` 指令找不到

代表 FFmpeg 還沒安裝，或 PATH 沒設好。
先確認安裝，再重新開終端機測試：

```powershell
ffmpeg -version
```

### 2) 已安裝 FFmpeg 但還是失敗

- 關掉 VS Code 終端機重開
- 確認你輸入的是 `ffmpeg -version`（不是 `ffmpeg --`）
- 用 `where ffmpeg` 看看系統抓到哪個路徑

### 3) 下載失敗或被擋

YouTube 可能改版或影片有限制，先更新 yt-dlp：

```powershell
pip install -U yt-dlp
```

## 注意事項

- 請只下載你有權限處理的內容
- 本工具僅供學習與個人用途

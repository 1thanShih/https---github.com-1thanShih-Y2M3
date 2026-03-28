from flask import Flask, render_template, request, jsonify
import yt_dlp
import os

app = Flask(__name__)

progress_state = {
    "percent": 0,
    "status": "待機中..."
}

def my_hook(d):
    global progress_state
    if d['status'] == 'downloading':
        total = d.get('total_bytes') or d.get('total_bytes_estimate')
        if total:
            percent = (d.get('downloaded_bytes', 0) / total) * 100
            progress_state['percent'] = round(percent, 1)
        progress_state['status'] = "ダウンロード中..." 
    elif d['status'] == 'finished':
        progress_state['percent'] = 100
        progress_state['status'] = "音声ファイル(MP3)に変換中..." 

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/progress', methods=['GET'])
def get_progress():
    return jsonify(progress_state)

# ⚠️ 困難內容標記：新增「預估容量與時間」的 API
@app.route('/estimate', methods=['POST'])
def estimate():
    data = request.json
    urls = data.get('urls', [])
    bitrate = int(data.get('quality', 192)) # 取得前端傳來的音質 (128, 192, 320)

    if not urls:
        return jsonify({"status": "error", "message": "URLが提供されていません"})

    # 設定 download=False，代表只抓取影片資訊，不進行實體下載
    ydl_opts = {'quiet': True, 'noplaylist': True}
    total_duration_sec = 0

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            for url in urls:
                # 擷取影片資訊字典
                info = ydl.extract_info(url, download=False)
                # 累加每個影片的長度 (秒)
                total_duration_sec += info.get('duration', 0)
        
        # 利用數學公式計算 MP3 預估大小 (MB)
        est_size_mb = (total_duration_sec * bitrate) / 8192
        
        # 預估處理時間：經驗法則上，下載+轉檔約為影片總長度的 1/15，加上基本啟動時間
        est_time_sec = (total_duration_sec / 15) + (len(urls) * 2)

        return jsonify({
            "status": "success",
            "size_mb": round(est_size_mb, 2),
            "time_sec": round(est_time_sec),
            "total_files": len(urls)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/download', methods=['POST'])
def download():
    global progress_state
    data = request.json
    urls = data.get('urls', [])
    save_path = data.get('save_path', '')
    # 接收前端選擇的音質設定
    quality = data.get('quality', '192') 

    if not urls:
        return jsonify({"status": "error", "message": "URLが提供されていません"}), 400

    if not save_path:
        save_path = os.path.join(os.getcwd(), 'downloads')

    if not os.path.exists(save_path):
        os.makedirs(save_path)

    progress_state = {"percent": 0, "status": "準備中..."}

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(save_path, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'keepvideo': False,
        # 👇 加入這行：允許多執行緒同時下載 5 個碎片，大幅加快下載速度
        'concurrent_fragment_downloads': 5,
        'progress_hooks': [my_hook],
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            # 👇 動態套用使用者選擇的音質
            'preferredquality': str(quality),
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download(urls)
        return jsonify({"status": "success", "message": f"完了！ファイルは以下に保存されました：{save_path}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
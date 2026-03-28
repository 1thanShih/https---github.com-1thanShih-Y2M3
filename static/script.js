document.addEventListener('DOMContentLoaded', () => {
    // 已移除 txtUpload 的宣告
    const urlInput = document.getElementById('urlInput');
    const savePath = document.getElementById('savePath');
    const qualitySelect = document.getElementById('qualitySelect');
    const estimateBtn = document.getElementById('estimateBtn');
    const estimateResult = document.getElementById('estimateResult');
    const estSize = document.getElementById('estSize');
    const estTime = document.getElementById('estTime');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    const mainContainer = document.getElementById('mainContainer');
    const ytPreview = document.getElementById('ytPreview');
    const progressContainer = document.getElementById('progressContainer');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    let pollingInterval = null;

    function extractVideoID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function getValidUrls() {
        const rawUrls = urlInput.value.split('\n');
        return rawUrls.map(url => url.trim()).filter(url => url.length > 0);
    }

    // 監聽網址輸入
    urlInput.addEventListener('input', () => {
        const urls = getValidUrls();
        estimateResult.style.display = 'none'; 

        if (urls.length > 0) {
            // 👇 關鍵修改：取得陣列中的「最後一個」網址 (urls.length - 1)
            const lastUrl = urls[urls.length - 1];
            const videoId = extractVideoID(lastUrl);
            
            if (videoId) {
                ytPreview.src = `https://www.youtube.com/embed/${videoId}`;
                mainContainer.classList.add('show-preview');
            } else {
                hidePreview();
            }
        } else {
            hidePreview();
        }
    });

    function hidePreview() {
        mainContainer.classList.remove('show-preview');
        progressContainer.classList.remove('show');
        setTimeout(() => {
            if (!mainContainer.classList.contains('show-preview')) {
                ytPreview.src = ''; 
            }
        }, 600); // 配合 CSS 動畫拉長至 0.6s
    }

    // 已完全移除 TXT 讀取的事件監聽器

    estimateBtn.addEventListener('click', async () => {
        const urls = getValidUrls();
        if (urls.length === 0) {
            alert("URLを入力してください");
            return;
        }

        estimateBtn.disabled = true;
        estimateBtn.textContent = "計算中...";
        estimateResult.style.display = 'none';

        try {
            const response = await fetch('/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    urls: urls,
                    quality: qualitySelect.value 
                })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                estSize.textContent = `${result.size_mb} MB`;
                estTime.textContent = `約 ${result.time_sec} 秒`;
                estimateResult.style.display = 'flex'; 
            } else {
                alert("見積もりに失敗しました: " + result.message);
            }
        } catch (error) {
            alert("サーバー通信エラー");
        } finally {
            estimateBtn.disabled = false;
            estimateBtn.textContent = "サイズ・時間見積";
        }
    });

    downloadBtn.addEventListener('click', async () => {
        const urls = getValidUrls();
        const path = savePath.value.trim();
        const quality = qualitySelect.value; 

        if (urls.length === 0) {
            statusMessage.textContent = 'エラー：URLを入力してください。';
            statusMessage.style.color = '#ef4444'; 
            return;
        }

        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span style="display:inline-block; animation: pulse 1.5s infinite;">処理中...</span>';
        statusMessage.textContent = '複数ファイルのダウンロードには時間がかかります。お待ちください。';
        statusMessage.style.color = '#64748b'; 

        progressContainer.classList.add('show');
        progressBarFill.style.width = '0%';
        progressPercent.textContent = '0%';

        pollingInterval = setInterval(async () => {
            try {
                const res = await fetch('/progress');
                const data = await res.json();
                progressBarFill.style.width = data.percent + '%';
                progressPercent.textContent = data.percent + '%';
                progressText.textContent = data.status;
            } catch (e) {}
        }, 500);

        try {
            const response = await fetch('/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    urls: urls, 
                    save_path: path,
                    quality: quality 
                })
            });

            const result = await response.json();
            clearInterval(pollingInterval);

            if (response.ok) {
                statusMessage.textContent = result.message;
                statusMessage.style.color = '#10b981'; 
                
                urlInput.value = '';
                estimateResult.style.display = 'none'; 
                progressBarFill.style.width = '100%';
                progressPercent.textContent = '100%';
                progressText.textContent = '完了！';
                
                setTimeout(() => { hidePreview(); }, 1500);
            } else {
                statusMessage.textContent = 'エラー：' + result.message;
                statusMessage.style.color = '#ef4444';
            }
        } catch (error) {
            clearInterval(pollingInterval);
            statusMessage.textContent = 'エラーが発生しました。';
            statusMessage.style.color = '#ef4444';
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = 'ダウンロード開始';
        }
    });
});
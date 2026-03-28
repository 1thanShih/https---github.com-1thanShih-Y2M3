# Y2M3 - YouTube URL to MP3

<img width="1172" height="1227" alt="image" src="https://github.com/user-attachments/assets/efcfe056-def5-441e-9f93-f2d4615de438" />



This is a simple conversion tool built with Flask and yt-dlp.
Paste a YouTube URL, and it will download the audio and convert it to MP3. The interface includes a progress bar along with file size and time estimations.

## Features

- <b>Batch Processing<b/>: Paste multiple YouTube links at once (one per line).
- <b>Adjustable Quality<b/>: Select MP3 bitrate (128 / 192 / 320 kbps).
- <b>Pre-download Estimates<b/>: View estimated file size and processing time before starting.
- <b>real-time Tracking<b/>: Monitor download progress live.

## Prerequisites

Before running the application, ensure your system has the following installed:

- Python 3.10+
- pip
- FFmpeg (Required for MP3 conversion)

## Installing FFmpeg (Windows)

### Method A: via winget (Recommended/Fastest)

```powershell
winget install --id Gyan.FFmpeg --source winget
```

After installation, close your current terminal and open a new one to verify:

```powershell
ffmpeg -version
```


### Method B: Manual Installation

1. Download the Windows builds from the [FFmpeg Official Site](https://www.gyan.dev/ffmpeg/builds/).
2. Extract the files to a permanent location (e.g.,`C:\ffmpeg`)
3. Add `C:\ffmpeg\bin` to your system Environment Variables (PATH).
4. Restart your terminal and run` ffmpeg -version `to confirm.

## Project Setup

Run the following commands in the project directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Running the App

```powershell
python app.py
```

Once the Flask server starts, open your browser and go to:

- http://127.0.0.1:5000

## How to Use

1. Download Folder: Specify a save path (defaults to the downloads folder within the project).
2. YouTube URLs: Enter links (one per line).
3. Audio Quality: Choose between 128, 192, or 320 kbps.
4. Estimate (Optional): Click "Estimate Size/Time" to see predictions.
5. Start: Click "Start Download" to begin the conversion.


## Disclaimer

- Please only download content you have the right to access.
- This tool is intended for educational and personal use only.

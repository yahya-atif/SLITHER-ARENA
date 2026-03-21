import urllib.request
import os

assets = {
    "eat.mp3": "https://www.soundjay.com/buttons/beep-01.mp3",
    "click.mp3": "https://www.soundjay.com/buttons/beep-07.mp3",
    "boost.mp3": "https://www.soundjay.com/buttons/button-4.mp3",
    "death.mp3": "https://www.soundjay.com/buttons/button-10.mp3",
    "music.mp3": "https://www.soundjay.com/free-music/stream-1.mp3"
}

os.makedirs("assets/audio", exist_ok=True)

opener = urllib.request.build_opener()
opener.addheaders = [('User-agent', 'Mozilla/5.0')]
urllib.request.install_opener(opener)

for name, url in assets.items():
    path = os.path.join("assets/audio", name)
    print(f"Downloading {name} from {url}...")
    try:
        urllib.request.urlretrieve(url, path)
        print(f"Successfully downloaded {name}")
    except Exception as e:
        print(f"Failed to download {name}: {e}")

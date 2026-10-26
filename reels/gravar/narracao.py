# Gera as falas da narração (../audio/narracao.json) na ElevenLabs, em ../audio/vo/<nome>.mp3.
# A chave vem só da variável ELEVENLABS_API_KEY; nunca grave a chave em arquivo do repositório.
# Uso: python narracao.py            (todas as falas)
#      python narracao.py fim intro  (só algumas)
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

AUDIO = Path(__file__).resolve().parent.parent / 'audio'


def main():
    key = os.environ.get('ELEVENLABS_API_KEY')
    if not key:
        sys.exit('Defina ELEVENLABS_API_KEY antes de gerar a narração.')
    cfg = json.loads((AUDIO / 'narracao.json').read_text(encoding='utf-8'))
    out = AUDIO / 'vo'
    out.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:]
    for name, text in cfg['lines'].items():
        if only and name not in only:
            continue
        body = json.dumps({
            'text': text,
            'model_id': cfg['model'],
            'language_code': 'pt',
            'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.25, 'use_speaker_boost': True},
        }).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice']}?output_format=mp3_44100_128",
            data=body,
            headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'},
        )
        try:
            data = urllib.request.urlopen(req).read()
        except urllib.error.HTTPError as e:
            sys.exit(f'{name}: erro {e.code} da ElevenLabs: {e.read().decode("utf-8", "replace")[:300]}')
        f = out / f'{name}.mp3'
        f.write_bytes(data)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout
        print(f'{name}: {float(d):.2f} s')


if __name__ == '__main__':
    main()

"""Create a narrated walkthrough from actual browser screenshots, not a screen recording."""
import json, subprocess
from pathlib import Path

scenes=json.loads(Path('docs/demo/scenes.json').read_text(encoding='utf-8'))
work=Path('.cache/demo');work.mkdir(parents=True,exist_ok=True)
clips=[];total=0;transcript=[]
for i,s in enumerate(scenes):
    speech=work/f'voice-{i}.wav'
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(speech)],text=True))
    duration=max(13,duration+1.5);total+=duration
    (work/f'title-{i}.txt').write_text(s['title'],encoding='utf-8')
    (work/f'caption-{i}.txt').write_text('Actual browser screenshots | Synthetic learner session | bloompath-mcq.vercel.app',encoding='utf-8')
    prefix=f"crop=iw:{s.get('cropH',744)}:0:{s['cropY']}," if 'cropY' in s else ''
    vf=prefix+"scale=1760:850:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:120:color=0xf6f5f0,setsar=1,"+f"drawtext=fontfile='C\\:/Windows/Fonts/segoeuib.ttf':textfile='{work.as_posix()}/title-{i}.txt':fontcolor=0x305349:fontsize=40:x=80:y=35,"+f"drawtext=fontfile='C\\:/Windows/Fonts/segoeui.ttf':textfile='{work.as_posix()}/caption-{i}.txt':fontcolor=0x647468:fontsize=23:x=80:y=1020"
    out=work/f'clip-{i}.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-i','docs/screenshots/'+s['image'],'-i',str(speech),'-vf',vf,'-af','apad','-t',str(duration),'-r','24','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',str(out)],check=True)
    clips.append(out.resolve());transcript.append(f"{s['title']}\n{s['narration']}\n")
    print(f'Rendered scene {i+1}: {duration:.1f}s',flush=True)
(work/'concat.txt').write_text(''.join(f"file '{p.as_posix()}'\n" for p in clips),encoding='utf-8')
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(work/'concat.txt'),'-c','copy','-movflags','+faststart','docs/demo/bloompath-demo.mp4'],check=True)
assert total<180,f'Demo must be under 3 minutes, got {total}s'
Path('docs/demo/transcript.txt').write_text('BloomPath narrated walkthrough\nActual browser screenshots; this is not a continuous screen recording. Narration uses a synthetic Windows voice.\n\n'+'\n'.join(transcript),encoding='utf-8')
print(f'Demo complete: {total:.1f}s',flush=True)

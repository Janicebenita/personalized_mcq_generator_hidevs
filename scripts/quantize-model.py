from pathlib import Path
import shutil, json, hashlib
from onnxruntime.quantization import quantize_dynamic, QuantType
src=Path('.cache/qg-export'); target=Path('public/models/qg-v1'); (target/'onnx').mkdir(parents=True,exist_ok=True)
for p in src.glob('*.json'):shutil.copy2(p,target/p.name)
for name in ['encoder_model','decoder_model_merged']:
 quantize_dynamic(str(src/f'{name}.onnx'),str(target/'onnx'/f'{name}_quantized.onnx'),weight_type=QuantType.QInt8,per_channel=False,reduce_range=False,op_types_to_quantize=['MatMul','Gather'],extra_options={'EnableSubgraph':True})
files=[]
for p in target.rglob('*'):
 if p.is_file():files.append({'path':str(p.relative_to(target)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
Path('docs/model-manifest.json').write_text(json.dumps({'source':'valhalla/t5-small-qg-hl','revision':'9fdee3255929ba5f0b9d45e76e1e0184f664a368','license':'MIT','export':'optimum-onnx 0.1.0; opset17; dynamic int8 MatMul/Gather including decoder subgraphs','files':files},indent=2))
print(json.dumps(files,indent=2))

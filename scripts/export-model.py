"""Optional maintainer step; normal app setup downloads verified release assets."""
from pathlib import Path
from huggingface_hub import snapshot_download
from optimum.exporters.onnx import main_export

revision = "9fdee3255929ba5f0b9d45e76e1e0184f664a368"
source = snapshot_download(
    "valhalla/t5-small-qg-hl", revision=revision,
    allow_patterns=["*.json", "*.model", "pytorch_model.bin", "*.safetensors"],
)
main_export(
    source, output=Path(".cache/qg-export"),
    task="text2text-generation-with-past", opset=17, sequence_length=64,
    atol=1e-4, trust_remote_code=False,
)

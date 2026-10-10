"""CPU-only TripoSR upstream import smoke with a process-only Pillow overlay.

NO model.from_pretrained, no checkpoint load, no CUDA allocation, no inference.
"""
from __future__ import annotations
import json
import os
import sys
import time
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SHADOW=ROOT/"runtime"/"qa"/"g3"/"pillow-shadow"
def run():
    for k,v in {
        "CUDA_VISIBLE_DEVICES":"-1",
        "HF_HUB_OFFLINE":"1",
        "TRANSFORMERS_OFFLINE":"1",
        "HF_HUB_DISABLE_TELEMETRY":"1",
        "DO_NOT_TRACK":"1"
    }.items():
        os.environ[k]=v
    sys.path.insert(0,str(ROOT))
    started=time.perf_counter()
    import PIL
    import numpy as np
    import torch
    import transformers
    from engines.triposr.worker import SOURCE, install_local_import_barriers
    expected_overlay=(SHADOW/"overlay").resolve(strict=True)
    if PIL.__version__!="12.3.0" or not Path(PIL.__file__).resolve().is_relative_to(expected_overlay):
        raise RuntimeError("Missing isolated Pillow shadow overlay")
    install_local_import_barriers(torch,np)
    sys.path.insert(0,str(SOURCE))
    import tsr.models.tokenizers.image as tokenizer
    from tsr.system import TSR
    if not callable(getattr(tokenizer,"hf_hub_download",None)):
        raise RuntimeError("Expected pinned adapter interception point absent")
    if not hasattr(TSR,"from_pretrained"):
        raise RuntimeError("TSR class surface changed")
    if torch.cuda.is_available():
        raise RuntimeError("GPU visibility must be fully disabled in an import-only probe")
    proof={
        "schema":"local3d.g3-6.pillow-triposr-import-only.v1",
        "shadowPillowVersion":PIL.__version__,
        "pinnedTransformersVersion":transformers.__version__,
        "pinnedTorchVersion":torch.__version__,
        "importedPinnedTripoSRSource":True,
        "importedTripoSRTokenizer":True,
        "importedTripoSRSystem":True,
        "cpuOnly":True,
        "torchCudaVisible":False,
        "modelWeightsLoaded":False,
        "modelInferenceExecuted":False,
        "networkModelFetchAttempted":False,
        "noPrintActions":True,
        "importSeconds":round(time.perf_counter()-started,3),
        "qualification":"IMPORT_ONLY_NOT_FULL_INFERENCE_COMPATIBILITY_OR_SECURITY_PROOF"
    }
    out=SHADOW/"shadow-triposr-import.json"
    if out.exists():raise FileExistsError("Do not overwrite earlier import smoke evidence")
    out.write_text(json.dumps(proof,indent=2)+"\n",encoding="utf8")
    print("G36_SHADOW_PINNED_TRIPOSR_IMPORT_PASS "+json.dumps(proof))
if __name__=="__main__":
    if sys.version_info[:2]!=(3,11):raise SystemExit("Windows Python 3.11 required")
    run()

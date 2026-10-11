"""G3.42 read-only post-test private full-venv SHA manifest drift inventory."""
from __future__ import annotations
import json
import os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SNAP=ROOT/"runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages"
MANIFEST=ROOT/"runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json"
if not SNAP.is_dir() or SNAP.is_symlink() or not MANIFEST.is_file():
 raise RuntimeError("G342 missing owned valid original snapshot")
m=json.loads(MANIFEST.read_text(encoding="utf8"))
wanted={a[0] for a in m["files"]}
actual=set()
for base,_,names in os.walk(SNAP,followlinks=False):
 for name in names:actual.add((Path(base)/name).relative_to(SNAP).as_posix())
extra=actual-wanted
missing=wanted-actual
print("G342_POST_QUALITY_SNAPSHOT_FILES_READONLY "+json.dumps({
 "privateManifestFileCount":len(wanted),
 "actualSnapshotFileCount":len(actual),
 "extraFilesAfterClonedPythonCpuTests":len(extra),
 "missingOriginalFiles":len(missing),
 "extraBytecodeFileCount":sum("__pycache__" in x and x.endswith(".pyc") for x in extra),
 "extraOtherFilesCount":sum(not ("__pycache__" in x and x.endswith(".pyc")) for x in extra),
 "noSnapshotWritesPerformed":True
},sort_keys=True))

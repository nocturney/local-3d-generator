# G3.37: only a bounded process-local Pillow12.3 shadow quality subset.
# Does NOT install libraries, activate GPU/G2 or alter a persistent environment.
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$py=Join-Path $root 'runtime\engines\triposr\venv\Scripts\python.exe'
$overlay=Join-Path $root 'runtime\qa\g3\pillow-shadow\overlay'
$script=Join-Path $root 'scripts\g3-37-shadow-pillow-quality-subset.py'
if(-not (Test-Path -LiteralPath $py -PathType Leaf) -or
   -not (Test-Path -LiteralPath (Join-Path $overlay 'PIL\__init__.py') -PathType Leaf) -or
   -not (Test-Path -LiteralPath $script -PathType Leaf)){
 throw 'G3.37 previously installed isolated shadow environment unavailable'
}
$names=@('PYTHONPATH','CUDA_VISIBLE_DEVICES','HF_HUB_OFFLINE','TRANSFORMERS_OFFLINE','L3D_ENABLE_TRIPOSR')
$old=@{}
foreach($name in $names){
 $entry=Get-Item -LiteralPath ('Env:'+$name) -ErrorAction SilentlyContinue
 $old[$name]=if($null -eq $entry){$null}else{$entry.Value}
}
try {
 $env:PYTHONPATH=$overlay+';'+$root
 $env:CUDA_VISIBLE_DEVICES='-1'
 $env:HF_HUB_OFFLINE='1'
 $env:TRANSFORMERS_OFFLINE='1'
 $env:L3D_ENABLE_TRIPOSR='0'
 $version=& $py -c 'import PIL; print(PIL.__version__)'
 if($LASTEXITCODE -ne 0 -or $version -ne '12.3.0'){
  throw 'G3.37 shadow Pillow version mismatch: do not run tests'
 }
 Write-Output ('G337_VERIFIED_SHADOW_PILLOW='+$version)
 & $py $script
 if($LASTEXITCODE -ne 0){throw 'G3.37 curated quality suite failed'}
}finally{
 foreach($name in $names){
  if($null -eq $old[$name]){Remove-Item -LiteralPath ('Env:'+$name) -ErrorAction SilentlyContinue}
  else{Set-Item -LiteralPath ('Env:'+$name) -Value $old[$name]}
 }
}

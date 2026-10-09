import * as THREE from 'three';
import { OrbitControls } from '/vendor/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/vendor/three/examples/jsm/loaders/GLTFLoader.js';

const el = id => document.getElementById(id);
const state = { mode: 'image', image: null, imageUrl: null, jobs: [], selected: null, currentModel: null, lastModelUrl: null, viewer: null };
const stageNames = {
  queued: 'ממתין בתור', demo_intake: 'הדמיה: קליטת קלט',
  demo_processing: 'הדמיה: עיבוד', demo_packaging: 'הדמיה: הכנת GLB',
  fixture_ready: 'Fixture לדוגמה מוכן', cancelled: 'בוטלה', interrupted: 'הופסקה באתחול', error: 'נכשלה'
};
const statusNames = {queued:'בתור',running:'מתבצעת',completed:'הושלמה',cancelled:'בוטלה',interrupted:'הופסקה',failed:'שגיאה'};
let toastTimer;

async function api(url, method = 'GET', body) {
  const res = await fetch(url, { method, headers: body ? {'Content-Type':'application/json'} : {}, body: body ? JSON.stringify(body) : undefined, cache:'no-store' });
  const json = await res.json();
  if (!res.ok) { const e = new Error(json.error?.message || 'Local request failed'); e.code = json.error?.code; throw e; }
  return json;
}
function toast(message) {
  const box = el('toast'); box.textContent = message; box.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('show'), 3300);
}
function readableDate(s) { try { return new Date(s).toLocaleTimeString('he-IL', { hour:'2-digit', minute:'2-digit' }); } catch { return '—'; } }
function selectedJob() { return state.jobs.find(j => j.id === state.selected); }
function sourceName(j) { return j.mode === 'image' ? (j.source?.name || 'תמונה') : (j.prompt ? j.prompt.slice(0, 34) : 'תיאור טקסט'); }

function initViewer() {
  const host = el('canvasHost');
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .02, 100);
    camera.position.set(2.9, 1.9, 3.6);
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xc5f7ed, 0x25384b, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.3); key.position.set(-2, 5, 3); scene.add(key);
    const fill = new THREE.DirectionalLight(0x7ae7e0, 1.4); fill.position.set(3, 1, -2); scene.add(fill);
    const grid = new THREE.GridHelper(6, 18, 0x385b64, 0x253e48); grid.position.y = -1.17; scene.add(grid);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 12;
    controls.target.set(0, .05, 0);
    const render = () => renderer.render(scene, camera);
    controls.addEventListener('change', render);
    function resize() {
      const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.setSize(width, height, false); render();
    }
    new ResizeObserver(resize).observe(host);
    resize();
    const reset = () => { camera.position.set(2.9, 1.9, 3.6); controls.target.set(0,.05,0); controls.update(); render(); };
    function disposeModel() {
      if (!state.currentModel) return;
      scene.remove(state.currentModel);
      state.currentModel.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        mats.forEach(m => m.dispose());
      });
      state.currentModel = null; render();
    }
    const loader = new GLTFLoader();
    function show(url) {
      if (url === state.lastModelUrl) return;
      state.lastModelUrl = url;
      disposeModel();
      if (!url) return;
      loader.load(url, gltf => {
        if (state.lastModelUrl !== url) return;
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center);
        const size = box.getSize(new THREE.Vector3());
        obj.scale.multiplyScalar(2.15 / Math.max(size.x,size.y,size.z, .001));
        scene.add(obj); state.currentModel = obj;
        el('emptyState').hidden = true;
        el('demoWatermark').hidden = false;
        el('viewerStatus').textContent = 'DEMO GLB / READY';
        reset();
      }, undefined, () => {
        el('viewerStatus').textContent = 'GLB / LOAD ERROR';
        el('emptyState').hidden = false;
        toast('הטעינה לתצוגה נכשלה; ניתן עדיין להוריד את הקובץ לבדיקה.');
      });
    }
    state.viewer = { show, reset };
  } catch {
    el('viewerStatus').textContent = 'WEBGL UNAVAILABLE';
    el('emptyState').querySelector('strong').textContent = 'WebGL אינו זמין בדפדפן';
    state.viewer = { show:() => {}, reset:() => {} };
  }
}

function renderHistory() {
  const host = el('history'); host.replaceChildren();
  el('jobCount').textContent = state.jobs.length + ' JOBS';
  if (!state.jobs.length) {
    const empty = document.createElement('div'); empty.className = 'history-empty';
    empty.textContent = 'עדיין אין משימות. ניתן ליצור משימת הדגמה באמצעות התמונה או הטקסט.';
    host.appendChild(empty); return;
  }
  for (const job of state.jobs) {
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'history-item' + (state.selected === job.id ? ' selected' : '');
    const top = document.createElement('div'); top.className = 'history-item-top';
    const name = document.createElement('strong'); name.textContent = sourceName(job);
    const time = document.createElement('time'); time.textContent = readableDate(job.createdAt);
    top.append(name, time);
    const bottom = document.createElement('div'); bottom.className = 'history-item-bottom';
    const label = document.createElement('span'); label.className = 'hist-label';
    const dot = document.createElement('i'); dot.className = 'hist-dot ' + job.status;
    const status = document.createElement('span'); status.textContent = statusNames[job.status] || job.status;
    label.append(dot, status);
    const id = document.createElement('span'); id.textContent = job.id.slice(0, 8).toUpperCase(); id.dir = 'ltr';
    bottom.append(label, id); b.append(top,bottom);
    b.addEventListener('click', () => { state.selected = job.id; render(); });
    host.appendChild(b);
  }
}
function renderSelected() {
  const job = selectedJob();
  el('metricStatus').textContent = job ? statusNames[job.status] || job.status : 'אין משימה';
  el('metricProgress').textContent = job ? job.progress + '%' : '—';
  el('metricOutput').textContent = job?.status === 'completed' ? 'GLB' : '—';
  el('selectedJobId').textContent = job ? job.id.slice(0, 13).toUpperCase() : 'NO JOB SELECTED';
  el('detailMessage').textContent = job ? (stageNames[job.stage] || job.stage) + ' · תוצאה לדוגמה בלבד, לא רינדור AI' : 'לא נוצרה משימה עדיין.';
  el('progressFill').style.width = (job?.progress || 0) + '%';
  el('cancelJob').disabled = !(job && ['queued','running'].includes(job.status));
  el('copyManifest').disabled = !job;
  const ready = job?.status === 'completed' && job.assets.some(a => a.id === 'preview-glb');
  for (const id of ['downloadModel','downloadReport']) {
    const anchor = el(id); anchor.setAttribute('aria-disabled', ready ? 'false' : 'true');
    anchor.href = ready ? '/v1/jobs/' + encodeURIComponent(job.id) + '/assets/' + (id === 'downloadModel' ? 'preview-glb' : 'qa-report') : '#';
  }
  const source = el('viewSource');
  const hasSource = !!(job && job.assets.some(a => a.id === 'source-image'));
  source.setAttribute('aria-disabled', hasSource ? 'false' : 'true');
  source.href = hasSource ? '/v1/jobs/' + encodeURIComponent(job.id) + '/assets/source-image' : '#';
  if (!ready) {
    state.viewer?.show(null);
    el('emptyState').hidden = false; el('demoWatermark').hidden = true;
    el('viewerStatus').textContent = job ? 'DEMO / ' + job.status.toUpperCase() : 'READY / NO MODEL';
  } else {
    state.viewer?.show('/v1/jobs/' + encodeURIComponent(job.id) + '/assets/preview-glb');
  }
}
function render() { renderHistory(); renderSelected(); }
async function refresh() {
  try {
    const result = await api('/v1/jobs');
    state.jobs = result.jobs;
    if (!state.selected && state.jobs.length) state.selected = state.jobs[0].id;
    render();
    el('healthStatus').textContent = 'READY'; el('hostStatus').textContent = '127.0.0.1';
  } catch {
    el('healthStatus').textContent = 'OFFLINE'; el('hostStatus').textContent = 'DISCONNECTED';
  }
}

function setMode(mode) {
  state.mode = mode;
  el('imageMode').classList.toggle('active', mode === 'image');
  el('textMode').classList.toggle('active', mode === 'text');
  el('imageControls').hidden = mode !== 'image';
  el('promptRequirement').textContent = mode === 'text' ? 'חובה' : 'אופציונלי';
  el('formError').textContent = '';
}
function chooseImage(file) {
  if (!file) return;
  if (file.size > 8 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(file.type)) {
    el('formError').textContent = 'התמונה צריכה להיות PNG, JPG או WebP ועד 8MB.'; return;
  }
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  state.image = file; state.imageUrl = URL.createObjectURL(file);
  el('inputPreview').src = state.imageUrl; el('inputPreview').hidden = false;
  el('dropzone').classList.add('has-image');
  el('fileNote').textContent = file.name;
  el('clearImage').hidden = false;
  el('formError').textContent = '';
}
function clearImage() {
  state.image = null;
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  state.imageUrl = null; el('inputPreview').removeAttribute('src');
  el('inputPreview').hidden = true; el('dropzone').classList.remove('has-image');
  el('fileNote').textContent = 'עד 8MB · הקובץ נשאר מקומי';
  el('imageInput').value = ''; el('clearImage').hidden = true;
}
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
async function startJob() {
  const b = el('startJob'); el('formError').textContent = '';
  if (state.mode === 'image' && !state.image) { el('formError').textContent = 'בחר תמונת מקור כדי להתחיל.'; return; }
  if (state.mode === 'text' && el('prompt').value.trim().length < 3) { el('formError').textContent = 'הזן תיאור של שלושה תווים לפחות.'; return; }
  b.disabled = true;
  try {
    const payload = { providerId:'fixture-demo', mode:state.mode, prompt:el('prompt').value.trim() };
    if (state.mode === 'image') payload.image = {
      filename:state.image.name, mime:state.image.type, base64:await toBase64(state.image)
    };
    const job = await api('/v1/jobs','POST',payload);
    state.selected = job.id; toast('נוצרה משימת DEMO. היא אינה מריצה מודל AI.');
    await refresh();
  } catch (e) { el('formError').textContent = (e.code ? e.code + ': ' : '') + e.message; }
  finally { b.disabled = false; }
}
async function cancelJob() {
  const job = selectedJob();
  if (!job || !['queued','running'].includes(job.status)) return;
  try {
    await api('/v1/jobs/' + encodeURIComponent(job.id) + '/cancel','POST');
    toast('המשימה בוטלה. אין תהליך GPU שרץ ברקע.');
    await refresh();
  } catch(e) { toast('לא ניתן לבטל: ' + e.message); }
}
el('imageMode').addEventListener('click', () => setMode('image'));
el('textMode').addEventListener('click', () => setMode('text'));
el('imageInput').addEventListener('change', e => chooseImage(e.target.files?.[0]));
el('dropzone').addEventListener('click', () => el('imageInput').click());
el('dropzone').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el('imageInput').click(); } });
el('dropzone').addEventListener('dragover', e => { e.preventDefault(); el('dropzone').classList.add('dragover'); });
el('dropzone').addEventListener('dragleave', () => el('dropzone').classList.remove('dragover'));
el('dropzone').addEventListener('drop', e => { e.preventDefault(); el('dropzone').classList.remove('dragover'); chooseImage(e.dataTransfer?.files?.[0]); });
el('clearImage').addEventListener('click', clearImage);
el('startJob').addEventListener('click', startJob);
el('cancelJob').addEventListener('click', cancelJob);
el('refresh').addEventListener('click', refresh);
el('resetCamera').addEventListener('click', () => state.viewer?.reset());
el('copyManifest').addEventListener('click', async () => {
  const job = selectedJob(); if (!job) return;
  try { await navigator.clipboard.writeText(JSON.stringify(job,null,2)); toast('Manifest הועתק ללוח.'); }
  catch { toast('לא ניתן לגשת ללוח ההעתקה בדפדפן.'); }
});
initViewer();
await refresh();
setInterval(refresh, 1000);

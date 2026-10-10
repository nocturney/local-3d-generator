import * as THREE from 'three';
import { OrbitControls } from '/vendor/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/vendor/three/examples/jsm/loaders/GLTFLoader.js';

const el = id => document.getElementById(id);
const state = { mode: 'image', provider: 'fixture-demo', providers: [], image: null, imageUrl: null, jobs: [], selected: null, currentModel: null, lastModelUrl: null, viewer: null };
const stageNames = {
  queued: 'ממתין בתור', demo_intake: 'הדמיה: קליטת קלט',
  demo_processing: 'הדמיה: עיבוד', demo_packaging: 'הדמיה: הכנת GLB',
  fixture_ready: 'Fixture לדוגמה מוכן', cancelled: 'בוטלה', interrupted: 'הופסקה באתחול', error: 'נכשלה',
  g2_gpu_guard: 'אימות עומס GPU ו־Office', g2_verify_sources: 'אימות קוד ומודל מקומיים',
  g2_preprocess_image: 'בדיקת קובץ התמונה לפני הפעלת GPU',
  g2_loading_model: 'טעינת TripoSR לכרטיס המסך', g2_infer_image: 'יצירת מודל מתוך התמונה',
  g2_extract_mesh: 'חילוץ רשת תלת־ממדית', g2_export_glb: 'יצוא GLB', g2_completed: 'אימות התוצר',
  g2_ready_draft: 'תוצר AI מקומי מוכן · DRAFT', g2_stopping_worker: 'עצירת תהליך GPU'
};
const statusNames = {queued:'בתור',running:'מתבצעת',cancelling:'נעצרת',completed:'הושלמה',cancelled:'בוטלה',interrupted:'הופסקה',failed:'שגיאה'};
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
    function show(url, real = false) {
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
        el('demoWatermark').textContent = real ? 'REAL LOCAL AI · DRAFT / NOT PRINT QUALIFIED' : 'DEMO FIXTURE · NOT AI GENERATED';
        el('viewerStatus').textContent = real ? 'REAL AI / DRAFT' : 'DEMO GLB / READY';
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
  el('metricProvider').textContent = job?.providerId === 'triposr-local' ? 'TripoSR Local' : 'Fixture Lab';
  el('selectedJobId').textContent = job ? job.id.slice(0, 13).toUpperCase() : 'NO JOB SELECTED';
  el('detailMessage').textContent = job ? (stageNames[job.stage] || job.stage) +
    (job.simulation ? ' · תוצאת הדגמה ללא AI' : ' · הרצת AI מקומית ידנית · ללא אישור הדפסה') : 'לא נוצרה משימה עדיין.';
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
    el('viewerStatus').textContent = job ? (job.simulation ? 'DEMO / ' : 'LOCAL AI / ') + job.status.toUpperCase() : 'READY / NO MODEL';
  } else {
    state.viewer?.show('/v1/jobs/' + encodeURIComponent(job.id) + '/assets/preview-glb', !job.simulation);
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
  if (mode === 'text' && state.provider === 'triposr-local') {
    setProvider('fixture-demo');
    toast('TripoSR מקבל תמונה בלבד; תיאור טקסט אינו מנוע יצירה.');
  }
  state.mode = mode;
  el('imageMode').classList.toggle('active', mode === 'image');
  el('textMode').classList.toggle('active', mode === 'text');
  el('imageControls').hidden = mode !== 'image';
  el('promptRequirement').textContent = mode === 'text' ? 'חובה' : 'אופציונלי';
  el('formError').textContent = '';
}
function setProvider(id) {
  if (id === 'triposr-local' && !state.providers.some(p => p.id === id && p.canStart)) return;
  if (!['fixture-demo','triposr-local'].includes(id)) return;
  state.provider = id;
  if (id === 'triposr-local' && state.mode === 'text') setMode('image');
  el('providerFixture').classList.toggle('active-provider', id === 'fixture-demo');
  el('providerTripo').classList.toggle('active-provider', id === 'triposr-local');
  el('providerFixture').setAttribute('aria-pressed', id === 'fixture-demo' ? 'true' : 'false');
  el('providerTripo').setAttribute('aria-pressed', id === 'triposr-local' ? 'true' : 'false');
  el('gpuConsentWrap').hidden = id !== 'triposr-local';
  el('gpuConsent').checked = false;
  el('startJobLabel').textContent = id === 'triposr-local' ? 'צור מודל אמיתי (GPU)' : 'צור משימת DEMO';
  el('promptHint').textContent = id === 'triposr-local'
    ? 'TripoSR משתמש בתמונה בלבד. ההערות נשמרות במניפסט, אך אינן משפיעות על הגאומטריה.'
    : 'ב־G1 הטקסט נשמר למשימה בלבד ואינו משפיע על הגאומטריה.';
  el('formError').textContent = '';
}
async function loadProviders() {
  try {
    const data = await api('/v1/providers');
    state.providers = data.providers || [];
    const real = state.providers.find(p => p.id === 'triposr-local');
    el('providerTripo').disabled = !real?.canStart;
    el('providerTripo').classList.toggle('unavailable', !real?.canStart);
    el('triposrState').textContent = real?.canStart ? 'ידני · זמין' : 'כבוי';
    el('realProviderHealth').textContent = real?.canStart ? 'G2 · באישור בלבד' : 'כבוי (G1)';
    el('sessionBadge').textContent = real?.canStart ? 'G2 · MANUAL ONLY' : 'G1 · DEMO MODE';
    el('noticeVersion').textContent = real?.canStart ? 'v0.2.0 / G2' : 'v0.2.0 / G1';
    el('footerBuild').textContent = real?.canStart ? 'LOCAL3D / G2 MANUAL BUILD' : 'LOCAL3D / G1 DEVELOPMENT BUILD';
    if (real?.canStart) {
      el('noticeText').textContent = 'G2 בהרשאה ידנית: TripoSR משתמש ב־GPU רק אחרי בחירה ואישור לכל משימה. אין תור AI אוטונומי. המודלים הם DRAFT ואינם מאושרים להדפסה.';
    } else {
      el('noticeText').textContent = 'מצב G1: מודל DEMO בלבד. TripoSR הותקן בנפרד אך אינו מופעל במשימות. אין פעילות GPU אוטומטית.';
      setProvider('fixture-demo');
    }
  } catch {
    state.providers = [];
    el('providerTripo').disabled = true;
    setProvider('fixture-demo');
  }
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
  if (state.provider === 'triposr-local' && !el('gpuConsent').checked) {
    el('formError').textContent = 'יש לאשר במפורש הפעלת GPU עבור משימה זו.';
    return;
  }
  b.disabled = true;
  try {
    const payload = { providerId:state.provider, mode:state.mode, prompt:el('prompt').value.trim() };
    if (state.provider === 'triposr-local') payload.confirmGpu = true;
    if (state.mode === 'image') payload.image = {
      filename:state.image.name, mime:state.image.type, base64:await toBase64(state.image)
    };
    const job = await api('/v1/jobs','POST',payload);
    state.selected = job.id;
    if (state.provider === 'triposr-local') {
      el('gpuConsent').checked = false;
      toast('המשימה נשלחה לבדיקת עומס GPU. אין תור רקע אוטומטי.');
    } else toast('נוצרה משימת DEMO. היא אינה מריצה מודל AI.');
    await refresh();
  } catch (e) { el('formError').textContent = (e.code ? e.code + ': ' : '') + e.message; }
  finally { b.disabled = false; }
}
async function cancelJob() {
  const job = selectedJob();
  if (!job || !['queued','running'].includes(job.status)) return;
  try {
    await api('/v1/jobs/' + encodeURIComponent(job.id) + '/cancel','POST');
    toast(job.providerId === 'triposr-local'
      ? 'נשלחה בקשה לעצירת GPU. המשימה תסומן מבוטלת לאחר סיום התהליך.'
      : 'משימת ה־DEMO בוטלה.');
    await refresh();
  } catch(e) { toast('לא ניתן לבטל: ' + e.message); }
}
el('providerFixture').addEventListener('click', () => setProvider('fixture-demo'));
el('providerTripo').addEventListener('click', () => setProvider('triposr-local'));
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
await loadProviders();
await refresh();
setInterval(refresh, 1000);

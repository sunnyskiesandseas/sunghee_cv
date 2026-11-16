(function () {
  'use strict';
  const KEY = window.SITE_DRAFT_KEY || 'sunghee-portfolio-draft-v3';
  const copy = value => JSON.parse(JSON.stringify(value));
  const original = copy(window.SITE_CONTENT);
  let data = copy(original), active = 'profile', dirty = false, toastTimer;
  const sectionInfo = {
    profile: ['소개 · 사진 · 링크', '첫 화면의 소개와 연락처, 사진을 수정합니다. LinkedIn 주소가 있으면 프로필 전체 URL을 입력해 주세요.'],
    themes: ['연구 관심사', '첫 화면 아래에 표시할 연구 주제와 짧은 설명입니다.'],
    methods: ['연구 방법', '각 방법을 한 줄에 하나씩 입력해 주세요.'],
    projects: ['프로젝트', '프로젝트 요약과 상세 설명, 연구 질문, 참여 역할을 수정합니다. 관련 항목은 아래에 안내된 ID를 한 줄에 하나씩 입력해 연결합니다.'],
    publications: ['논문 · 보고서', '게재, 수정 제출, 심사 중 등 원고의 상태를 정확히 입력해 주세요. 논문 링크는 DOI 또는 공식 페이지 주소를 넣을 수 있습니다.'],
    education: ['학력', '학교, 학위, 기간과 세부 설명을 수정합니다.'],
    experience: ['경력', '연구, 교육 및 기타 업무 경험을 수정합니다.'],
    talks: ['발표', '발표 제목, 학회, 일시와 장소를 수정합니다.'],
    awards: ['수상 · 장학금', '수상 내역과 장학금, 기관 및 연도를 수정합니다.'],
    help: ['수정본 반영 방법', '초안 저장, 다운로드, 실제 웹사이트 업데이트 방법을 안내합니다.']
  };
  const labels = {
    name: '영문 이름', koreanName: '한글 이름', pronouns: '대명사 (선택)', role: '연구자 소개 한 줄', affiliation: '소속', location: '지역', email: '연락 이메일', linkedinUrl: 'LinkedIn URL', labUrl: '현재 연구실 URL', labName: '현재 연구실 표시 이름', cvUrl: 'CV 링크 또는 PDF', photo: '사진 URL 또는 이미지 데이터', photoAlt: '사진 대체 텍스트', heroTitle: '첫 화면 제목', intro: '첫 화면 소개', about: 'About 소개 문단', contactText: '연락 영역 소개', updated: '최근 업데이트 표시', description: '상세 설명', title: '제목', subtitle: '부제', period: '기간', status: '상태', type: '유형', number: '표시 번호', summary: '짧은 요약', question: '연구 질문', contribution: '참여 역할 · 기여', context: '구성 · 연구 맥락', output: '연구 결과물', methods: '연구 방법', relatedTalks: '관련 발표 ID', relatedPublications: '관련 논문 ID', url: '관련 외부 링크', authors: '저자', year: '연도', category: '구분', venue: '학술지 · 발행 기관', recognition: '수상 · 관련 인정', institution: '학교', degree: '학위', organization: '소속 · 기관', event: '학회 · 행사', date: '발표 일시', id: '고유 ID (연결에 사용)'
  };
  const longFields = new Set(['heroTitle','intro','about','contactText','description','summary','question','contribution','context','output','authors','venue','recognition','degree','title','subtitle','photo','cvUrl']);
  const templates = {
    themes: {name:'New research interest',description:''},
    projects: {id:'',title:'New project',subtitle:'',period:'',status:'Ongoing',type:'',number:'',summary:'',description:'',question:'',contribution:'',methods:[],context:'',output:'',relatedTalks:[],relatedPublications:[],url:''},
    publications: {id:'',title:'New publication',authors:'',year:'',status:'',category:'Journal article',venue:'',summary:'',description:'',contribution:'',methods:[],recognition:'',relatedTalks:[],url:''},
    education: {institution:'New institution',degree:'',period:'',description:''},
    experience: {title:'New experience',organization:'',period:'',description:''},
    talks: {id:'',title:'New presentation',event:'',date:'',location:'',status:''},
    awards: {title:'New award',organization:'',year:''}
  };
  const byId = id => document.getElementById(id);
  function element(tag, className, textValue) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textValue !== undefined) el.textContent = textValue;
    return el;
  }
  function toast(message, error) {
    const box = byId('toast'); box.textContent = message; box.hidden = false;
    box.style.background = error ? '#873b30' : '#30382f';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { box.hidden = true; }, error ? 10000 : 6000);
  }
  function changed() { dirty = true; byId('save-status').textContent = '저장하지 않은 변경사항이 있습니다.'; }
  function load() {
    try {
      const draft = localStorage.getItem(KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && parsed.profile && Array.isArray(parsed.projects)) {
          data = window.sanitizePortfolioContent(parsed); byId('save-status').textContent = '이 브라우저에 저장한 초안을 불러왔습니다.';
        }
      }
    } catch (error) { toast('이 브라우저의 초안을 불러올 수 없어 배포본을 열었습니다. 파일 다운로드는 사용할 수 있습니다.', true); }
  }
  function field(parent, obj, key, path) {
    const value = obj[key];
    if (Array.isArray(value) && value.some(v => v && typeof v === 'object')) {
      const group = element('fieldset'); group.append(element('legend','',labels[key] || key));
      value.forEach((item,index) => Object.keys(item).forEach(k => field(group,item,k,path+'-'+index)));
      parent.append(group); return;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const group = element('fieldset'); group.append(element('legend','',labels[key] || key));
      Object.keys(value).forEach(k => field(group,value,k,path+'-'+key)); parent.append(group); return;
    }
    const container = element('label','field');
    const label = element('span','field-label',path.startsWith('themes-') && key === 'name' ? '연구 주제' : (labels[key] || key)); container.append(label);
    let input;
    if (typeof value === 'boolean') {
      input = document.createElement('input'); input.type = 'checkbox'; input.checked = value;
      input.addEventListener('change', () => { obj[key] = input.checked; changed(); });
    } else {
      const array = Array.isArray(value);
      input = document.createElement(array || longFields.has(key) ? 'textarea' : 'input');
      if (input.tagName === 'INPUT') input.type = key === 'email' ? 'email' : 'text';
      input.value = array ? value.join(key === 'about' ? '\n\n' : '\n') : String(value ?? '');
      if (array) input.rows = Math.max(3, Math.min(8,value.length + 1));
      if (key === 'id') { input.readOnly = true; input.title = '관련 항목 연결을 유지하기 위해 자동 생성된 ID를 사용합니다.'; }
      if (key === 'photo' || key === 'cvUrl') { input.classList.add('tiny'); if (input.value.startsWith('data:')) { input.value = ''; input.placeholder = '업로드한 파일이 포함되어 있습니다. 다른 URL로 바꾸려면 입력하세요.'; } }
      input.addEventListener('input', () => {
        if (array) obj[key] = input.value.split(key === 'about' ? /\n\s*\n/ : /\n/).map(s => s.trim()).filter(Boolean);
        else obj[key] = typeof value === 'number' ? Number(input.value) : input.value;
        changed();
      });
    }
    input.id = 'field-'+path+'-'+key; container.append(input);
    if (key === 'relatedTalks') container.append(element('small','', '사용 가능한 발표 ID: ' + (data.talks || []).map(t => t.id).join(', ') + ' · 한 줄에 하나씩 입력'));
    else if (key === 'relatedPublications') container.append(element('small','', '사용 가능한 논문 ID: ' + (data.publications || []).map(t => t.id).join(', ') + ' · 한 줄에 하나씩 입력'));
    else if (Array.isArray(value)) container.append(element('small','',key === 'about' ? '문단 사이는 빈 줄로 구분합니다.' : '한 줄에 하나씩 입력합니다.'));
    else if (key === 'id') container.append(element('small','', '새 항목을 만들면 ID가 자동 생성됩니다. 연결된 항목을 유지하기 위해 ID는 고정됩니다.'));
    else if (key === 'linkedinUrl') { input.placeholder = 'https://www.linkedin.com/in/your-profile/'; container.append(element('small','','비워 두면 링크가 표시되지 않습니다.')); }
    parent.append(container);
  }
  function fileAsDataURL(file) { return new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(new Error('파일을 읽지 못했습니다.')); reader.readAsDataURL(file); }); }
  async function photoData(file) {
    const raw = await fileAsDataURL(file);
    return new Promise((resolve,reject) => {
      const image = new Image(); image.onload=()=>{
        const scale=Math.min(1,1200/Math.max(image.width,image.height));
        const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
        const ctx=canvas.getContext('2d'); if (!ctx) { resolve(raw); return; }
        ctx.fillStyle='#f8f5ee';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.87));
      };image.onerror=()=>reject(new Error('이 이미지 형식은 열 수 없습니다. JPG, PNG 또는 WebP를 사용해 주세요.'));image.src=raw;
    });
  }
  function mediaControls(parent) {
    const box=element('section','media-box');box.append(element('h3','','사진 위젯'));
    const grid=element('div','media-grid');
    if (data.profile.photo && /^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/|\.?\.?\/|assets\/)/i.test(data.profile.photo)) {
      const image=element('img','portrait');image.src=data.profile.photo;image.alt=data.profile.photoAlt || '프로필 사진 미리보기';grid.append(image);
    } else grid.append(element('div','portrait-placeholder','SL'));
    const controls=element('div');controls.append(element('p','','JPG, PNG, WebP 또는 GIF · 최대 4MB. 사진은 긴 변 1,200px 이하의 JPEG로 저장됩니다. GIF는 정지 사진으로 변환됩니다.'));
    const label=element('label','file-label','프로필 사진 선택');const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,image/gif';
    input.addEventListener('change',async()=>{
      const f=input.files[0];if(!f)return;
      if(f.size>4*1024*1024){toast('사진은 4MB 이하로 선택해 주세요.',true);return;}
      try { data.profile.photo=await photoData(f);changed();render();toast('사진을 추가했습니다. 초안 저장 또는 다운로드를 눌러 보관해 주세요.'); } catch(error){toast(error.message,true);}
    });label.append(input);controls.append(label);
    const remove=element('button','small-btn','사진 지우기');remove.type='button';remove.addEventListener('click',()=>{data.profile.photo='';changed();render();});controls.append(remove);grid.append(controls);box.append(grid);parent.append(box);
    const cv=element('section','media-box');cv.append(element('h3','','CV PDF 교체'));cv.append(element('p','','새 CV를 선택하면 수정본에 PDF가 포함됩니다. 최대 8MB. 큰 PDF는 브라우저 임시 저장 용량을 초과할 수 있으므로 ZIP으로 내려받아 보관하세요.'));
    const cvlabel=element('label','file-label','CV 파일 선택');const cvinput=document.createElement('input');cvinput.type='file';cvinput.accept='application/pdf,.pdf';
    cvinput.addEventListener('change',async()=>{const f=cvinput.files[0];if(!f)return;if(f.size>8*1024*1024){toast('CV는 8MB 이하 PDF를 선택해 주세요.',true);return;}try{const bytes=new Uint8Array(await f.slice(0,5).arrayBuffer());if(new TextDecoder().decode(bytes)!=='%PDF-')throw new Error('유효한 PDF 파일을 선택해 주세요.');data.profile.cvUrl=String(await fileAsDataURL(f)).replace(/^data:[^;,]*(?:;[^,]*)?,/, 'data:application/pdf;base64,');changed();render();toast('새 CV를 추가했습니다. 다운로드할 수정본에 포함됩니다.');}catch(error){toast(error.message,true);}});cvlabel.append(cvinput);cv.append(cvlabel);if(data.profile.cvUrl.startsWith('data:application/pdf'))cv.append(element('p','','✓ 업로드한 PDF가 수정본에 포함되어 있습니다.'));parent.append(cv);
  }
  function renderNav() {
    const nav=byId('section-nav');nav.replaceChildren();
    Object.entries(sectionInfo).forEach(([key,info])=>{const b=element('button','',info[0]);b.type='button';b.setAttribute('aria-current',String(active===key));b.addEventListener('click',()=>{active=key;render();byId('editor-main').focus({preventScroll:true});});nav.append(b);});
    nav.append(element('small','','배포본을 바꾸려면 수정 파일을 반영해야 합니다. 브라우저 초안은 다른 기기와 공유되지 않습니다.'));
  }
  function newItem(section) {
    const item=copy(templates[section] || {});
    if('id'in item)item.id=section.slice(0,4)+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
    if('number'in item)item.number=String(data[section].length+1).padStart(2,'0');
    data[section].push(item);changed();render();
    const records=byId('editor-main').querySelectorAll('details.record');const last=records[records.length-1];if(last){last.open=true;last.scrollIntoView({behavior:'auto',block:'center'});}
  }
  function removeItem(section,index) {
    const item=data[section][index];const label=item.title || item.name || item.institution || '이 항목';
    if(!confirm('“'+label+'”을(를) 삭제할까요? 연결된 관련 논문·발표 참조도 함께 제거됩니다. 배포본에는 아직 반영되지 않습니다.'))return;
    data[section].splice(index,1);
    if(item.id && (section==='talks'||section==='publications')){
      const relation=section==='talks'?'relatedTalks':'relatedPublications';
      ['projects','publications'].forEach(key=>(data[key]||[]).forEach(record=>{if(Array.isArray(record[relation]))record[relation]=record[relation].filter(id=>id!==item.id);}));
    }
    changed();render();
  }
  function renderHelp(parent) {
    const help=element('div','help');help.append(element('h3','','1. 수정하고 미리보기'));
    help.append(element('p','','내용을 바꾸고 ‘초안 저장’을 누르세요. 초안은 현재 기기의 브라우저에만 보관됩니다. ‘초안 미리보기’는 저장한 초안을 새 탭에서 보여 줍니다. 일반 방문자는 배포본을 봅니다.'));
    help.append(element('h3','','2. 수정본 다운로드'));
    help.append(element('p','','‘content.js 다운로드’는 텍스트·링크·업로드한 사진·CV 데이터가 들어 있는 파일을 저장합니다. ‘웹사이트 ZIP 다운로드’는 현재 초안이 적용된 전체 사이트 파일을 내려받습니다. ZIP 다운로드는 사이트를 웹 주소로 열었을 때 사용할 수 있습니다.'));
    help.append(element('h3','','3. 실제 사이트에 반영'));
    const ol=element('ol');ol.append(element('li','','이 ChatGPT에서 운영하는 사이트: 내려받은 content.js 파일을 첨부하고 현재 사이트에 적용해 달라고 요청하세요. 이 편집 화면 자체는 배포 권한을 갖지 않습니다.'));ol.append(element('li','','GitHub Pages에서 운영하는 사이트: 저장소의 content.js를 내려받은 파일로 교체하고 Commit changes를 누르세요. 사이트 파일은 저장소 최상위에 두면 됩니다.'));ol.append(element('li','','새로 무료 운영 시작: ZIP을 풀어 GitHub의 공개 저장소에 올린 뒤 Settings → Pages → Deploy from a branch → main / (root)를 선택하세요. 자세한 단계는 ZIP의 README를 확인하세요.'));help.append(ol);
    const link=element('a','','GitHub Pages 공식 시작 안내 ↗');link.href='https://docs.github.com/en/pages/quickstart';link.target='_blank';link.rel='noopener noreferrer';help.append(link);
    help.append(element('p','','사진과 링크를 설정한 뒤 내려받은 파일을 백업해 두면 다른 기기에서도 이어서 사용할 수 있습니다. 이 페이지는 임시 초안을 배포하지 않으며 비밀번호나 외부 유료 서비스가 필요하지 않습니다.'));parent.append(help);
    const reset=element('button','danger','브라우저 초안 삭제 · 배포본으로 되돌리기');reset.type='button';reset.addEventListener('click',()=>{if(!confirm('이 브라우저의 초안과 현재 편집 내용을 삭제할까요? 내려받지 않은 변경사항은 사라집니다. 실제 배포본은 바뀌지 않습니다.'))return;try{localStorage.removeItem(KEY);}catch(error){}data=copy(original);dirty=false;byId('save-status').textContent='배포본으로 돌아왔습니다.';render();toast('이 브라우저의 초안을 삭제했습니다.');});parent.append(reset);
  }
  function render() {
    renderNav();const parent=byId('editor-main');parent.replaceChildren();const info=sectionInfo[active] || [active,''];parent.append(element('h2','',info[0]),element('p','section-desc',info[1]));
    if(active==='help'){renderHelp(parent);return;}
    if(active==='profile'){mediaControls(parent);Object.keys(data.profile).forEach(key=>field(parent,data.profile,key,'profile'));return;}
    if(active==='methods'){const holder={methods:data.methods};field(parent,holder,'methods','global');const area=parent.querySelector('textarea');area.addEventListener('input',()=>{data.methods=holder.methods;});return;}
    const records=Array.isArray(data[active])?data[active]:[];
    records.forEach((record,index)=>{const details=element('details','record');const title=record.title||record.name||record.institution||'Untitled';details.append(element('summary','',String(index+1).padStart(2,'0')+' · '+title));const body=element('div','record-body');Object.keys(record).forEach(key=>field(body,record,key,active+'-'+index));const controls=element('div','record-controls');const remove=element('button','danger','항목 삭제');remove.type='button';remove.addEventListener('click',()=>removeItem(active,index));controls.append(remove);body.append(controls);details.append(body);parent.append(details);});
    const add=element('button','add','＋ 항목 추가');add.type='button';add.addEventListener('click',()=>newItem(active));parent.append(add);
  }
  function validate() {
    const errors=[];
    if(!String(data.profile.name||'').trim())errors.push('영문 이름을 입력해 주세요.');
    const email=String(data.profile.email||'').trim();if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.push('이메일 주소 형식을 확인해 주세요.');
    ['projects','publications','talks'].forEach(section=>{const seen=new Set();(data[section]||[]).forEach(item=>{if(!item.id||!/^[a-z0-9][a-z0-9_-]*$/i.test(item.id))errors.push(section+' 항목의 고유 ID가 비어 있거나 올바르지 않습니다.');if(seen.has(item.id))errors.push('중복된 ID: '+item.id);seen.add(item.id);});});
    const talks=new Set((data.talks||[]).map(t=>t.id)),pubs=new Set((data.publications||[]).map(p=>p.id));
    ['projects','publications'].forEach(section=>(data[section]||[]).forEach(record=>{(record.relatedTalks||[]).forEach(id=>{if(!talks.has(id))errors.push('존재하지 않는 발표 ID: '+id);});(record.relatedPublications||[]).forEach(id=>{if(!pubs.has(id))errors.push('존재하지 않는 논문 ID: '+id);});}));
    const profile=data.profile;
    ['linkedinUrl','labUrl'].forEach(key=>{if(profile[key]&&!/^https?:\/\//i.test(profile[key]))errors.push((labels[key]||key)+'는 https:// 또는 http://로 시작해야 합니다.');});
    ['projects','publications'].forEach(section=>(data[section]||[]).forEach(record=>{if(record.url&&!/^https?:\/\//i.test(record.url))errors.push('외부 링크는 https:// 또는 http://로 시작해야 합니다: '+record.title);}));
    if(errors.length){toast(errors.slice(0,4).join(' '),true);return false;}return true;
  }
  function saveDraft() {
    if(!validate())return false;
    try{localStorage.setItem(KEY,JSON.stringify(data));dirty=false;byId('save-status').textContent='이 브라우저에 초안 저장 완료 · 실제 사이트는 변경되지 않았습니다.';toast('초안을 이 브라우저에 저장했습니다. 배포본 반영은 다운로드 후 진행해 주세요.');return true;}
    catch(error){toast('브라우저 임시 저장 용량이 부족하거나 저장이 차단되었습니다. content.js 또는 ZIP으로 내려받아 보관해 주세요. 큰 CV를 링크로 바꾸면 임시 저장이 가능할 수 있습니다.',true);return false;}
  }
  function contentSource(){return 'window.SITE_CONTENT = '+JSON.stringify(data,null,2)+';\n';}
  function download(blob,name){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  const enc=new TextEncoder();
  const crcTable=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):(c>>>1);crcTable[n]=c>>>0;}
  function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}
  function zipStore(files){
    const local=[],central=[];let offset=0;
    const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),dosDate=((Math.max(1980,now.getFullYear())-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    for(const file of files){const name=enc.encode(file.name),bytes=file.bytes,crc=crc32(bytes);const head=new Uint8Array(30+name.length),v=new DataView(head.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(10,dosTime,true);v.setUint16(12,dosDate,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);head.set(name,30);local.push(head,bytes);
      const dir=new Uint8Array(46+name.length),d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(12,dosTime,true);d.setUint16(14,dosDate,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);dir.set(name,46);central.push(dir);offset+=head.length+bytes.length;
    }
    const size=central.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),view=new DataView(end.buffer);view.setUint32(0,0x06054b50,true);view.setUint16(8,files.length,true);view.setUint16(10,files.length,true);view.setUint32(12,size,true);view.setUint32(16,offset,true);return new Blob([...local,...central,end],{type:'application/zip'});
  }
  async function exportZip(){
    if(!validate())return;
    if(location.protocol==='file:'){toast('전체 ZIP은 웹 주소로 사이트를 열었을 때 내려받을 수 있습니다. 지금은 content.js를 내려받아 기존 파일과 교체해 주세요.',true);return;}
    const button=byId('export-zip');button.disabled=true;button.textContent='ZIP 준비 중…';
    try{
      const response=await fetch('./site-files.json',{cache:'no-store'});if(!response.ok)throw new Error('사이트 파일 목록을 불러오지 못했습니다.');const manifest=await response.json();const paths=Array.isArray(manifest)?manifest:manifest.files;
      if(!Array.isArray(paths)||!paths.length)throw new Error('사이트 파일 목록 형식이 올바르지 않습니다.');
      const files=await Promise.all(paths.map(async path=>{if(typeof path!=='string'||path.startsWith('/')||path.includes('..')||/^[a-z]+:/i.test(path))throw new Error('안전하지 않은 파일 경로가 포함되어 있습니다.');if(path==='content.js')return{name:path,bytes:enc.encode(contentSource())};const r=await fetch('./'+path,{cache:'no-store'});if(!r.ok)throw new Error(path+' 파일을 불러오지 못했습니다.');return{name:path,bytes:new Uint8Array(await r.arrayBuffer())};}));
      if(!files.some(f=>f.name==='content.js'))files.push({name:'content.js',bytes:enc.encode(contentSource())});download(zipStore(files),'sunghee-lim-website.zip');toast('현재 수정 내용이 적용된 ZIP을 내려받았습니다. 실제 사이트에 반영하려면 파일을 교체해야 합니다.');
    }catch(error){toast(error.message+' content.js 다운로드로 수정 내용을 먼저 보관해 주세요.',true);}
    finally{button.disabled=false;button.textContent='웹사이트 ZIP 다운로드';}
  }
  load();render();
  byId('save-draft').addEventListener('click',saveDraft);
  byId('preview').addEventListener('click',()=>{if(saveDraft()){const preview=window.open('index.html?preview=1','_blank');if(preview)preview.opener=null;else toast('팝업이 차단되었습니다. 저장 후 index.html?preview=1 주소를 새 탭에서 열어 주세요.',true);}});
  byId('export-content').addEventListener('click',()=>{if(validate()){download(new Blob([contentSource()],{type:'text/javascript;charset=utf-8'}),'content.js');toast('수정본을 내려받았습니다. 실제 사이트의 content.js를 교체하면 적용됩니다.');}});
  byId('export-zip').addEventListener('click',exportZip);
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
}());

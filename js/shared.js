/* ============================================================
   GILEAD — SHARED UTILS + SIDEBAR RENDERER
   js/shared.js  (loaded on every page)
============================================================ */
'use strict';

/* ── STORE ────────────────────────────────────────────────── */
const Store={
  get:(k,f=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}},
  del:(k)=>localStorage.removeItem(k)
};

/* ── AUTH ─────────────────────────────────────────────────── */
const Auth={
  DEMOS:[
    {name:'Demo User',email:'user@gilead.com',password:'123456'},
    {name:'Admin',email:'admin@gilead.com',password:'admin123'}
  ],
  current:null,
  init(){const s=Store.get('g_session');if(s){this.current=s;return true}return false},
  login(email,pw){
    email=email.trim().toLowerCase();
    const u=[...this.DEMOS,...Store.get('g_users',[])].find(u=>u.email===email&&u.password===pw);
    if(u){this.current=u;Store.set('g_session',u);return{ok:true,user:u}}
    return{ok:false,err:'Invalid email or password.'};
  },
  register(name,email,pw,confirm){
    if(!name.trim())return{ok:false,err:'Name is required.'};
    if(pw!==confirm)return{ok:false,err:'Passwords do not match.'};
    if(pw.length<6)return{ok:false,err:'Password must be at least 6 characters.'};
    email=email.trim().toLowerCase();
    if([...this.DEMOS,...Store.get('g_users',[])].find(u=>u.email===email))return{ok:false,err:'Email already registered.'};
    const user={name:name.trim(),email,password:pw};
    const users=Store.get('g_users',[]);users.push(user);Store.set('g_users',users);
    this.current=user;Store.set('g_session',user);return{ok:true,user};
  },
  logout(){Store.del('g_session');this.current=null},
  guard(root='../'){if(!this.init()){location.href=root+'pages/login.html';return false}return true}
};

/* ── TOAST ────────────────────────────────────────────────── */
const Toast={
  show(msg,type='success',dur=3400){
    let c=document.getElementById('toasts');
    if(!c){c=document.createElement('div');c.id='toasts';document.body.appendChild(c)}
    const e=document.createElement('div');
    e.className='toast '+(type==='error'?'error':type==='warning'?'warning':'');
    const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    e.innerHTML=`<span style="font-size:15px">${icons[type]||'💬'}</span><span>${msg}</span>`;
    c.appendChild(e);
    setTimeout(()=>{e.style.cssText='opacity:0;transform:translateX(60px);transition:.3s ease';setTimeout(()=>e.remove(),320)},dur);
  }
};

/* ── HISTORY ──────────────────────────────────────────────── */
const History={
  key:'g_wellness_history',
  all(){return Store.get(this.key,[])},
  add(r){const a=this.all();a.push({...r,ts:Date.now()});if(a.length>20)a.shift();Store.set(this.key,a)},
  clear(){Store.del(this.key)}
};

/* ── SAVED TIPS ───────────────────────────────────────────── */
const Tips={
  key:'g_saved_tips',
  all(){return Store.get(this.key,[])},
  add(tip,cat){const a=this.all();a.unshift({tip,cat,date:new Date().toLocaleDateString(),ts:Date.now()});if(a.length>30)a.pop();Store.set(this.key,a)},
  clear(){Store.del(this.key)}
};

/* ── UTILS ────────────────────────────────────────────────── */
function fmtDate(d=new Date()){return d.toLocaleDateString('en-GB',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
function toPx(r){return document.getElementById(r)}
function togglePw(id){const i=toPx(id);if(i)i.type=i.type==='password'?'text':'password'}

function animCount(el,target,dur=1600){
  const steps=50;const inc=target/steps;let cur=0;
  const t=setInterval(()=>{cur=Math.min(cur+inc,target);el.textContent=Math.round(cur).toLocaleString();if(cur>=target)clearInterval(t)},dur/steps);
}
function initCounters(){
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting&&e.target.textContent==='0'){animCount(e.target,+e.target.dataset.count);obs.unobserve(e.target)}
  }),{threshold:.3});
  document.querySelectorAll('[data-count]').forEach(el=>{el.textContent='0';obs.observe(el)});
}

/* ── SIDEBAR HTML ─────────────────────────────────────────── */
function sidebarHTML(active, root='../'){
  const user=Auth.current;
  const initial=user?user.name.charAt(0).toUpperCase():'G';
  const name=user?user.name:'Guest';
  const email=user?user.email:'';

  const links=[
    {id:'overview', icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label:'Overview', page:'dashboard.html'},
    {id:'wellness', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label:'Wellness', page:'wellness.html'},
    {id:'bmi', icon:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label:'BMI Calculator', page:'bmi.html'},
    {id:'emergency', icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label:'Emergency', page:'emergency.html', dot:true},
    {id:'tips', icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347-2.571 4.97a1 1 0 01-1.79 0l-2.571-4.97-.347-.347z', label:'Health Tips', page:'tips.html'},
    {id:'location', icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label:'Location', page:'location.html'},
    {id:'qr', icon:'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', label:'QR Card', page:'qr.html'},
    {id:'analytics', icon:'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', label:'Analytics', page:'analytics.html'},
    {id:'mission', icon:'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label:'Mission', page:'mission.html'},
  ];

  return `
  <div class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <a href="${root}index.html" class="logo-mark">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div>
          <div class="logo-text-main">Gilead</div>
          <div class="logo-text-sub">Health Connect</div>
        </div>
      </a>
    </div>

    <div class="sidebar-user">
      <div class="avatar" id="sb-av">${initial}</div>
      <div style="min-width:0">
        <div style="font-weight:600;font-size:13px;color:var(--text);overflow:hidden;white-space:nowrap;text-overflow:ellipsis" id="sb-name">${name}</div>
        <div style="font-size:11px;color:var(--text3);overflow:hidden;white-space:nowrap;text-overflow:ellipsis" id="sb-email">${email}</div>
      </div>
    </div>

    <nav style="flex:1;padding:6px 0">
      <div class="nav-section">Main Menu</div>
      ${links.map(l=>`
        <a class="nav-item${active===l.id?' active':''}" href="${root}pages/${l.page}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${l.icon}"/></svg>
          ${l.label}
          ${l.dot?'<span class="nav-dot"></span>':''}
        </a>`).join('')}

      <div class="nav-section" style="margin-top:8px">Account</div>
      <a class="nav-item" id="logout-btn" style="color:rgba(252,165,165,.7)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Sign Out
      </a>
    </nav>
  </div>
  <div id="overlay"></div>`;
}

/* ── TOPBAR HTML ──────────────────────────────────────────── */
function topbarHTML(title, subtitle=''){
  return `
  <header class="topbar">
    <button class="btn-icon" id="menu-btn" style="display:none">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div style="flex:1">
      <div class="topbar-title">${title}</div>
      ${subtitle?`<div class="topbar-sub">${subtitle}</div>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="font-size:12px;color:var(--text3)" id="tb-date"></div>
      <div class="avatar" id="tb-av" style="width:34px;height:34px;font-size:13px">G</div>
    </div>
  </header>`;
}

/* ── INIT SIDEBAR ─────────────────────────────────────────── */
function initSidebar(){
  // Logout
  document.getElementById('logout-btn')?.addEventListener('click',()=>{
    Auth.logout();Toast.show('Signed out. See you! 👋','info');
    setTimeout(()=>location.href='../pages/login.html',700);
  });

  // Mobile menu
  const menuBtn=document.getElementById('menu-btn');
  const sidebar=document.getElementById('sidebar');
  const overlay=document.getElementById('overlay');
  if(menuBtn){
    menuBtn.style.display='flex';
    menuBtn.addEventListener('click',()=>{sidebar.classList.toggle('open');overlay.classList.toggle('open')});
    overlay?.addEventListener('click',()=>{sidebar.classList.remove('open');overlay.classList.remove('open')});
  }

  // Date
  const d=document.getElementById('tb-date');
  if(d)d.textContent=new Date().toLocaleDateString('en-GB',{weekday:'short',month:'short',day:'numeric'});

  // Avatar
  if(Auth.current){
    const av=document.getElementById('tb-av');
    if(av)av.textContent=Auth.current.name.charAt(0).toUpperCase();
  }
}

/* ── RENDER PAGE ──────────────────────────────────────────── */
function renderPage(active, title, subtitle, bodyHTML, root='../'){
  document.body.innerHTML=`
    ${sidebarHTML(active, root)}
    <div class="main">
      ${topbarHTML(title, subtitle)}
      <div class="page-body" id="page-content">
        ${bodyHTML}
      </div>
    </div>
    <div id="toasts"></div>`;
  initSidebar();
  initCounters();
}

window.Store=Store;window.Auth=Auth;window.Toast=Toast;
window.History=History;window.Tips=Tips;
window.fmtDate=fmtDate;window.togglePw=togglePw;
window.animCount=animCount;window.initCounters=initCounters;
window.sidebarHTML=sidebarHTML;window.topbarHTML=topbarHTML;
window.renderPage=renderPage;window.initSidebar=initSidebar;

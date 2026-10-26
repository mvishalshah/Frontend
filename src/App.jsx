import React,{useState,useEffect,useMemo} from 'react';
import EVENTS from './data/events.json';
import './styles.css';

const h=React.createElement;
const COL={Tech:'#6fa8ff',Cultural:'#ff4d6d',Music:'#ffb627',Sports:'#2ec4b6',Workshop:'#c9a7ff',Fest:'#ff9f6e'};
const CATS=['All',...Object.keys(COL)];
const dt=s=>new Date(s+'T00:00:00');
const mon=s=>dt(s).toLocaleString('en-IN',{month:'short'});
const wd=s=>dt(s).toLocaleString('en-IN',{weekday:'short'});
const full=s=>dt(s).toLocaleString('en-IN',{weekday:'long',day:'numeric',month:'long'});
const price=p=>p?'₹'+p+' per team':'Free entry';
const ls={get(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

function Heart({on}){return h('svg',{viewBox:'0 0 24 24'},h('path',{d:'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.4 4.5c2.1 0 3.9 1.2 5.6 3.2 1.7-2 3.5-3.2 5.6-3.2 3.7 0 5.5 3.900 4 7.300C19.500 16.400 12 21 12 21z'}))}

function Card({e,saved,onSave,onOpen}){
 return h('div',{style:{position:'relative'}},
  h('button',{className:'save','aria-pressed':saved,'aria-label':saved?'Remove bookmark':'Bookmark '+e.t,onClick:ev=>{ev.stopPropagation();onSave(e.id)},style:{zIndex:3}},h(Heart)),
  h('button',{className:'tk',onClick:()=>onOpen(e),style:{width:'100%'}},
   h('div',{className:'d',style:{background:COL[e.c]}},h('span',null,wd(e.d)),h('b',null,dt(e.d).getDate()),h('span',null,mon(e.d))),
   h('div',{className:'b'},
    h('span',{className:'tag',style:{background:COL[e.c]}},e.c),
    h('h3',null,e.t),
    h('div',{className:'m'},e.tm+' at '+e.v),
    h('div',{className:'m'},'By '+e.o),
    h('div',{className:'free'},price(e.p)))));
}

function Modal({e,onClose,registered,onReg}){
 const [name,setName]=useState(''),[mail,setMail]=useState(''),[errs,setErrs]=useState({}),[open,setOpen]=useState(false),[code,setCode]=useState(registered[e.id]||'');
 useEffect(()=>{const k=ev=>ev.key==='Escape'&&onClose();document.addEventListener('keydown',k);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',k);document.body.style.overflow=''}},[]);
 function submit(ev){ev.preventDefault();const er={};
  if(name.trim().length<2)er.name='Enter your full name.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail))er.mail='Enter a valid email, like you@example.com.';
  setErrs(er);if(Object.keys(er).length)return;
  const c='KSH-'+e.id+'-'+Math.random().toString(36).slice(2,6).toUpperCase();setCode(c);onReg(e.id,c)}
 return h('div',{className:'ov',onClick:onClose},
  h('div',{className:'mod',role:'dialog','aria-modal':true,'aria-label':e.t,onClick:ev=>ev.stopPropagation()},
   h('div',{className:'mh',style:{background:COL[e.c]}},
    h('button',{className:'x','aria-label':'Close',onClick:onClose},'✕'),
    h('span',{className:'tag',style:{background:'#fff'}},e.c),h('h2',null,e.t)),
   h('div',{className:'mb'},
    h('div',{className:'facts'},
     h('div',null,'Date',h('b',null,full(e.d))),h('div',null,'Time',h('b',null,e.tm)),
     h('div',null,'Venue',h('b',null,e.v)),h('div',null,'Organiser',h('b',null,e.o)),h('div',null,'Entry',h('b',null,price(e.p)))),
    h('p',null,e.desc),
    code?h('div',{className:'done'},h('h3',null,'You’re in!'),h('p',{style:{margin:0}},'Show this code at the venue.'),h('div',{className:'code'},code))
    :!open?h('button',{className:'cta',onClick:()=>setOpen(true)},'Register for this event')
    :h('form',{onSubmit:submit,noValidate:true},
      h('label',null,'Full name',h('input',{value:name,onChange:ev=>setName(ev.target.value),'aria-invalid':!!errs.name,autoFocus:true}),errs.name&&h('span',{className:'err'},errs.name)),
      h('label',null,'Email',h('input',{type:'email',value:mail,onChange:ev=>setMail(ev.target.value),'aria-invalid':!!errs.mail}),errs.mail&&h('span',{className:'err'},errs.mail)),
      h('button',{className:'cta',type:'submit'},'Confirm my seat')))));
}

function App(){
 const [theme,setTheme]=useState(()=>ls.get('ksh-theme',window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
 const [loading,setLoading]=useState(true),[q,setQ]=useState(''),[cat,setCat]=useState('All'),[only,setOnly]=useState(false);
 const [saved,setSaved]=useState(()=>ls.get('ksh-saved',[])),[reg,setReg]=useState(()=>ls.get('ksh-reg',{})),[sel,setSel]=useState(null);
 useEffect(()=>{document.documentElement.dataset.theme=theme;ls.set('ksh-theme',theme)},[theme]);
 useEffect(()=>{const t=setTimeout(()=>setLoading(false),900);return()=>clearTimeout(t)},[]);
 const toggle=id=>setSaved(s=>{const n=s.includes(id)?s.filter(x=>x!==id):[...s,id];ls.set('ksh-saved',n);return n});
 const onReg=(id,c)=>setReg(r=>{const n={...r,[id]:c};ls.set('ksh-reg',n);return n});
 const list=useMemo(()=>EVENTS.filter(e=>(cat==='All'||e.c===cat)&&(!only||saved.includes(e.id))&&(e.t+e.v+e.o+e.c).toLowerCase().includes(q.toLowerCase().trim())).sort((a,b)=>a.d.localeCompare(b.d)),[q,cat,only,saved]);
 const next=[...EVENTS].sort((a,b)=>a.d.localeCompare(b.d)).slice(0,3);
 const ticker=EVENTS.map(e=>e.t+' on '+dt(e.d).getDate()+' '+mon(e.d)).join('   |   ');
 const reset=()=>{setQ('');setCat('All');setOnly(false)};
 return h(React.Fragment,null,
  h('div',{className:'wrap'},
   h('nav',null,h('div',{className:'logo'},h('i'),'kya scene hai'),
    h('div',{className:'navr'},
     h('button',{className:'pill'+(only?' on':''),'aria-pressed':only,onClick:()=>{setOnly(!only);document.getElementById('events').scrollIntoView()}},'Saved ('+saved.length+')'),
     h('button',{className:'pill',onClick:()=>setTheme(theme==='dark'?'light':'dark'),'aria-label':'Switch to '+(theme==='dark'?'light':'dark')+' mode'},theme==='dark'?'Light':'Dark'))),
   h('header',{className:'hero'},
    h('div',null,
     h('h1',null,'Skip the group chat.',h('span',null,'See what’s on.')),
     h('p',null,'Every talk, workshop, match and open mic at USICT in one place. Find something, save it, grab a seat.'),
     h('div',{className:'search',role:'search'},h('input',{placeholder:'Try “hackathon” or “Amphitheatre”','aria-label':'Search events',value:q,onChange:e=>setQ(e.target.value)}),
      h('button',{onClick:()=>document.getElementById('events').scrollIntoView()},'Search'))),
    h('div',{className:'stack'},next.map(e=>h('button',{key:e.id,className:'stub',onClick:()=>setSel(e)},h('span',null,e.t,h('small',null,e.tm+' at '+e.v)),h('b',null,dt(e.d).getDate()+' '+mon(e.d))))))),
  h('div',{className:'tape','aria-hidden':true},h('div',null,ticker+'   |   '+ticker+'   |   ')),
  h('main',{className:'wrap',id:'events'},
   h('div',{className:'bar'},h('h2',null,only?'Your saved events':'Coming up'),
    h('div',{className:'chips',role:'group','aria-label':'Filter by category'},CATS.map(c=>h('button',{key:c,className:'chip','aria-pressed':cat===c,onClick:()=>setCat(c)},c)))),
   h('div',{className:'grid','aria-live':'polite'},
    loading?[1,2,3,4,5,6].map(i=>h('div',{className:'sk',key:i}))
    :list.length?list.map(e=>h(Card,{key:e.id,e,saved:saved.includes(e.id),onSave:toggle,onOpen:setSel}))
    :h('div',{className:'empty'},h('h3',null,only&&!saved.length?'Nothing saved yet':'No events match that'),h('p',null,only&&!saved.length?'Tap the heart on any event to keep it here.':'Try a different word or pick another category.'),h('button',{className:'pill',onClick:reset},'Show all events')))),
  h('footer',null,h('div',{className:'wrap'},'Made by Vishal Kumar for the TechSpace frontend task. Sample events, not real listings.')),
  sel&&h(Modal,{key:sel.id,e:sel,onClose:()=>setSel(null),registered:reg,onReg}));
}

export default App;

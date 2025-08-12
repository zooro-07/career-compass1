// Frontend interactions for Dream Drift
document.addEventListener('DOMContentLoaded', ()=>{
  const path = location.pathname;
  if(path === '/quiz') initQuiz();
  if(path === '/dashboard' || path === '/results_page' || path === '/results') loadChart();
  if(path === '/roadmap') loadRoadmap();
});

function initQuiz(){
  const questions = [
    {q:"Which activity do you enjoy most?", opts:["Solving puzzles (A)","Building apps (B)","Designing visuals (C)"]},
    {q:"Which class do you prefer?", opts:["Math/Logic (A)","Computer apps (B)","Art & Design (C)"]},
    {q:"Pick a weekend project:", opts:["Mini AI script (A)","Personal website (B)","Poster design (C)"]},
    {q:"Career vibe you like:", opts:["Research & Tech (A)","Product/Startups (B)","Creative/Design (C)"]},
    {q:"Which tool sounds fun?", opts:["Python/ML (A)","React/Fullstack (B)","Figma/Illustrator (C)"]}
  ];
  let step=0; const answers=new Array(questions.length).fill('');
  const qtitle=document.getElementById('qtitle'), qopts=document.getElementById('qopts');
  const prevBtn=document.getElementById('prevBtn'), nextBtn=document.getElementById('nextBtn');
  function render(){ qtitle.innerText='Question '+(step+1)+': '+questions[step].q; qopts.innerHTML='';
    questions[step].opts.forEach((opt,idx)=>{ const d=document.createElement('div'); d.className='opt'; d.innerText=opt; d.onclick=()=>{ answers[step]=['a','b','c'][idx]; document.querySelectorAll('.opt').forEach(o=>o.style.border='1px solid transparent'); d.style.border='1px solid rgba(0,229,255,0.2)'; }; qopts.appendChild(d); if(answers[step]){ const selIdx=['a','b','c'].indexOf(answers[step]); if(selIdx===idx) d.style.border='1px solid rgba(0,229,255,0.2)'; } });
    prevBtn.style.display = step===0 ? 'none' : 'inline-block'; nextBtn.innerText = step===questions.length-1 ? 'Submit' : 'Next';
  }
  prevBtn.onclick=()=>{ if(step>0) step--; render(); };
  nextBtn.onclick=async ()=>{ if(!answers[step]){ alert('Please select an option'); return; } if(step<questions.length-1){ step++; render(); return; } const res = await fetch('/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers:answers})}); const data = await res.json(); localStorage.setItem('drean_analysis', JSON.stringify(data)); window.location.href='/dashboard'; };
  render();
}

async function loadChart(){ const ctxElem=document.getElementById('courseChart'); if(!ctxElem) return; const res = await fetch('/courses'); const data = await res.json(); const labels = data.map(d=>d.course), values = data.map(d=>d.scope); const ctx = ctxElem.getContext('2d'); window.courseChart = new Chart(ctx, { type:'bar', data:{labels:labels,datasets:[{label:'Scope (0-100)',data:values,backgroundColor:'rgba(0,229,255,0.6)'}]}, options:{ onClick: async (evt, items) => { if(!items.length) return; const idx = items[0].index; const course = labels[idx]; const r = await fetch('/colleges/' + encodeURIComponent(course)); const j = await r.json(); const list = j.colleges || []; document.getElementById('topCourse').innerText = course; const ul = document.createElement('ul'); ul.innerHTML = list.map(c=>'<li>'+c+'</li>').join(''); const cl = document.getElementById('collegeList'); cl.innerHTML = '<h4>Top Colleges</h4>'; cl.appendChild(ul); const rr = await fetch('/roadmap_data/' + encodeURIComponent(course)); const rj = await rr.json(); const roadmapArea = document.getElementById('roadmapArea'); roadmapArea.innerHTML = '<h3>Personalized Roadmap</h3><ol>'+ rj.roadmap.map(s=>'<li>'+s+'</li>').join('') +'</ol>'; } }}); const analysisRaw = localStorage.getItem('drean_analysis'); if(analysisRaw){ const analysis = JSON.parse(analysisRaw); const top = analysis.top_course; document.getElementById('topCourse').innerText = 'Top: ' + top; } }

async function loadRoadmap(){ const params = new URLSearchParams(window.location.search); const course = params.get('course') || null; const container = document.getElementById('roadmapContent'); if(course){ const r = await fetch('/roadmap_data/' + encodeURIComponent(course)); const j = await r.json(); container.innerHTML = '<h3>Roadmap for '+course+'</h3><ol>'+ j.roadmap.map(s=>'<li>'+s+'</li>').join('') +'</ol>'; } else { container.innerHTML = '<p>Select a course from the dashboard to view roadmap.</p>'; const saved = localStorage.getItem('drean_analysis'); if(saved){ const top = JSON.parse(saved).top_course; container.innerHTML += '<p>Detected interest: <strong>'+top+'</strong></p><a class="btn" href="/roadmap?course='+encodeURIComponent(top)+'">Open Roadmap</a>'; } } }

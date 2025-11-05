  // ===== util =====
    const $ = (q,root=document) => root.querySelector(q);
    const $$ = (q,root=document) => [...root.querySelectorAll(q)];
    const LS = {
      get:(k,d)=>{ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d} },
      set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
    };

    // ===== navegação suave =====
    $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.getAttribute('data-goto');
      document.querySelector(id)?.scrollIntoView({behavior:'smooth'});
      $$('#topbar .pill').forEach(p=>p.classList.remove('is-active'));
      if(id==='#home') $('#topbar .pill:nth-child(1)').classList.add('is-active');
      if(id==='#menu') $('#topbar .pill:nth-child(2)').classList.add('is-active');
      if(id==='#agenda') $('#topbar .pill:nth-child(3)').classList.add('is-active');
    }));

    // ===== tema =====
    const root=document.documentElement; const temaKey='brunch18_tema';
    const saved=localStorage.getItem(temaKey)||'sakura'; root.setAttribute('data-tema',saved);
    $('#toggleTema')?.addEventListener('click', ()=>{ const t=root.getAttribute('data-tema')==='sakura'?'candy':'sakura'; root.setAttribute('data-tema',t); localStorage.setItem(temaKey,t); });

    // ===== COUNTDOWN - Data do Brunch: 18/11/2025 às 00:00 (GMT-3) =====
    const DATA_BRUNCH = new Date('2025-11-18T00:00:00-03:00').getTime();
    const two = n => String(n).padStart(2, '0');
    
    function atualizarContador() {
      const agora = new Date().getTime();
      const diferenca = Math.max(0, DATA_BRUNCH - agora);
      
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
      
      const elemDias = document.getElementById('dDD');
      const elemHoras = document.getElementById('dHH');
      const elemMinutos = document.getElementById('dMM');
      const elemSegundos = document.getElementById('dSS');
      
      if (elemDias) elemDias.textContent = two(dias);
      if (elemHoras) elemHoras.textContent = two(horas);
      if (elemMinutos) elemMinutos.textContent = two(minutos);
      if (elemSegundos) elemSegundos.textContent = two(segundos);
    }
    
    atualizarContador();
    setInterval(atualizarContador, 1000);

    // ===== .ics (Adicionar ao calendário) =====
    const btnAddCal = $('#btnAddCal');
    if (btnAddCal) {
      btnAddCal.onclick = () => {
        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:20251118T150000\nDTEND:20251118T180000\nSUMMARY:Brunch de 18 anos\nLOCATION:Rua Bevenuto Mendes Luz, 7\nDESCRIPTION:Vem celebrar comigo!\nEND:VEVENT\nEND:VCALENDAR`.replace(/\n/g,'\r\n');
        const blob=new Blob([ics],{type:'text/calendar'}); const url=URL.createObjectURL(blob);
        const a=Object.assign(document.createElement('a'),{href:url,download:'brunch.ics'}); a.click(); URL.revokeObjectURL(url);
      };
    }

    // ===== compartilhar =====
    $('#btnShare').onclick=async()=>{
      const data={title:'Brunch 18', text:'Vem pro brunch!', url:location.href};
      if(navigator.share){ try{ await navigator.share(data);}catch{} }
      else { await navigator.clipboard.writeText(location.href); alert('Link copiado!'); }
    };

    // ===== RSVP contador sentimental (local) =====
    const COUNT_KEY='brunch18_fakecount';
    const setCount=()=> $('#fakeCount').textContent = LS.get(COUNT_KEY,0);
    setCount();
    $('#btnFake').onclick=()=>{ LS.set(COUNT_KEY, LS.get(COUNT_KEY,0)+1); setCount(); };

    // ===== QUIZ =====
    const QUIZ=[
      {q:'Minha bebida favorita no brunch?', a:['Chá gelado','Café preto','Suco de maracujá'], i:0},
      {q:'Jogo que mais me inspira?', a:['The Sims 4','Stardew Valley','Minecraft'], i:0},
      {q:'Cor que domina a paleta do site?', a:['Rosa','Azul','Verde'], i:0},
    ];
    const qbox = $('#quizBox');
    QUIZ.forEach((it,ix)=>{
      const wrap=document.createElement('div'); wrap.className='card'; wrap.style.margin='0 0 1rem';
      wrap.innerHTML=`<q>${it.q}</q><div class='answers'>${it.a.map((t,j)=>`<label class='chip'><input type='radio' name='q${ix}' value='${j}'> ${t}</label>`).join('')}</div>`;
      qbox.append(wrap);
    });
    $('#submitQuiz').onclick=()=>{
      const chosen = QUIZ.map((_,i)=>Number((document.querySelector(`input[name=q${i}]:checked`)||{}).value));
      let score=0; chosen.forEach((v,i)=>{ if(v===QUIZ[i].i) score++; });
      $('#quizOut').textContent = `Você acertou ${score}/${QUIZ.length}.`;
      localStorage.setItem('brunch18_quiz', JSON.stringify({score, ts:Date.now()}));
    };

    // ===== RECADOS =====
    const RKEY='brunch18_recados';
    const lista = $('#listaRec');
    const renderRec = ()=>{
      const recs=LS.get(RKEY,[]);
      lista.innerHTML='';
      recs.forEach(r=>{
        const li=document.createElement('li');
        li.className='card';
        li.textContent=`${r.n}: ${r.m}`;
        lista.prepend(li);
      });
    };
    renderRec();
    $('#formRecado').onsubmit=e=>{
      e.preventDefault();
      const n=$('#nomeRec').value.trim()||'Anônimo';
      const m=$('#msgRec').value.trim(); if(!m) return;
      const recs=LS.get(RKEY,[]); recs.push({n,m}); LS.set(RKEY,recs.slice(-150));
      e.target.reset(); renderRec();
    };
    $('#btnExport').onclick=()=>{
      const recs=LS.get(RKEY,[]).map(r=>`- ${r.n}: ${r.m}`).join('\n');
      const blob=new Blob([`Recados – Brunch 18\n\n${recs}`],{type:'text/plain'});
      const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:'recados-brunch18.txt'}); a.click();
    };

    // ===== PHOTOBOOTH =====
    (async()=>{
      try{ const s=await navigator.mediaDevices.getUserMedia({video:true}); $('#cam').srcObject=s; }catch{}
    })();
    $('#btnFoto').onclick=()=>{
      const v=$('#cam'); if(!v.videoWidth) return;
      const c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight; const ctx=c.getContext('2d');
      ctx.drawImage(v,0,0);
      // se moldura ativa, desenha
      if(window._sticker){
        ctx.strokeStyle='rgba(255,125,181,.9)'; ctx.lineWidth=40; ctx.strokeRect(20,20,c.width-40,c.height-40);
      }
      c.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='brunch-selfie.png'; a.click(); });
    };
    $('#btnSticker').onclick=()=>{ window._sticker = !window._sticker; alert(window._sticker?'Moldura ligada':'Moldura desligada'); };

    // ===== pequenos efeitos (IntersectionObserver) =====
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('reveal'); }}));
    $$('.card').forEach(c=>{ c.style.opacity=.0; c.style.transform='translateY(10px)'; c.style.transition='.5s'; io.observe(c); });
    const style=document.createElement('style'); style.textContent='.reveal{opacity:1!important; transform:none!important}'; document.head.appendChild(style);
  // Countdown do hero (cartão segmentado)
    (function(){
      const dDD=document.getElementById('dDD'); if(!dDD) return;
      function two(n){return String(n).padStart(2,'0');}
      function upd(){
        const now=new Date();
        let s=Math.max(0, Math.floor((DIA-now)/1000));
        const d=Math.floor(s/86400); s%=86400;
        const h=Math.floor(s/3600); s%=3600;
        const m=Math.floor(s/60);   s%=60;
        document.getElementById('dDD').textContent=two(d);
        document.getElementById('dHH').textContent=two(h);
        document.getElementById('dMM').textContent=two(m);
        document.getElementById('dSS').textContent=two(s);
      }
      upd(); setInterval(upd,1000);
    })();
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
    const btnShare = $('#btnShare');
    if (btnShare) {
      btnShare.onclick = async () => {
        const data = { title: 'Brunch 18', text: 'Vem pro brunch!', url: location.href };
        if (navigator.share) { try { await navigator.share(data); } catch { } }
        else { await navigator.clipboard.writeText(location.href); alert('Link copiado!'); }
      };
    }

    // ===== FIREBASE RSVP =====
    // Inicializar Firebase quando a página carregar
    console.log('🔍 Verificando firebaseRSVP:', window.firebaseRSVP);
    
    let firebaseIniciado = false;
    
    if (window.firebaseRSVP) {
      console.log('✅ firebaseRSVP encontrado, inicializando...');
      firebaseIniciado = window.firebaseRSVP.init();
      console.log('Firebase iniciado?', firebaseIniciado);
      
      if (firebaseIniciado) {
        // Carregar número de confirmações
        window.firebaseRSVP.getNumero((total) => {
          const elem = document.getElementById('totalConfirmados');
          if (elem) elem.textContent = total;
        });

        // Carregar e exibir lista de confirmados
        window.firebaseRSVP.carregar((confirmacoes) => {
          const lista = document.getElementById('listaConfirmados');
          if (!lista) return;

          if (confirmacoes.length === 0) {
            lista.innerHTML = '<p style="text-align:center; color:#fff9; padding:2rem;">Nenhuma confirmação ainda. Seja o primeiro! 💗</p>';
            return;
          }

          lista.innerHTML = confirmacoes.map(conf => {
            const data = conf.timestamp ? new Date(conf.timestamp).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : '';
            
            return `
              <div class="card" style="margin-bottom:.8rem; padding:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.3rem;">
                  <strong style="font-size:1.1rem; color:#34343a;">✨ ${conf.nome}</strong>
                  ${data ? `<small style="color:#6b6b74;">${data}</small>` : ''}
                </div>
                ${conf.telefone ? `<p style="margin:.3rem 0; color:#6b6b74; font-size:.9rem;">📱 ${conf.telefone}</p>` : ''}
                ${conf.mensagem ? `<p style="margin:.5rem 0; font-style:italic; color:#34343a;">"${conf.mensagem}"</p>` : ''}
              </div>
            `;
          }).join('');
        });

        // Formulário de confirmação
        const formRSVP = document.getElementById('formRSVP');
        console.log('📝 Formulário encontrado?', formRSVP);
        
        if (formRSVP) {
          formRSVP.onsubmit = async (e) => {
            e.preventDefault();
            console.log('📤 Formulário enviado!');
            
            const nome = document.getElementById('nomeRSVP').value;
            const telefone = document.getElementById('telRSVP').value;
            const mensagem = document.getElementById('msgRSVP').value;

            console.log('Dados:', { nome, telefone, mensagem });

            const sucesso = await window.firebaseRSVP.confirmar(nome, telefone, mensagem);
            console.log('Sucesso?', sucesso);
            
            if (sucesso) {
              alert('Presença confirmada com sucesso! 🎉');
              formRSVP.reset();
            }
          };
        } else {
          console.error('❌ Formulário formRSVP não encontrado!');
        }
      } else {
        console.error('❌ Firebase não foi inicializado');
      }
    } else {
      console.error('❌ window.firebaseRSVP não está disponível');
    }

    // ===== RSVP contador sentimental (local - FALLBACK) =====
    const COUNT_KEY='brunch18_fakecount';
    const fakeCountElem = document.getElementById('fakeCount');
    if (fakeCountElem) {
      const setCount=()=> fakeCountElem.textContent = LS.get(COUNT_KEY,0);
      setCount();
      const btnFake = document.getElementById('btnFake');
      if (btnFake) {
        btnFake.onclick=()=>{ LS.set(COUNT_KEY, LS.get(COUNT_KEY,0)+1); setCount(); };
      }
    }

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
    const submitQuiz = $('#submitQuiz');
    if (submitQuiz) {
      submitQuiz.onclick = () => {
        const chosen = QUIZ.map((_, i) => Number((document.querySelector(`input[name=q${i}]:checked`) || {}).value));
        let score = 0; chosen.forEach((v, i) => { if (v === QUIZ[i].i) score++; });
        $('#quizOut').textContent = `Você acertou ${score}/${QUIZ.length}.`;
        localStorage.setItem('brunch18_quiz', JSON.stringify({ score, ts: Date.now() }));
      };
    }

    // ===== RECADOS FIREBASE =====
    console.log('📖 Verificando recados - firebaseRSVP:', window.firebaseRSVP, 'iniciado:', firebaseIniciado);
    
    if (window.firebaseRSVP && firebaseIniciado) {
      console.log('📖 Configurando livro de recados com Firebase...');
      
      // Carregar recados do Firebase
      window.firebaseRSVP.carregarRecados((recados) => {
        const lista = $('#listaRec');
        console.log('📝 Lista de recados encontrada?', lista);
        console.log('📚 Recados recebidos:', recados.length);
        
        if (!lista) return;

        if (recados.length === 0) {
          lista.innerHTML = '<li style="text-align:center; color:#fff9; padding:2rem;">Nenhum recado ainda. Seja o primeiro a deixar uma mensagem! 💌</li>';
          return;
        }

        lista.innerHTML = recados.map(rec => {
          const data = rec.timestamp ? new Date(rec.timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '';
          
          return `
            <li class="card" style="margin-bottom:.6rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.3rem;">
                <strong style="color:#34343a;">💌 ${rec.nome}</strong>
                ${data ? `<small style="color:#6b6b74;">${data}</small>` : ''}
              </div>
              <p style="margin:.3rem 0; font-style:italic; color:#34343a;">"${rec.mensagem}"</p>
            </li>
          `;
        }).join('');
      });

      // Formulário de recados
      const formRecado = $('#formRecado');
      console.log('📝 Formulário de recados encontrado?', formRecado);
      
      if (formRecado) {
        formRecado.onsubmit = async (e) => {
          e.preventDefault();
          console.log('📤 Enviando recado...');
          
          const nome = $('#nomeRec').value.trim() || 'Anônimo';
          const mensagem = $('#msgRec').value.trim();
          
          console.log('Dados do recado:', { nome, mensagem });
          
          if (!mensagem) {
            alert('Por favor, digite uma mensagem.');
            return;
          }

          const sucesso = await window.firebaseRSVP.adicionarRecado(nome, mensagem);
          console.log('Recado adicionado?', sucesso);
          
          if (sucesso) {
            alert('Recado publicado com sucesso! 💌');
            formRecado.reset();
          }
        };
      } else {
        console.error('❌ Formulário de recados não encontrado!');
      }

      // Botão exportar recados do Firebase
      const btnExport = $('#btnExport');
      if (btnExport) {
        btnExport.onclick = () => {
          window.firebaseRSVP.carregarRecados((recados) => {
            const texto = recados.map(r => `- ${r.nome}: ${r.mensagem}`).join('\n');
            const blob = new Blob([`Recados – Brunch 18\n\n${texto}`], { type: 'text/plain' });
            const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'recados-brunch18.txt' });
            a.click();
          });
        };
      }
    }

    // ===== RECADOS LOCAL (FALLBACK se Firebase não estiver disponível) =====
    const RKEY = 'brunch18_recados';
    const lista = $('#listaRec');
    if (lista && (!window.firebaseRSVP || !firebaseIniciado)) {
      console.log('📖 Usando recados locais (localStorage)');
      const renderRec = () => {
        const recs = LS.get(RKEY, []);
        lista.innerHTML = '';
        recs.forEach(r => {
          const li = document.createElement('li');
          li.className = 'card';
          li.textContent = `${r.n}: ${r.m}`;
          lista.prepend(li);
        });
      };
      renderRec();
      
      const formRecado = $('#formRecado');
      if (formRecado) {
        formRecado.onsubmit = e => {
          e.preventDefault();
          const n = $('#nomeRec').value.trim() || 'Anônimo';
          const m = $('#msgRec').value.trim();
          if (!m) return;
          const recs = LS.get(RKEY, []); 
          recs.push({ n, m }); 
          LS.set(RKEY, recs.slice(-150));
          e.target.reset(); 
          renderRec();
        };
      }

      const btnExport = $('#btnExport');
      if (btnExport) {
        btnExport.onclick = () => {
          const recs = LS.get(RKEY, []).map(r => `- ${r.n}: ${r.m}`).join('\n');
          const blob = new Blob([`Recados – Brunch 18\n\n${recs}`], { type: 'text/plain' });
          const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'recados-brunch18.txt' }); 
          a.click();
        };
      }
    }

    // ===== PHOTOBOOTH =====
    (async()=>{
      try{ const cam = $('#cam'); if (cam) { const s=await navigator.mediaDevices.getUserMedia({video:true}); cam.srcObject=s; } }catch{}
    })();
    const btnFoto = $('#btnFoto');
    if (btnFoto) {
      btnFoto.onclick = () => {
        const v = $('#cam'); if (!v || !v.videoWidth) return;
        const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; const ctx = c.getContext('2d');
        ctx.drawImage(v, 0, 0);
        // se moldura ativa, desenha
        if (window._sticker) {
          ctx.strokeStyle = 'rgba(255,125,181,.9)'; ctx.lineWidth = 40; ctx.strokeRect(20, 20, c.width - 40, c.height - 40);
        }
        c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'brunch-selfie.png'; a.click(); });
      };
    }
    const btnSticker = $('#btnSticker');
    if (btnSticker) {
      btnSticker.onclick = () => { window._sticker = !window._sticker; alert(window._sticker ? 'Moldura ligada' : 'Moldura desligada'); };
    }

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
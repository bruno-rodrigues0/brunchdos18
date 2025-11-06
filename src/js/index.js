  // ===== util =====
    const $ = (q,root=document) => root.querySelector(q);
    const $$ = (q,root=document) => [...root.querySelectorAll(q)];
    const LS = {
      get:(k,d)=>{ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d} },
      set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
    };

    // ===== MENU HAMBÚRGUER =====
    const menuToggle = $('#menuToggle');
    const navMenu = $('#navMenu');
    const menuOverlay = $('#menuOverlay');
    
    if (menuToggle && navMenu && menuOverlay) {
      const closeMenu = () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };
      
      const openMenu = () => {
        menuToggle.classList.add('active');
        navMenu.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      };
      
      menuToggle.addEventListener('click', () => {
        if (menuToggle.classList.contains('active')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
      
      menuOverlay.addEventListener('click', closeMenu);
      
      // Fechar menu ao clicar em um link
      $$('.navlink').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
    }

    // ===== navegação suave =====
    $$('[data-goto]').forEach(b=>b.addEventListener('click',(e)=>{
      e.preventDefault();
      const id=b.getAttribute('data-goto');
      document.querySelector(id)?.scrollIntoView({behavior:'smooth'});
      $$('#topbar .pill').forEach(p=>p.classList.remove('is-active'));
      if(id==='#home') $('#topbar .pill:nth-child(1)')?.classList.add('is-active');
      if(id==='#menu') $('#topbar .pill:nth-child(2)')?.classList.add('is-active');
      if(id==='#agenda') $('#topbar .pill:nth-child(3)')?.classList.add('is-active');
    }));

    // ===== tema =====
    const root=document.documentElement; const temaKey='brunch18_tema';
    const saved=localStorage.getItem(temaKey)||'sakura'; root.setAttribute('data-tema',saved);
    $('#toggleTema')?.addEventListener('click', ()=>{ const t=root.getAttribute('data-tema')==='sakura'?'candy':'sakura'; root.setAttribute('data-tema',t); localStorage.setItem(temaKey,t); });

    // ===== COUNTDOWN - Data do Brunch: 18/11/2025 às 00:00 (GMT-3) =====
    const DATA_BRUNCH = new Date('2025-11-19T00:00:00-03:00').getTime();
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
    
    // Molduras disponíveis
    window._stickerType = 'rosa'; // moldura padrão
    window._sticker = true; // moldura ativada por padrão
    
    const btnFoto = $('#btnFoto');
    if (btnFoto) {
      btnFoto.onclick = () => {
        const v = $('#cam'); if (!v || !v.videoWidth) return;
        const c = document.createElement('canvas'); 
        c.width = v.videoWidth; 
        c.height = v.videoHeight; 
        const ctx = c.getContext('2d');
        
        // Espelhar horizontalmente (corrigir inversão da câmera frontal)
        ctx.translate(c.width, 0);
        ctx.scale(-1, 1);
        
        // Desenhar moldura se ativada
        if (window._sticker && window._stickerType) {
          const padding = 30;
          
          if (window._stickerType === 'rosa') {
            // Primeiro desenha o vídeo
            ctx.drawImage(v, 0, 0);
            
            // Desfazer o espelhamento para desenhar a moldura corretamente
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Moldura rosa com cantos arredondados
            ctx.strokeStyle = '#ff7db5';
            ctx.lineWidth = 35;
            ctx.strokeRect(padding, padding, c.width - padding * 2, c.height - padding * 2);
            
            // Cantos decorativos
            ctx.fillStyle = '#ff7db5';
            ctx.beginPath();
            ctx.arc(padding, padding, 15, 0, Math.PI * 2);
            ctx.arc(c.width - padding, padding, 15, 0, Math.PI * 2);
            ctx.arc(padding, c.height - padding, 15, 0, Math.PI * 2);
            ctx.arc(c.width - padding, c.height - padding, 15, 0, Math.PI * 2);
            ctx.fill();
          } else if (window._stickerType === 'coracoes') {
            // Primeiro desenha o vídeo
            ctx.drawImage(v, 0, 0);
            
            // Desfazer o espelhamento para desenhar a moldura corretamente
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Moldura com corações nos cantos
            ctx.strokeStyle = '#ff7db5';
            ctx.lineWidth = 25;
            ctx.strokeRect(padding, padding, c.width - padding * 2, c.height - padding * 2);
            
            // Desenhar corações nos cantos
            const drawHeart = (x, y, size) => {
              ctx.fillStyle = '#ff5599';
              ctx.beginPath();
              ctx.moveTo(x, y + size / 4);
              ctx.quadraticCurveTo(x, y, x + size / 2, y);
              ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
              ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size);
              ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4);
              ctx.fill();
            };
            
            drawHeart(padding - 20, padding - 20, 40);
            drawHeart(c.width - padding - 20, padding - 20, 40);
            drawHeart(padding - 20, c.height - padding - 20, 40);
            drawHeart(c.width - padding - 20, c.height - padding - 20, 40);
          } else if (window._stickerType === 'aniversario') {
            // Primeiro desenha o vídeo
            ctx.drawImage(v, 0, 0);
            
            // Desfazer o espelhamento para desenhar a moldura corretamente
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Moldura rosa com borda dupla
            ctx.strokeStyle = '#ff7db5';
            ctx.lineWidth = 30;
            ctx.strokeRect(padding + 10, padding + 10, c.width - (padding + 10) * 2, c.height - (padding + 10) * 2);
            
            ctx.strokeStyle = '#ffb3d9';
            ctx.lineWidth = 15;
            ctx.strokeRect(padding, padding, c.width - padding * 2, c.height - padding * 2);
            
            // Função para desenhar flores
            const drawFlower = (x, y, size) => {
              // Pétalas
              for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5;
                const px = x + Math.cos(angle) * size;
                const py = y + Math.sin(angle) * size;
                
                ctx.fillStyle = '#ff7db5';
                ctx.beginPath();
                ctx.arc(px, py, size * 0.6, 0, Math.PI * 2);
                ctx.fill();
              }
              
              // Centro da flor
              ctx.fillStyle = '#ffd700';
              ctx.beginPath();
              ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
              ctx.fill();
            };
            
            // Desenhar flores nos quatro cantos
            const flowerSize = 20;
            const flowerOffset = 50;
            
            drawFlower(flowerOffset, flowerOffset, flowerSize);
            drawFlower(c.width - flowerOffset, flowerOffset, flowerSize);
            drawFlower(flowerOffset, c.height - flowerOffset, flowerSize);
            drawFlower(c.width - flowerOffset, c.height - flowerOffset, flowerSize);
            
            // Desenhar o número "18" no topo
            ctx.fillStyle = '#ff7db5';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 8;
            ctx.font = 'bold 120px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            const text = '18';
            const textY = 60;
            
            // Borda branca
            ctx.strokeText(text, c.width / 2, textY);
            // Texto rosa
            ctx.fillText(text, c.width / 2, textY);
            
            // Adicionar estrelinhas ao redor do número
            const drawStar = (x, y, size) => {
              ctx.fillStyle = '#ffd700';
              ctx.beginPath();
              for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const radius = i % 2 === 0 ? size : size / 2;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
            };
            
            drawStar(c.width / 2 - 120, textY + 60, 15);
            drawStar(c.width / 2 + 120, textY + 60, 15);
            drawStar(c.width / 2 - 100, textY + 20, 12);
            drawStar(c.width / 2 + 100, textY + 20, 12);
          }
        } else {
          // Sem moldura, apenas captura
          ctx.drawImage(v, 0, 0);
        }
        
        c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'brunch-selfie.png'; a.click(); });
      };
    }
    
    const btnSticker = $('#btnSticker');
    if (btnSticker) {
      btnSticker.onclick = () => { 
        if (!window._sticker) {
          window._sticker = true;
          window._stickerType = 'rosa';
          alert('Moldura Rosa ativada! 💗');
        } else if (window._stickerType === 'rosa') {
          window._stickerType = 'coracoes';
          alert('Moldura Corações ativada! 💕');
        } else if (window._stickerType === 'coracoes') {
          window._stickerType = 'aniversario';
          alert('Moldura de Aniversário ativada! 🎂✨');
        } else {
          window._sticker = false;
          window._stickerType = null;
          alert('Moldura desligada');
        }
      };
    }

    // ===== pequenos efeitos (IntersectionObserver) =====
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('reveal'); }}));
    $$('.card').forEach(c=>{ c.style.opacity=.0; c.style.transform='translateY(10px)'; c.style.transition='.5s'; io.observe(c); });
    const style=document.createElement('style'); style.textContent='.reveal{opacity:1!important; transform:none!important}'; document.head.appendChild(style);
    
    // ===== FAQ ACCORDION =====
    $$('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isActive = item.classList.contains('active');
        
        // Fechar todos os outros
        $$('.faq-item').forEach(faq => faq.classList.remove('active'));
        
        // Abrir o clicado (se não estava aberto)
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
    
    // ===== PARALLAX BACKGROUND (sem offset) =====
    const bgElement = $('.bg');
    if (bgElement) {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.3; // Velocidade do parallax
            bgElement.style.transform = `translateY(${scrolled * -parallaxSpeed}px)`;
            ticking = false;
          });
          ticking = true;
        }
      });
    }
    
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
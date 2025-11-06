// ===== FIREBASE CONFIGURATION =====
// Firebase será carregado globalmente via script tags no HTML
const firebaseConfig = {
  apiKey: "AIzaSyCV6Xjt6fWqRj-SGQNBal0VlYGN8x88UAU",
  authDomain: "brunchdos18.firebaseapp.com",
  projectId: "brunchdos18",
  storageBucket: "brunchdos18.firebasestorage.app",
  messagingSenderId: "141618883288",
  appId: "1:141618883288:web:46f5f2d864484e229445ad",
  measurementId: "G-V56JWT7WKV",
  databaseURL: "https://brunchdos18-default-rtdb.firebaseio.com"
};

let app, db;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK não carregado. Adicione os scripts do Firebase no HTML.');
    return false;
  }
  
  try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('Firebase inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    return false;
  }
}

// ===== FUNÇÕES DE RSVP =====
async function confirmarPresenca(nome, telefone = '', mensagem = '') {
  if (!db) {
    alert('Firebase não está configurado.');
    return false;
  }

  if (!nome || nome.trim() === '') {
    alert('Por favor, digite seu nome.');
    return false;
  }

  try {
    const confirmacao = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      mensagem: mensagem.trim(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      data: new Date().toISOString()
    };

    await db.ref('confirmacoes').push(confirmacao);
    return true;
  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    alert('Erro ao confirmar presença. Tente novamente.');
    return false;
  }
}

function carregarConfirmacoes(callback) {
  if (!db) {
    console.error('Firebase não está configurado.');
    return;
  }

  db.ref('confirmacoes').on('value', (snapshot) => {
    const confirmacoes = [];
    snapshot.forEach((childSnapshot) => {
      confirmacoes.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Ordenar por timestamp (mais recentes primeiro)
    confirmacoes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    callback(confirmacoes);
  });
}

function getNumeroConfirmacoes(callback) {
  if (!db) {
    callback(0);
    return;
  }

  db.ref('confirmacoes').on('value', (snapshot) => {
    callback(snapshot.numChildren());
  });
}

// ===== FUNÇÕES DE RECADOS =====
async function adicionarRecado(nome, mensagem) {
  if (!db) {
    alert('Firebase não está configurado.');
    return false;
  }

  if (!mensagem || mensagem.trim() === '') {
    alert('Por favor, digite uma mensagem.');
    return false;
  }

  try {
    const recado = {
      nome: nome.trim() || 'Anônimo',
      mensagem: mensagem.trim(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      data: new Date().toISOString()
    };

    await db.ref('recados').push(recado);
    console.log('✅ Recado salvo no Firebase:', recado);
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar recado:', error);
    console.error('Detalhes do erro:', error.code, error.message);
    alert('Erro ao adicionar recado. Tente novamente.');
    return false;
  }
}

function carregarRecados(callback) {
  if (!db) {
    console.error('Firebase não está configurado.');
    return;
  }

  db.ref('recados').on('value', (snapshot) => {
    const recados = [];
    snapshot.forEach((childSnapshot) => {
      recados.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Ordenar por timestamp (mais recentes primeiro)
    recados.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    callback(recados);
  });
}

function getNumeroRecados(callback) {
  if (!db) {
    callback(0);
    return;
  }

  db.ref('recados').on('value', (snapshot) => {
    callback(snapshot.numChildren());
  });
}

// Exportar funções para uso global
window.firebaseRSVP = {
  init: initFirebase,
  confirmar: confirmarPresenca,
  carregar: carregarConfirmacoes,
  getNumero: getNumeroConfirmacoes,
  // Recados
  adicionarRecado: adicionarRecado,
  carregarRecados: carregarRecados,
  getNumeroRecados: getNumeroRecados
};

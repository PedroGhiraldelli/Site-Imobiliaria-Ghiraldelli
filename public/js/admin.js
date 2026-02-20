/**
 * admin.js — Lógica do painel administrativo
 */

// Guard — redireciona se não estiver logado
if (!isLoggedIn()) window.location.href = './login.html';

let allImoveis = [];
let newFiles   = [];  // arquivos selecionados no modal (novos)

/* ── LOGOUT ────────────────────────────────────────────── */
function doLogout() {
  clearToken();
  window.location.href = './login.html';
}

/* ── SECTIONS ───────────────────────────────────────────── */
function showSection(name, linkEl) {
  ['dashboard','imoveis','config'].forEach(s => {
    document.getElementById('section-' + s).style.display = s === name ? '' : 'none';
  });
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');

  const titles = { dashboard: 'Dashboard', imoveis: 'Gerenciar Imóveis', config: 'Configurações' };
  document.getElementById('topbar-title').textContent = titles[name] || '';
  document.getElementById('topbar-new-btn').style.display = name === 'imoveis' ? '' : 'none';

  if (name === 'dashboard') loadDashboard();
  if (name === 'imoveis')   loadTable();
  if (name === 'config')    loadConfig();
}

/* ── DASHBOARD ──────────────────────────────────────────── */
async function loadDashboard() {
  try {
    const [all, venda, aluguel, dest] = await Promise.all([
      apiGet('/imoveis?limit=1'),
      apiGet('/imoveis?transacao=Venda&limit=1'),
      apiGet('/imoveis?transacao=Aluguel&limit=1'),
      apiGet('/imoveis?destaque=1&limit=1'),
    ]);
    document.getElementById('stat-total').textContent   = all.total;
    document.getElementById('stat-venda').textContent   = venda.total;
    document.getElementById('stat-aluguel').textContent = aluguel.total;
    document.getElementById('stat-destaque').textContent = dest.total;

    // Últimos 5
    const recentes = await apiGet('/imoveis?limit=5');
    document.getElementById('dash-table-wrap').innerHTML = buildTableHTML(recentes.imoveis, true);
  } catch(e) {
    toast('Erro ao carregar dashboard: ' + e.message, 'error');
  }
}

/* ── TABLE ──────────────────────────────────────────────── */
async function loadTable() {
  try {
    const data = await apiGet('/imoveis?limit=200');
    allImoveis = data.imoveis;
    renderTable(allImoveis);
  } catch(e) {
    toast('Erro ao carregar imóveis: ' + e.message, 'error');
  }
}

function renderTable(list) {
  document.getElementById('table-body').innerHTML = list.length
    ? list.map(im => buildRowHTML(im)).join('')
    : `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--txt-m)">Nenhum imóvel encontrado.</td></tr>`;
}

function buildTableHTML(list, mini = false) {
  if (!list.length) return '<div class="empty-state"><div class="empty-icon">🏠</div><p>Nenhum imóvel cadastrado.</p></div>';
  return `<table>
    <thead><tr>
      <th>Foto</th><th>Título</th><th>Tipo</th><th>Negócio</th>
      <th>Preço</th><th>Cidade</th>${mini ? '' : '<th>Destaque</th><th>Ações</th>'}
    </tr></thead>
    <tbody>${list.map(im => buildRowHTML(im, mini)).join('')}</tbody>
  </table>`;
}

function buildRowHTML(im, mini = false) {
  const foto = im.foto_capa
    ? `<img class="table-photo" src="${fotoUrl(im.foto_capa)}" alt="">`
    : `<div class="table-photo-placeholder">🏠</div>`;

  const actions = mini ? '' : `
    <td>
      <div class="table-actions">
        <button class="action-btn star ${im.destaque?'on':''}" title="${im.destaque?'Remover destaque':'Destacar'}"
          onclick="toggleDestaque(${im.id}, ${im.destaque})">⭐</button>
        <button class="action-btn edit" title="Editar" onclick="openModal(${im.id})">✏️</button>
        <button class="action-btn del"  title="Excluir" onclick="confirmDelete(${im.id}, '${escHtml(im.titulo)}')">🗑️</button>
      </div>
    </td>`;

  const destaqCell = mini ? '' : `<td>${im.destaque ? '<span class="badge badge-destaque">⭐ Sim</span>' : '<span style="color:var(--txt-m);font-size:.85rem">Não</span>'}</td>`;

  return `<tr>
    <td>${foto}</td>
    <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600">${escHtml(im.titulo)}</td>
    <td>${im.tipo}</td>
    <td><span class="badge badge-${im.transacao.toLowerCase()}">${im.transacao}</span></td>
    <td style="font-weight:700;color:var(--azul)">${formatPrice(im.preco, im.transacao)}</td>
    <td>${im.cidade}</td>
    ${destaqCell}
    ${actions}
  </tr>`;
}

function filterTable() {
  const q = document.getElementById('table-search').value.toLowerCase();
  renderTable(allImoveis.filter(im => im.titulo.toLowerCase().includes(q) || im.cidade.toLowerCase().includes(q)));
}

/* ── TOGGLE DESTAQUE ────────────────────────────────────── */
async function toggleDestaque(id, current) {
  try {
    const im = allImoveis.find(i => i.id === id);
    await apiPut(`/imoveis/${id}`, { ...im, destaque: current ? 0 : 1 });
    toast(current ? 'Destaque removido.' : 'Imóvel destacado!');
    loadTable();
  } catch(e) {
    toast('Erro: ' + e.message, 'error');
  }
}

/* ── DELETE ─────────────────────────────────────────────── */
function confirmDelete(id, titulo) {
  if (!confirm(`Excluir "${titulo}"?\n\nEsta ação não pode ser desfeita.`)) return;
  deleteImovelAdmin(id);
}

async function deleteImovelAdmin(id) {
  try {
    await apiDelete(`/imoveis/${id}`);
    toast('Imóvel excluído com sucesso.');
    loadTable();
    loadDashboard();
  } catch(e) {
    toast('Erro ao excluir: ' + e.message, 'error');
  }
}

/* ── MODAL ──────────────────────────────────────────────── */
function openModal(id = null) {
  newFiles = [];
  clearForm();
  document.getElementById('upload-previews').innerHTML = '';
  document.getElementById('existing-photos').style.display = 'none';
  document.getElementById('existing-photos-grid').innerHTML = '';

  if (id) {
    document.getElementById('modal-title').textContent = 'Editar Imóvel';
    document.getElementById('save-btn').textContent    = '💾 Atualizar';
    fillForm(id);
  } else {
    document.getElementById('modal-title').textContent = 'Novo Imóvel';
    document.getElementById('save-btn').textContent    = '💾 Salvar Imóvel';
    document.getElementById('form-id').value = '';
  }

  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  newFiles = [];
}

// Fechar ao clicar fora
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function clearForm() {
  ['form-id','form-titulo','form-cidade','form-bairro','form-descricao'].forEach(id => document.getElementById(id).value = '');
  ['form-preco','form-area'].forEach(id => document.getElementById(id).value = '');
  ['form-quartos','form-banheiros','form-vagas'].forEach(id => document.getElementById(id).value = '0');
  document.getElementById('form-tipo').value = 'Casa';
  document.getElementById('form-transacao').value = 'Venda';
  document.getElementById('form-destaque').checked = false;
}

async function fillForm(id) {
  try {
    const im = await apiGet(`/imoveis/${id}`);
    document.getElementById('form-id').value         = im.id;
    document.getElementById('form-titulo').value     = im.titulo;
    document.getElementById('form-tipo').value       = im.tipo;
    document.getElementById('form-transacao').value  = im.transacao;
    document.getElementById('form-preco').value      = im.preco;
    document.getElementById('form-area').value       = im.area || '';
    document.getElementById('form-cidade').value     = im.cidade;
    document.getElementById('form-bairro').value     = im.bairro || '';
    document.getElementById('form-quartos').value    = im.quartos;
    document.getElementById('form-banheiros').value  = im.banheiros;
    document.getElementById('form-vagas').value      = im.vagas;
    document.getElementById('form-descricao').value  = im.descricao || '';
    document.getElementById('form-destaque').checked = !!im.destaque;

    if (im.fotos && im.fotos.length) {
      document.getElementById('existing-photos').style.display = '';
      document.getElementById('existing-photos-grid').innerHTML = im.fotos.map(f => `
        <div class="upload-preview" id="ep-${f.id}">
          <img src="${fotoUrl(f.caminho)}" alt="">
          <button class="remove-photo" onclick="deletePhoto(${f.id})">✕</button>
        </div>`).join('');
    }
  } catch(e) {
    toast('Erro ao carregar imóvel: ' + e.message, 'error');
  }
}

async function deletePhoto(fotoId) {
  try {
    await apiDelete(`/imoveis/fotos/${fotoId}`);
    document.getElementById('ep-' + fotoId)?.remove();
    toast('Foto removida.');
  } catch(e) {
    toast('Erro ao remover foto: ' + e.message, 'error');
  }
}

/* ── SAVE ───────────────────────────────────────────────── */
async function saveImovel() {
  const id     = document.getElementById('form-id').value;
  const titulo = document.getElementById('form-titulo').value.trim();
  const preco  = document.getElementById('form-preco').value;
  const cidade = document.getElementById('form-cidade').value.trim();

  if (!titulo || !preco || !cidade) {
    toast('Preencha os campos obrigatórios (Título, Preço e Cidade).', 'error'); return;
  }

  const payload = {
    titulo,
    tipo:      document.getElementById('form-tipo').value,
    transacao: document.getElementById('form-transacao').value,
    preco:     Number(preco),
    cidade,
    bairro:    document.getElementById('form-bairro').value.trim() || null,
    area:      Number(document.getElementById('form-area').value) || null,
    quartos:   Number(document.getElementById('form-quartos').value) || 0,
    banheiros: Number(document.getElementById('form-banheiros').value) || 0,
    vagas:     Number(document.getElementById('form-vagas').value) || 0,
    descricao: document.getElementById('form-descricao').value.trim() || null,
    destaque:  document.getElementById('form-destaque').checked ? 1 : 0,
    ativo:     1,
  };

  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    let saved;
    if (id) {
      saved = await apiPut(`/imoveis/${id}`, payload);
    } else {
      saved = await apiPost('/imoveis', payload);
    }

    // Upload de fotos novas
    if (newFiles.length) {
      const fd = new FormData();
      newFiles.forEach(f => fd.append('fotos', f));
      await fetch(`/api/imoveis/${saved.id}/fotos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: fd,
      });
    }

    toast(id ? 'Imóvel atualizado!' : 'Imóvel criado com sucesso!');
    closeModal();
    loadTable();
    loadDashboard();
  } catch(e) {
    toast('Erro ao salvar: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = id ? '💾 Atualizar' : '💾 Salvar Imóvel';
  }
}

/* ── UPLOAD DE FOTOS ────────────────────────────────────── */
function handleFiles(files) {
  Array.from(files).forEach(addFile);
  document.getElementById('file-input').value = '';
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('drag');
  handleFiles(e.dataTransfer.files);
}

function addFile(file) {
  if (newFiles.length >= 10) { toast('Máximo de 10 fotos.', 'error'); return; }
  if (!file.type.startsWith('image/')) { toast('Apenas imagens são aceitas.', 'error'); return; }
  newFiles.push(file);

  const idx    = newFiles.length - 1;
  const reader = new FileReader();
  reader.onload = (e) => {
    const wrap = document.createElement('div');
    wrap.className = 'upload-preview';
    wrap.id = 'np-' + idx;
    wrap.innerHTML = `
      <img src="${e.target.result}" alt="Preview">
      <button class="remove-photo" onclick="removeNewFile(${idx})">✕</button>`;
    document.getElementById('upload-previews').appendChild(wrap);
  };
  reader.readAsDataURL(file);
}

function removeNewFile(idx) {
  newFiles.splice(idx, 1);
  document.getElementById('np-' + idx)?.remove();
  // Re-numera os previews restantes
  const previews = document.getElementById('upload-previews').querySelectorAll('.upload-preview');
  newFiles = [];
  previews.forEach((el, i) => {
    el.id = 'np-' + i;
    el.querySelector('button').setAttribute('onclick', `removeNewFile(${i})`);
  });
}

/* ── CONFIG ─────────────────────────────────────────────── */
async function loadConfig() {
  try {
    const cfg = await apiGet('/config');
    document.getElementById('cfg-wpp').value = cfg.whatsapp || '';
  } catch {}
}

async function saveWpp() {
  const wpp = document.getElementById('cfg-wpp').value.trim();
  if (!wpp) { toast('Informe o número do WhatsApp.', 'error'); return; }
  try {
    await apiPut('/config', { whatsapp: wpp });
    toast('WhatsApp atualizado!');
  } catch(e) {
    toast('Erro: ' + e.message, 'error');
  }
}

async function saveSenha() {
  const s1 = document.getElementById('cfg-senha').value;
  const s2 = document.getElementById('cfg-senha2').value;
  if (!s1)     { toast('Informe a nova senha.', 'error'); return; }
  if (s1 !== s2) { toast('As senhas não coincidem.', 'error'); return; }
  if (s1.length < 6) { toast('A senha deve ter ao menos 6 caracteres.', 'error'); return; }
  try {
    await apiPut('/config', { nova_senha: s1 });
    document.getElementById('cfg-senha').value  = '';
    document.getElementById('cfg-senha2').value = '';
    toast('Senha alterada com sucesso!');
  } catch(e) {
    toast('Erro: ' + e.message, 'error');
  }
}

/* ── UTILS ──────────────────────────────────────────────── */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

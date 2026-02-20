/**
 * app.js — Utilitários compartilhados (público + admin)
 */

const API = '/api';
const TOKEN_KEY = 'ghiraldelli_token';

/* ── AUTH ──────────────────────────────────────────────── */
function getToken()       { return localStorage.getItem(TOKEN_KEY); }
function saveToken(t)     { localStorage.setItem(TOKEN_KEY, t); }
function clearToken()     { localStorage.removeItem(TOKEN_KEY); }
function isLoggedIn()     { return !!getToken(); }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

/* ── FETCH HELPERS ─────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição.');
  return data;
}

async function apiGet(path)         { return apiFetch(path); }
async function apiPost(path, body)  { return apiFetch(path, { method: 'POST',   headers: authHeaders(), body: JSON.stringify(body) }); }
async function apiPut(path, body)   { return apiFetch(path, { method: 'PUT',    headers: authHeaders(), body: JSON.stringify(body) }); }
async function apiDelete(path)      { return apiFetch(path, { method: 'DELETE', headers: authHeaders() }); }

/* ── FORMAT ────────────────────────────────────────────── */
function formatPrice(value, transacao) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  return transacao === 'Aluguel' ? fmt + '/mês' : fmt;
}

function formatArea(m2) { return m2 ? `${Number(m2).toLocaleString('pt-BR')} m²` : '—'; }

function fotoUrl(caminho) {
  if (!caminho) return null;
  return `/uploads/${caminho}`;
}

/* ── WHATSAPP ──────────────────────────────────────────── */
let _wpp = '5511999999999';

async function loadWhatsapp() {
  try {
    const cfg = await apiGet('/config');
    if (cfg.whatsapp) _wpp = cfg.whatsapp;
  } catch {}
  // Atualiza botão flutuante
  const float = document.getElementById('wpp-float');
  if (float) float.href = `https://wa.me/${_wpp}`;
}

function whatsappLink(imovel) {
  const msg = imovel
    ? `Olá! Vi o imóvel "${imovel.titulo}" no site da Ghiraldelli e gostaria de mais informações.`
    : 'Olá! Gostaria de informações sobre imóveis.';
  return `https://wa.me/${_wpp}?text=${encodeURIComponent(msg)}`;
}

/* ── TOAST ─────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  let box = document.getElementById('toast-container');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast-container';
    box.className = 'toast-container';
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ── URL HELPERS ────────────────────────────────────────── */
function imovelUrl(id) {
  // Funciona tanto via file:// quanto via servidor Express
  const isAdmin = location.pathname.includes('/admin/');
  return (isAdmin ? '../' : './') + `imovel.html?id=${id}`;
}

function imoveisUrl() {
  const isAdmin = location.pathname.includes('/admin/');
  return (isAdmin ? '../' : './') + 'imoveis.html';
}

/* ── CARD PLACEHOLDER ───────────────────────────────────── */
function cardPlaceholder(tipo) {
  const bg = { Casa: '#0B2545', Apartamento: '#0D2A4A', Terreno: '#0F2318', Comercial: '#1A1006' }[tipo] || '#0B2545';
  return `<div class="card-photo-placeholder" style="background:${bg}">
    <svg class="ph-skyline" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" fill="white" opacity="0.055" preserveAspectRatio="xMidYMax meet">
      <rect x="0"   y="95"  width="42" height="45"/>
      <rect x="48"  y="72"  width="28" height="68"/>
      <polygon points="62,72 62,57 48,72"/>
      <rect x="82"  y="52"  width="44" height="88"/>
      <polygon points="104,52 104,36 82,52"/>
      <rect x="8"   y="97"  width="8" height="8"/><rect x="20" y="97" width="8" height="8"/>
      <rect x="8"   y="109" width="8" height="8"/><rect x="20" y="109" width="8" height="8"/>
      <rect x="52"  y="79"  width="7" height="7"/><rect x="63" y="79" width="7" height="7"/>
      <rect x="86"  y="60"  width="8" height="9"/><rect x="99" y="60" width="8" height="9"/><rect x="112" y="60" width="8" height="9"/>
      <rect x="86"  y="74"  width="8" height="9"/><rect x="99" y="74" width="8" height="9"/><rect x="112" y="74" width="8" height="9"/>
      <rect x="132" y="62"  width="38" height="78"/>
      <polygon points="151,62 151,48 132,62"/>
      <rect x="176" y="82"  width="52" height="58"/>
      <rect x="234" y="52"  width="42" height="88"/>
      <polygon points="255,52 255,36 234,52"/>
      <rect x="282" y="76"  width="38" height="64"/>
      <rect x="137" y="70" width="8" height="8"/><rect x="150" y="70" width="8" height="8"/>
      <rect x="137" y="82" width="8" height="8"/><rect x="150" y="82" width="8" height="8"/>
      <rect x="240" y="60" width="8" height="9"/><rect x="254" y="60" width="8" height="9"/><rect x="268" y="60" width="8" height="9"/>
    </svg>
    <div class="ph-content">
      <div class="ph-icon-wrap">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 24 L26 7 L47 24 L47 46 L5 46 Z" stroke="rgba(201,168,76,.5)" stroke-width="1.8" fill="none"/>
          <rect x="20" y="30" width="12" height="16" rx="1" stroke="rgba(201,168,76,.5)" stroke-width="1.8" fill="none"/>
          <rect x="7"  y="25" width="8"  height="8"  rx="1" stroke="rgba(201,168,76,.3)" stroke-width="1.4" fill="none"/>
          <rect x="37" y="25" width="8"  height="8"  rx="1" stroke="rgba(201,168,76,.3)" stroke-width="1.4" fill="none"/>
          <path d="M2 24 L26 5 L50 24" stroke="rgba(201,168,76,.6)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <span class="ph-label">${tipo}</span>
    </div>
  </div>`;
}

/* ── PROPERTY CARD HTML ─────────────────────────────────── */
function buildCard(im) {
  const foto = im.foto_capa ? `<img src="${fotoUrl(im.foto_capa)}" alt="${im.titulo}" loading="lazy">` : cardPlaceholder(im.tipo);
  const specs = im.tipo !== 'Terreno' ? `
    <div class="card-specs">
      ${im.quartos   > 0 ? `<div class="card-spec"><strong>${im.quartos}</strong> <span>quarto${im.quartos > 1 ? 's' : ''}</span></div>` : ''}
      ${im.banheiros > 0 ? `<div class="card-spec"><strong>${im.banheiros}</strong> <span>banho${im.banheiros > 1 ? 's' : ''}</span></div>` : ''}
      ${im.vagas     > 0 ? `<div class="card-spec"><strong>${im.vagas}</strong> <span>vaga${im.vagas > 1 ? 's' : ''}</span></div>` : ''}
      ${im.area       > 0 ? `<div class="card-spec"><strong>${formatArea(im.area)}</strong></div>` : ''}
    </div>` : `<div class="card-specs"><div class="card-spec"><strong>${formatArea(im.area)}</strong></div></div>`;

  return `
    <div class="property-card">
      <a href="${imovelUrl(im.id)}">
        <div class="card-photo">
          ${foto}
          <div class="card-badges">
            <span class="badge badge-${im.transacao.toLowerCase()}">${im.transacao}</span>
            ${im.destaque ? '<span class="badge badge-destaque">⭐ Destaque</span>' : ''}
          </div>
        </div>
      </a>
      <div class="card-body">
        <div class="card-price">${formatPrice(im.preco, im.transacao)}<small>${im.tipo}</small></div>
        <a href="${imovelUrl(im.id)}"><div class="card-title">${im.titulo}</div></a>
        <div class="card-location">📍 ${im.bairro ? im.bairro + ', ' : ''}${im.cidade}</div>
        ${specs}
        <div class="card-actions">
          <a href="${imovelUrl(im.id)}" class="btn btn-azul btn-sm">Ver detalhes</a>
          <a href="${whatsappLink(im)}" target="_blank" class="btn btn-whatsapp btn-sm">💬 WhatsApp</a>
        </div>
      </div>
    </div>`;
}

/* ── NAV MOBILE ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  loadWhatsapp();
});

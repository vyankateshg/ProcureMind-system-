/* ProcureMind — reusable DOM-generation components. Each returns a DOM node (or string where noted). */
'use strict';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Build a single element from an HTML string. */
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const SEVERITY = {
  Red:    { cls: 'sev-red',    label: 'HIGH RISK',   icon: 'bi-exclamation-octagon-fill', tip: 'High risk: potential restrictive or critical issue. Officer review required.' },
  Orange: { cls: 'sev-orange', label: 'MEDIUM RISK', icon: 'bi-exclamation-triangle-fill', tip: 'Warning: outdated reference or tender/standard mismatch.' },
  Yellow: { cls: 'sev-yellow', label: 'LOW RISK',    icon: 'bi-info-circle-fill',          tip: 'Advisory: a missing reference that should be completed.' },
  Green:  { cls: 'sev-green',  label: 'CLEAR',       icon: 'bi-check-circle-fill',         tip: 'No issue detected.' }
};

const CATEGORY_ICON = { Performance: 'bi-speedometer2', Safety: 'bi-shield-check', Product: 'bi-box-seam', Installation: 'bi-tools' };

const SIGNAL_LABELS = { keyword: 'Keyword', semantic: 'Semantic', isNumber: 'IS number', graphLink: 'Graph link', category: 'Category' };

const GRAPH_META = {
  'Primary':     { icon: 'bi-bullseye',      cls: 'g-primary' },
  'Test Method': { icon: 'bi-beaker',        cls: 'g-test' },
  'Safety':      { icon: 'bi-shield-check',  cls: 'g-safety' },
  'Installation':{ icon: 'bi-tools',         cls: 'g-installation' },
  'Terminology': { icon: 'bi-book',          cls: 'g-terminology' }
};

/* ---------- 1. createRiskBadge(severity, text) ---------- */
function createRiskBadge(severity, text, opts = {}) {
  const s = SEVERITY[severity] || SEVERITY.Yellow;
  return el(`<span class="pm-badge ${s.cls} ${opts.large ? 'lg' : ''}" data-bs-toggle="tooltip" title="${esc(s.tip)}">
    <i class="bi ${s.icon}" aria-hidden="true"></i><span>${esc(text || s.label)}</span></span>`);
}

/* ---------- small shared pieces ---------- */
function confidenceBadge(band) {
  const cls = { High: 'green', Medium: 'orange', Low: 'red' }[band] || 'gray';
  return `<span class="pm-badge ${cls}" data-bs-toggle="tooltip" title="Extraction confidence: how certain the system is that this value was read correctly."><i class="bi bi-bar-chart-fill" aria-hidden="true"></i>${esc(band)}</span>`;
}

function statusBadge(label, cls, icon, tip) {
  return `<span class="pm-badge lg ${cls}" ${tip ? `data-bs-toggle="tooltip" title="${esc(tip)}"` : ''}><i class="bi ${icon}" aria-hidden="true"></i>${esc(label)}</span>`;
}

function simBadge(text = 'Simulated') {
  return `<span class="pm-badge sim" data-bs-toggle="tooltip" title="Demo fixture — not live or officially verified BIS data.">${esc(text)}</span>`;
}

function signalPill(name, level) {
  const lv = String(level || 'None').toLowerCase();
  return `<span class="signal s-${lv}" data-bs-toggle="tooltip" title="${esc(name)} signal strength: ${esc(level)}"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>${esc(name)}</span>`;
}

function matchStatusMeta(status) {
  return ({
    Match:    { cls: 'green',  icon: 'bi-check-circle-fill',        key: 'match' },
    Outdated: { cls: 'orange', icon: 'bi-clock-history',            key: 'outdated' },
    Conflict: { cls: 'red',    icon: 'bi-x-octagon-fill',           key: 'conflict' }
  })[status] || { cls: 'gray', icon: 'bi-question-circle', key: 'other' };
}

/* ---------- 2. createEvidenceCitation(evidenceData) ---------- */
function createEvidenceCitation(ev) {
  const status = ev.status || '';
  const unverified = /unverified/i.test(status);
  const cls = ev.derived ? 'ev-derived' : unverified ? 'ev-unverified' : '';
  const statusCls = unverified ? 'orange' : ev.derived ? 'gray' : /cached/i.test(status) ? 'blue' : 'green';
  const statusIcon = unverified ? 'bi-question-circle-fill' : ev.derived ? 'bi-link-45deg' : 'bi-patch-check-fill';
  const isTender = /tender/i.test(ev.sourceName);
  return el(`<div class="evidence ${cls}" role="group" aria-label="Evidence ${esc(ev.evidenceId)}">
    <div class="ev-top">
      <span class="pm-badge gray"><i class="bi ${isTender ? 'bi-file-earmark-text' : 'bi-bank'}" aria-hidden="true"></i>${esc(isTender ? 'TENDER' : ev.sourceName)}</span>
      <span class="pm-badge ${statusCls}"><i class="bi ${statusIcon}" aria-hidden="true"></i>${esc(status)}</span>
      ${ev.simulated ? simBadge() : ''}
      <span class="ev-id ms-auto">${esc(ev.evidenceId)}</span>
    </div>
    <div class="ev-claim">${esc(ev.claim)}</div>
    <blockquote ${/[ऀ-ॿ]/.test(ev.snippet) ? 'lang="hi"' : ''}>${esc(ev.snippet)}</blockquote>
    <div class="ev-meta">
      <span><i class="bi bi-database" aria-hidden="true"></i>${esc(ev.sourceName)} · ${esc(ev.sourceType)}</span>
      <span><i class="bi bi-calendar-check" aria-hidden="true"></i>Checked ${esc(ev.checkedAt)}</span>
      ${ev.location ? `<span><i class="bi bi-geo-alt" aria-hidden="true"></i>${esc(ev.location)}</span>` : ''}
    </div>
  </div>`);
}

/* ---------- 3. createRequirementRow(reqData) ---------- */
function createRequirementRow(req, flag) {
  const tr = document.createElement('tr');
  if (flag) tr.className = flag === 'Red' ? 'flagged-red' : 'flagged';
  const op = Selectors.opSymbol(req.operator);
  const hasHindi = /[ऀ-ॿ]/.test(req.sourceText);
  tr.innerHTML = `
    <td><span class="cat-chip"><i class="bi ${CATEGORY_ICON[req.category] || 'bi-tag'}" aria-hidden="true"></i>${esc(req.category)}</span><div class="mono text-muted mt-1" style="font-size:.68rem">${esc(req.requirementId)}</div></td>
    <td class="text-capitalize fw-semibold">${esc(req.field)}${flag ? `<div class="mt-1" data-flag></div>` : ''}</td>
    <td><span class="req-value"><span class="req-op" data-bs-toggle="tooltip" title="Operator: ${esc(req.operator)}">${esc(op)}</span>${esc(req.value)}${req.unit ? ' <span class="fw-semibold">' + esc(req.unit) + '</span>' : ''}</span></td>
    <td><span class="src-text" ${hasHindi ? 'lang="hi"' : ''}>“${esc(req.sourceText)}”</span><span class="src-span"><i class="bi bi-geo-alt" aria-hidden="true"></i> ${esc(req.sourceSpan)}${req.editable ? ' · <span data-bs-toggle="tooltip" title="Officer can correct this value before analysis is finalised."><i class="bi bi-pencil"></i> editable</span>' : ''}</span></td>
    <td>${confidenceBadge(req.confidence)}</td>`;
  if (flag) tr.querySelector('[data-flag]').appendChild(createRiskBadge(flag, 'FLAGGED'));
  return tr;
}

/* ---------- 4. createStandardCard(standardData) ---------- */
/** standardData = { std, rec, score, risks[], evidence[] } */
function createStandardCard(d) {
  const { std, rec, score, risks, evidence } = d;
  const primary = rec.role === 'PRIMARY';
  const roleLabel = { PRIMARY: 'Primary standard', TEST: 'Allied · Test method', SAFETY: 'Allied · Safety' }[rec.role] || 'Allied standard';
  const ring = score >= 90 ? 'var(--pm-green)' : score >= 75 ? '#D98A12' : 'var(--pm-red)';
  const sigs = Object.entries(rec.signals || {}).map(([k, v]) => signalPill(SIGNAL_LABELS[k] || k, v)).join('');

  const matches = rec.requirementMatches.map(m => {
    const meta = matchStatusMeta(m.status);
    return `<div class="match m-${meta.key}">
      <span class="pm-badge ${meta.cls}"><i class="bi ${meta.icon}" aria-hidden="true"></i>${esc(m.status.toUpperCase())}</span>
      <div class="m-title">${m.status === 'Match' ? 'Matches' : m.status === 'Outdated' ? 'Outdated against' : 'Conflicts with'} <span class="mono">${esc(Selectors.reqLabel(m.requirementId))}</span></div>
      <div class="m-exp">${esc(m.explanation)}</div>
    </div>`;
  }).join('');

  const collapseId = 'ev-' + rec.recommendationId;
  const card = el(`<article class="std-card ${primary ? 'primary' : 'allied'}" aria-labelledby="t-${rec.recommendationId}">
    <div class="std-head">
      <div class="min-w-0">
        <div class="std-role"><i class="bi ${primary ? 'bi-bullseye' : 'bi-diagram-2'}" aria-hidden="true"></i>${esc(roleLabel)}</div>
        <div class="std-no" id="t-${rec.recommendationId}">${esc(std.isNumber)}</div>
        <p class="std-title">${esc(std.title)}</p>
        <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
          <span class="pm-badge gray">Dept ${esc(std.department)}</span>
          <span class="pm-badge gray">Rev ${esc(std.latestRevision)}</span>
          ${simBadge('Simulated record')}
        </div>
      </div>
      <div class="score" data-bs-toggle="tooltip" title="Match confidence is derived from the ${esc(rec.confidenceBand)} confidence band and the signal strengths below.">
        <div class="score-ring" style="--p:${score};--ring:${ring}" role="img" aria-label="Confidence ${score} percent"><span>${score}<sup>%</sup></span></div>
        <small>${esc(rec.confidenceBand)} confidence</small>
      </div>
    </div>
    <div class="why"><div class="eyebrow"><i class="bi bi-lightbulb" aria-hidden="true"></i>Why recommended</div>${esc(rec.whyRecommended)}</div>
    <div class="signals" aria-label="Matching signals">${sigs}</div>
    <div class="matches"><div class="eyebrow">Requirement matches</div>${matches}</div>
    <div class="std-flags" data-flags></div>
    <div class="std-foot">
      <span><i class="bi bi-building me-1" aria-hidden="true"></i>${esc(std.committee)} · ${esc(std.scopeSummary)}</span>
      <button class="link-btn flex-none" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}"><i class="bi bi-patch-check"></i>Evidence (${evidence.length})</button>
    </div>
    <div class="collapse" id="${collapseId}"><div class="ev-collapse" data-evidence></div></div>
  </article>`);

  const flags = card.querySelector('[data-flags]');
  if (risks.length) {
    flags.insertAdjacentHTML('beforeend', '<span class="eyebrow me-1">Flags</span>');
    risks.forEach(r => {
      const b = createRiskBadge(r.severity, r.title);
      flags.appendChild(b);
    });
  } else {
    flags.innerHTML = '<span class="pm-badge green"><i class="bi bi-check-circle-fill"></i>No risk flags on this standard</span>';
  }
  const evHost = card.querySelector('[data-evidence]');
  evidence.forEach(e => evHost.appendChild(createEvidenceCitation(e)));
  return card;
}

/* ---------- 5. createGraphNode(standardType, label) ---------- */
/** standardType: 'Primary' | 'Test Method' | 'Safety' | 'Installation' | 'Terminology'. label: { isNumber, title, rev, badges[] } or null for empty slot. */
function createGraphNode(standardType, label, pos) {
  const meta = GRAPH_META[standardType] || GRAPH_META.Terminology;
  const style = pos ? `left:${pos.x}%;top:${pos.y}%` : '';
  if (!label) {
    return el(`<div class="gnode g-empty" style="${style}"><div class="g-cat"><i class="bi ${meta.icon}" aria-hidden="true"></i>${esc(standardType)}</div><div class="g-title">No allied standard linked in dataset</div></div>`);
  }
  const badges = (label.badges || []).map(b => `<span class="pm-badge ${b.cls}">${esc(b.text)}</span>`).join('');
  return el(`<div class="gnode ${meta.cls}" style="${style}" tabindex="0" data-bs-toggle="tooltip" title="${esc(label.title)}">
    <div class="g-cat"><i class="bi ${meta.icon}" aria-hidden="true"></i>${esc(standardType === 'Primary' ? 'Primary standard' : standardType)}</div>
    <div class="g-no">${esc(label.isNumber)}</div>
    <div class="g-title">${esc(label.title)}</div>
    <div class="g-foot"><span class="pm-badge gray">Rev ${esc(label.rev)}</span>${badges}</div>
  </div>`);
}

/* ---------- Extra composed components ---------- */
function createRiskCard(risk) {
  const s = SEVERITY[risk.severity] || SEVERITY.Yellow;
  const cls = 'r-' + risk.severity.toLowerCase();
  const stds = risk.standardIds.map(Data.standard).filter(Boolean);
  const reqs = risk.triggerRequirementIds.map(Data.requirement).filter(Boolean);
  const card = el(`<article class="risk-card ${cls}" id="risk-${risk.riskId}" aria-labelledby="rt-${risk.riskId}">
    <div class="risk-head">
      <i class="bi ${s.icon} r-ico" aria-hidden="true"></i>
      <div class="flex-grow-1">
        <h3 class="risk-title" id="rt-${risk.riskId}">${esc(risk.title)}</h3>
        <span class="risk-type">${esc(risk.type)} · ${esc(risk.riskId)}</span>
      </div>
      <div class="d-flex flex-column align-items-end gap-1" data-sev></div>
    </div>
    <p class="risk-msg">${esc(risk.message)}</p>
    <div class="risk-trig">
      <div class="eyebrow mb-1">Triggered by</div>
      ${reqs.map(r => `<span class="chip"><i class="bi bi-file-earmark-text" aria-hidden="true"></i>${esc(r.field)}: <strong>${esc(r.value)}${r.unit ? ' ' + esc(r.unit) : ''}</strong></span>`).join('')}
      ${stds.map(t => `<span class="chip mono"><i class="bi bi-journal-bookmark" aria-hidden="true"></i>${esc(t.isNumber)}</span>`).join('')}
    </div>
    <div class="risk-ev"><div class="eyebrow mt-3">Evidence</div><div data-evidence></div></div>
  </article>`);
  const sev = card.querySelector('[data-sev]');
  sev.appendChild(createRiskBadge(risk.severity, null, { large: true }));
  if (risk.requiresOfficerReview) sev.insertAdjacentHTML('beforeend', '<span class="pm-badge gray"><i class="bi bi-person-check" aria-hidden="true"></i>Officer review required</span>');
  const host = card.querySelector('[data-evidence]');
  Selectors.evidenceForRisk(risk).forEach(e => host.appendChild(createEvidenceCitation(e)));
  return card;
}

function createVerificationRow(std) {
  const life = Selectors.lifecycle(std);
  const cited = Selectors.citedRevision(std);
  const revs = std.revisions.map(r => {
    const cls = r === std.latestRevision ? 'latest' : (cited && r === cited ? 'cited' : '');
    return `<span class="rev-pill ${cls}">${esc(r)}${r === std.latestRevision ? ' · latest' : ''}${cited && r === cited ? ' · cited in tender' : ''}</span>`;
  }).join('<i class="bi bi-arrow-right text-muted" style="font-size:.7rem" aria-hidden="true"></i>');
  return el(`<div class="ver-row">
    <div>
      <div class="mono fw-medium" style="color:var(--pm-navy)">${esc(std.isNumber)}</div>
      <div class="small text-muted mt-1">${esc(std.title)}</div>
      <div class="mt-2">${simBadge('Simulated BIS status')}</div>
    </div>
    <div><div class="k">Status</div>${statusBadge(life.label, life.cls, life.icon, life.label === 'ACTIVE' ? 'Active standard (simulated status). Not officially verified.' : 'Superseded by a newer standard.')}</div>
    <div><div class="k">Latest revision</div><div class="v mono">${esc(std.latestRevision)}</div><div class="rev-trail">${revs}</div>${cited && cited !== std.latestRevision ? `<div class="mt-2">${statusBadge('Tender cites ' + cited, 'orange', 'bi-exclamation-triangle-fill', 'The tender references an older edition than the latest simulated revision.')}</div>` : ''}</div>
    <div><div class="k">Amendments</div><div class="v">${std.amendments.length ? std.amendments.map(a => `<span class="rev-pill">${esc(a)}</span>`).join(' ') : '<span class="text-muted fw-normal">None recorded</span>'}</div><div class="small text-muted mt-2">Checked ${esc(std.checkedAt)}</div></div>
  </div>`);
}

function createCertCard(cert) {
  const scheme = cert.scheme.replace(/\s*\(.*\)/, '');
  const full = (cert.scheme.match(/\((.*)\)/) || [])[1] || cert.scheme;
  return el(`<div class="cert-card">
    <div class="d-flex justify-content-between align-items-start gap-2">
      <div><div class="eyebrow">Scheme</div><div class="fw-bold fs-6"><abbr data-bs-toggle="tooltip" title="${esc(full)} — BIS scheme under which notified products must be registered and carry the Standard Mark before sale.">${esc(scheme)}</abbr></div></div>
      ${statusBadge(cert.status.toUpperCase() + ' · MANDATORY', 'blue', 'bi-award-fill', 'Mandatory certification flagged for this product category.')}
    </div>
    <div class="small mt-2"><strong>Product category:</strong> ${esc(cert.productCategory)}</div>
    <div class="small text-muted mt-1">${esc(cert.reason)}</div>
    <div class="mt-2">${simBadge('Simulated mapping')}${cert.evidenceIds.length ? '' : ' <span class="small text-muted">No evidence record linked.</span>'}</div>
  </div>`);
}

function createStatCard(n, label, cls = '') {
  return el(`<div class="col-6 col-lg-3"><div class="stat"><div class="n ${cls}">${esc(n)}</div><div class="l">${esc(label)}</div></div></div>`);
}

/* ProcureMind — maps AppState to the screen. */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmtTime = iso => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const SEV_RANK = { Red: 3, Orange: 2, Yellow: 1 };

const Renderer = {
  /* ===== infrastructure ===== */
  initTooltips(root = document) {
    $$('[data-bs-toggle="tooltip"]', root).forEach(n => {
      if (!bootstrap.Tooltip.getInstance(n)) new bootstrap.Tooltip(n, { container: 'body', trigger: 'hover focus' });
    });
  },
  disposeTooltips(root) {
    $$('[data-bs-toggle="tooltip"]', root).forEach(n => { const t = bootstrap.Tooltip.getInstance(n); if (t) t.dispose(); });
  },
  setContent(sel, nodeOrHtml) {
    const host = typeof sel === 'string' ? $(sel) : sel;
    this.disposeTooltips(host);
    host.innerHTML = '';
    if (typeof nodeOrHtml === 'string') host.innerHTML = nodeOrHtml;
    else if (Array.isArray(nodeOrHtml)) nodeOrHtml.forEach(n => host.appendChild(n));
    else if (nodeOrHtml) host.appendChild(nodeOrHtml);
    this.initTooltips(host);
  },

  toast(title, message, kind = 'primary', code) {
    const host = $('#toastHost');
    const t = el(`<div class="toast pm-toast t-${kind}" role="status" aria-live="polite" data-bs-delay="6000">
      <div class="toast-body d-flex gap-2 align-items-start">
        <div class="flex-grow-1"><div class="t-title">${esc(title)}</div><div>${esc(message)}</div>${code ? `<div class="t-code mt-1">${esc(code)}</div>` : ''}
          <button type="button" class="link-btn mt-2" data-audit-open><i class="bi bi-journal-text"></i>View audit trail</button></div>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div></div>`);
    host.appendChild(t);
    const inst = new bootstrap.Toast(t);
    t.addEventListener('hidden.bs.toast', () => t.remove());
    t.querySelector('[data-audit-open]').addEventListener('click', () => { bootstrap.Offcanvas.getOrCreateInstance('#auditPanel').show(); inst.hide(); });
    inst.show();
  },

  /* ===== navigation ===== */
  renderStepNav() {
    const nav = $('#stepNav');
    nav.innerHTML = STEPS.map(s => `<li><a class="step-link locked" href="#step-${s.id}" data-step="${s.id}"><span class="num">${s.id}</span><span class="meta">${esc(s.title)}<small>${esc(s.sub)}</small></span></a></li>`).join('');
    this.updateStepNav();
  },
  updateStepNav() {
    const rev = AppState.revealedStage;
    const worst = AppState.risks.reduce((m, r) => Math.max(m, SEV_RANK[r.severity] || 0), 0);
    const ds = Selectors.decisionState().status;
    $$('.step-link', $('#stepNav')).forEach(a => {
      const id = +a.dataset.step;
      a.classList.remove('locked', 'ready', 'done', 'warn', 'alert');
      const numEl = $('.num', a);
      numEl.innerHTML = id;
      if (id === 1) a.classList.add(AppState.currentScenarioId ? (rev >= 1 ? 'done' : 'ready') : 'ready');
      else if (id > rev) a.classList.add('locked');
      else a.classList.add('done');
      if (id === 6 && rev >= 6 && worst) a.classList.replace('done', worst === 3 ? 'alert' : 'warn');
      if (id === 7) { if (rev >= 7 && ds === 'PENDING') { a.classList.remove('done'); a.classList.add('ready'); } }
      if (a.classList.contains('done')) numEl.innerHTML = '<i class="bi bi-check-lg"></i>';
      if (a.classList.contains('warn') || a.classList.contains('alert')) numEl.innerHTML = '<i class="bi bi-exclamation-lg"></i>';
    });
  },
  setActiveStep(id) {
    $$('.step-link', $('#stepNav')).forEach(a => a.classList.toggle('active', +a.dataset.step === id));
  },

  /* ===== scenario selection (step 1) ===== */
  renderScenarioPicker() {
    const titles = { SCENARIO_A: 'Street Light', LED_STREET_LIGHT: 'LED Street Light', LED_BULB: 'LED Bulb (Hindi)', LED_FLOOD_LIGHT: 'LED Flood Light' };
    const running = AppState.analysisStatus === 'running';
    const html = Data.scenarios().map(s => {
      const t = Data.tender(s.scenarioId);
      const letter = s.scenarioId.slice(-1);
      const sel = AppState.currentScenarioId === s.scenarioId;
      return `<div class="col-md-4"><button type="button" class="scenario-card ${sel ? 'selected' : ''}" role="radio" aria-checked="${sel}" data-scenario="${s.scenarioId}" ${running ? 'disabled' : ''}>
        <i class="bi bi-check-circle-fill tick" aria-hidden="true"></i>
        <div class="sc-id">Scenario ${letter} · ${esc(t.tenderNumber)}</div>
        <div class="sc-title">${esc(titles[s.type] || t.product)} <span class="lang-tag ms-1">${s.language === 'hi' ? 'हिन्दी' : 'EN'}</span></div>
        <p class="sc-desc">${esc(s.description)}</p>
        <div class="d-flex gap-1 flex-wrap"><span class="pm-badge gray"><i class="bi bi-file-earmark-pdf"></i>${esc(t.sourceFile)}</span></div>
      </button></div>`;
    }).join('');
    this.setContent('#scenarioPicker', html);
  },

  renderPipeline(items, states) {
    $('#pipeline').innerHTML = items.map((label, i) => {
      const st = states[i] || 'pending';
      return `<li class="${st}"><span class="dot">${st === 'done' ? '<i class="bi bi-check-lg"></i>' : ''}</span><span>${esc(label)}</span></li>`;
    }).join('');
  },

  renderDropzone(phase, pct = 0) {
    const t = AppState.tenderData;
    const dz = $('#dropzone');
    dz.classList.toggle('idle', !t);
    $('#dzName').textContent = t ? t.sourceFile : 'No document selected';
    const meta = { idle: t ? 'Ready to analyze · PDF' : 'Select a scenario above to attach its tender PDF.', upload: 'Uploading…', parse: 'Uploaded · parsing', done: 'Parsed successfully' }[phase] || '';
    $('#dzMeta').textContent = t ? meta : 'Select a scenario above to attach its tender PDF.';
    const wrap = $('#dzProgressWrap');
    wrap.classList.toggle('d-none', !(phase === 'upload'));
    $('#dzProgress').style.width = pct + '%';
    wrap.setAttribute('aria-valuenow', pct);
  },

  renderMeta() {
    const t = AppState.tenderData;
    const tr = AppState.translation;
    const hi = t.language === 'hi';
    const html = `<dl class="kv">
        <dt>Tender no.</dt><dd class="mono">${esc(t.tenderNumber)}</dd>
        <dt>Title</dt><dd ${hi ? 'lang="hi"' : ''}>${esc(t.title)}</dd>
        <dt>Department</dt><dd>${esc(t.department)}</dd>
        <dt>Product</dt><dd>${esc(t.product)} <span class="text-muted">· ${esc(t.productFamily)}</span></dd>
        <dt>Application</dt><dd>${esc(t.application)}</dd>
        <dt>Language</dt><dd><span class="lang-tag">${esc(t.language)}</span> ${hi ? '<span class="small text-muted">Devanagari detected</span>' : ''}</dd>
        <dt>Summary</dt><dd class="fw-normal">${esc(t.summary)}</dd>
        <dt>Fingerprint</dt><dd class="mono">${esc(t.fingerprint)}</dd>
      </dl>
      ${tr ? `<div class="mt-3 p-2 rounded" style="background:var(--pm-blue-soft);border:1px solid #C5D8FA">
         <div class="eyebrow" style="color:var(--pm-blue-dark)"><i class="bi bi-translate"></i> Translation ${simBadge('Simulated')}</div>
         <div class="mt-1" lang="hi" style="font-size:.9rem">${esc(tr.originalText)}</div>
         <div class="small text-muted">→ ${esc(tr.englishTranslation)}</div></div>` : ''}`;
    this.setContent('#metaBody', html);
    $('#metaCard').classList.add('fade-in-up');
  },

  /* ===== step 2 ===== */
  renderRequirements() {
    const flagFor = req => {
      const rs = AppState.risks.filter(r => r.triggerRequirementIds.includes(req.requirementId));
      if (!rs.length) return null;
      return rs.reduce((a, b) => (SEV_RANK[b.severity] > SEV_RANK[a.severity] ? b : a)).severity;
    };
    const rows = AppState.requirements.map(r => createRequirementRow(r, flagFor(r)));
    this.setContent('#reqBody', rows);

    const byConf = k => AppState.requirements.filter(r => r.confidence === k).length;
    const cats = {};
    AppState.requirements.forEach(r => { cats[r.category] = (cats[r.category] || 0) + 1; });
    const flagged = AppState.requirements.filter(flagFor).length;
    this.setContent('#reqSummary', `<span class="pm-badge blue lg"><i class="bi bi-list-check"></i>${AppState.requirements.length} requirements extracted</span>`);
    this.setContent('#reqSide', `<div class="pm-card h-100"><div class="pm-card-head"><h3><i class="bi bi-bar-chart"></i>Extraction summary</h3></div><div class="pm-card-body">
      <div class="eyebrow mb-2">By category</div>
      ${Object.entries(cats).map(([c, n]) => `<div class="d-flex justify-content-between small py-1 border-bottom"><span class="cat-chip"><i class="bi ${CATEGORY_ICON[c] || 'bi-tag'}"></i>${esc(c)}</span><strong>${n}</strong></div>`).join('')}
      <div class="eyebrow mt-3 mb-2">By confidence</div>
      <div class="d-flex gap-2 flex-wrap">${['High', 'Medium', 'Low'].filter(k => byConf(k)).map(k => `${confidenceBadge(k)}<span class="small me-2 align-self-center">×${byConf(k)}</span>`).join('')}</div>
      ${flagged ? `<div class="mt-3 p-2 rounded small" style="background:var(--pm-orange-bg);border:1px solid var(--pm-orange-bd);color:var(--pm-orange)"><i class="bi bi-exclamation-triangle-fill me-1"></i><strong>${flagged}</strong> requirement${flagged > 1 ? 's' : ''} triggered a risk flag (highlighted in the table).</div>` : ''}
      <div class="small text-muted mt-3"><i class="bi bi-info-circle me-1"></i>Medium or Low confidence values should be checked against the source page before relying on them.</div>
    </div></div>`);
  },

  /* ===== step 3 ===== */
  renderRecommendations() {
    const recs = [...AppState.recommendations].sort((a, b) => (a.role === 'PRIMARY' ? -1 : 0) - (b.role === 'PRIMARY' ? -1 : 0));
    const cards = recs.map(rec => createStandardCard({
      std: Data.standard(rec.standardId), rec,
      score: Selectors.confidenceScore(rec),
      risks: Selectors.risksForRec(rec),
      evidence: Selectors.evidenceForRec(rec)
    }));
    this.setContent('#recList', cards);
    $$('.std-card', $('#recList')).forEach((c, i) => c.classList.add('fade-in-up', 'd' + Math.min(i + 1, 5)));
    this.setContent('#recSummary', `<span class="pm-badge blue lg"><i class="bi bi-bullseye"></i>${recs.length} standard${recs.length > 1 ? 's' : ''} recommended</span>`);
  },

  /* ===== step 4 ===== */
  renderGraph() {
    const g = Selectors.graph();
    const POS = { Primary: { x: 50, y: 50 }, 'Test Method': { x: 87, y: 20 }, Safety: { x: 87, y: 80 }, Installation: { x: 13, y: 20 }, Terminology: { x: 13, y: 80 } };
    const host = $('#graph');
    this.disposeTooltips(host);
    host.innerHTML = '';
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    host.appendChild(svg);

    const nodes = [];
    if (g.root) {
      const sBadges = [{ cls: 'green', text: Selectors.lifecycle(g.root).label }];
      nodes.push(createGraphNode('Primary', { isNumber: g.root.isNumber, title: g.root.title, rev: g.root.latestRevision, badges: sBadges }, POS.Primary));
    }
    g.categories.forEach(cat => {
      const items = g.allied.filter(a => a.category === cat);
      if (!items.length) { nodes.push(createGraphNode(cat, null, POS[cat])); return; }
      items.forEach(a => {
        const badges = [a.recommended ? { cls: 'blue', text: 'Recommended' } : { cls: 'orange', text: 'Not in recommendation set' }];
        nodes.push(createGraphNode(cat, { isNumber: a.std.isNumber, title: a.std.title, rev: a.std.latestRevision, badges }, POS[cat]));
      });
    });
    g.allied.forEach(a => {
      const p = POS[a.category];
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', POS.Primary.x + '%'); line.setAttribute('y1', POS.Primary.y + '%');
      line.setAttribute('x2', p.x + '%'); line.setAttribute('y2', p.y + '%');
      line.setAttribute('class', 'edge-line ' + (a.edge.type === 'TEST_METHOD_FOR' ? 'test' : 'safety'));
      svg.appendChild(line);
      const lbl = el(`<span class="edge-label" style="left:${(POS.Primary.x + p.x) / 2}%;top:${(POS.Primary.y + p.y) / 2}%">${esc(a.edge.label)}</span>`);
      host.appendChild(lbl);
    });
    nodes.forEach(n => host.appendChild(n));
    this.initTooltips(host);

    // ledger (hierarchical tree)
    if (!g.root) { this.setContent('#graphTree', '<div class="empty-note">No primary standard.</div>'); return; }
    const relName = { TEST_METHOD_FOR: 'Test method', REFERENCES: 'Normative reference' };
    const tree = g.allied.length
      ? `<ul>${g.allied.map(a => `<li><div class="rel">${esc(relName[a.edge.type] || a.edge.type)} · ${esc(a.category)}</div>
          <div class="d-flex align-items-center gap-2 flex-wrap mt-1"><span class="mono fw-medium" style="color:var(--pm-navy)">${esc(a.std.isNumber)}</span>${a.recommended ? '<span class="pm-badge blue">Recommended</span>' : '<span class="pm-badge orange">Not in recommendation set</span>'}</div>
          <div class="small text-muted">${esc(a.std.title)}</div>
          <div class="small mt-1"><i class="bi bi-link-45deg"></i> ${esc(a.edge.label)} · <span class="text-muted">${a.edge.evidenceIds.length ? a.edge.evidenceIds.length + ' evidence' : 'relationship from simulated graph fixture; no evidence record'}</span></div></li>`).join('')}</ul>`
      : '<div class="empty-note">No allied standards are linked to this primary standard in the dataset. The officer may still check for test-method and safety references manually.</div>';
    this.setContent('#graphTree', `<div class="tree"><div class="t-root"><i class="bi bi-bullseye text-primary"></i><div><div class="mono fw-medium" style="color:var(--pm-navy)">${esc(g.root.isNumber)}</div><div class="small text-muted">${esc(g.root.title)}</div></div></div>${tree}</div>`);

    this.setContent('#graphCoverage', g.categories.map(cat => {
      const n = g.allied.filter(a => a.category === cat).length;
      const m = GRAPH_META[cat];
      return `<div class="d-flex align-items-center justify-content-between py-2 border-bottom"><span class="cat-chip"><i class="bi ${m.icon}"></i>${esc(cat)}</span>${n ? `<span class="pm-badge green"><i class="bi bi-check-circle-fill"></i>${n} linked</span>` : '<span class="pm-badge gray">None linked</span>'}</div>`;
    }).join('') + '<div class="small text-muted mt-3"><i class="bi bi-info-circle me-1"></i>Coverage reflects the demo graph only; empty categories are not proof that no standard applies.</div>');
  },

  /* ===== step 5 ===== */
  renderVerification() {
    const seen = new Set();
    const stds = AppState.recommendations.map(r => Data.standard(r.standardId)).filter(s => s && !seen.has(s.id) && seen.add(s.id));
    this.setContent('#verBody', stds.map(createVerificationRow));
    const certs = AppState.certifications;
    const certHtml = certs.length ? certs.map(createCertCard)
      : [el(`<div class="cert-card cert-none"><i class="bi bi-dash-circle me-1"></i>No mandatory certification scheme is mapped to this product in the dataset. <div class="mt-2">${simBadge('Simulated mapping')}</div><div class="mt-2">The officer should still confirm <abbr data-bs-toggle="tooltip" title="Compulsory Registration Scheme — BIS scheme requiring registration and the Standard Mark for notified products.">CRS</abbr> applicability for this product.</div></div>`)];
    this.setContent('#certBody', certHtml);
  },

  /* ===== step 6 ===== */
  renderRisks() {
    const risks = [...AppState.risks].sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity]);
    const host = $('#riskList');
    if (!risks.length) {
      this.setContent(host, `<div class="allclear fade-in-up" role="status"><div class="big"><i class="bi bi-check-lg" aria-hidden="true"></i></div>
        <h4>All Clear</h4><p>No risk flags were raised by the simulated checks for this tender: no outdated references, missing test methods, restrictive specifications or tender-standard mismatches.</p>
        <p class="mt-2"><strong>Officer review is still required</strong> before a final decision.</p></div>`);
      this.setContent('#riskSummary', '<span class="pm-badge green lg"><i class="bi bi-check-circle-fill"></i>0 risk flags</span>');
      this.setContent('#ackList', '<div class="empty-note">Nothing to acknowledge. You may proceed to the decision.</div>');
      $('#ackProgress').textContent = '';
      return;
    }
    const cards = risks.map(createRiskCard);
    this.setContent(host, cards);
    cards.forEach((c, i) => c.classList.add('fade-in-up', 'd' + Math.min(i + 1, 5)));
    const count = k => risks.filter(r => r.severity === k).length;
    this.setContent('#riskSummary', ['Red', 'Orange', 'Yellow'].filter(count).map(k => { const b = createRiskBadge(k, `${count(k)} ${SEVERITY[k].label}`, { large: true }); return b.outerHTML; }).join(' '));
    this.renderAckList();
  },
  renderAckList() {
    const risks = AppState.risks.filter(r => r.requiresOfficerReview);
    this.setContent('#ackList', risks.map(r => {
      const ck = !!AppState.acknowledged[r.riskId];
      return `<div class="form-check ${ck ? 'checked' : ''}"><input class="form-check-input" type="checkbox" id="ack-${r.riskId}" data-risk="${r.riskId}" ${ck ? 'checked' : ''}><label for="ack-${r.riskId}">${esc(r.title)}<small>${esc(r.riskId)} · I have reviewed the evidence</small></label></div>`;
    }).join('') || '<div class="empty-note">No flags require acknowledgement.</div>');
    const done = risks.filter(r => AppState.acknowledged[r.riskId]).length;
    $('#ackProgress').textContent = risks.length ? `${done}/${risks.length} reviewed` : '';
  },

  /* ===== step 7 + decision bar ===== */
  renderSummary() {
    const primary = Selectors.primaryRec();
    if (!primary) return;
    const std = Data.standard(primary.standardId);
    const needAck = AppState.risks.filter(r => r.requiresOfficerReview);
    const ackDone = needAck.filter(r => AppState.acknowledged[r.riskId]).length;
    const stats = [
      createStatCard(AppState.requirements.length, 'Requirements extracted'),
      createStatCard(AppState.recommendations.length, 'Standards recommended'),
      createStatCard(AppState.risks.length, 'Risk flags raised', AppState.risks.length ? '' : 'text-success'),
      createStatCard(needAck.length ? `${ackDone}/${needAck.length}` : '—', 'Flags reviewed by officer')
    ];
    this.setContent('#summaryStats', stats);
    const life = Selectors.lifecycle(std);
    const cited = Selectors.citedRevision(std);
    const certs = AppState.certifications;
    this.setContent('#summaryBody', `<dl class="kv">
      <dt>Primary standard</dt><dd><span class="mono">${esc(std.isNumber)}</span> · ${esc(std.title)}</dd>
      <dt>Match confidence</dt><dd><span class="conf conf-high">${Selectors.confidenceScore(primary)}%</span> <span class="text-muted">(${esc(primary.confidenceBand)})</span></dd>
      <dt>BIS status</dt><dd>${statusBadge(life.label, life.cls, life.icon)} ${simBadge()}</dd>
      <dt>Revision</dt><dd>Latest ${esc(std.latestRevision)}${cited && cited !== std.latestRevision ? ` · <span style="color:var(--pm-orange);font-weight:600">tender cites ${esc(cited)}</span>` : ''}</dd>
      <dt>Certification</dt><dd>${certs.length ? certs.map(c => esc(c.scheme.split(' (')[0]) + ' — ' + esc(c.status)).join(', ') : '<span class="text-muted">None mapped in dataset</span>'}</dd>
      <dt>Open items</dt><dd>${needAck.length - ackDone ? `<span style="color:var(--pm-orange);font-weight:600">${needAck.length - ackDone} flag(s) awaiting review</span>` : '<span style="color:var(--pm-green);font-weight:600">None</span>'}</dd>
    </dl>
    <div class="small text-muted mt-3"><i class="bi bi-shield-lock me-1"></i>The AI never accepts, modifies or rejects on its own. The recorded action is the officer's.</div>`);
    this.renderDecisionHistory();
  },
  renderDecisionHistory() {
    const list = AppState.decisions.filter(d => !d.fixture || d.status !== 'PENDING');
    const pending = Selectors.decisionState();
    const items = [...AppState.decisions].reverse().map(d => `<li class="officer-evt t-${d.status}">
        <span class="status-pill ${d.status}">${esc(d.status)}</span> ${d.fixture ? '<span class="pm-badge sim">Demo record</span>' : ''}
        <div class="when mt-1">${esc(fmtTime(d.timestamp))} · <span class="mono">${esc(d.decisionId)}</span></div>
        ${d.modification ? `<div class="small mt-1"><strong>Modification:</strong> ${esc(d.modification)}</div>` : ''}
        ${d.reason ? `<div class="small mt-1">“${esc(d.reason)}”</div>` : '<div class="small text-muted mt-1">No reason recorded yet.</div>'}</li>`).join('');
    this.setContent('#decisionHistory', items ? `<ul class="timeline">${items}</ul>` : `<div class="empty-note">No decision recorded yet. Current status: <span class="status-pill PENDING">${esc(pending.status)}</span></div>`);
  },
  renderDecisionBar(show = true) {
    const primary = Selectors.primaryRec();
    const bar = $('#decisionBar');
    if (!primary) { bar.classList.remove('show'); return; }
    const std = Data.standard(primary.standardId);
    $('#dbStd').textContent = `${std.isNumber}`;
    const pend = Selectors.pendingAcks().filter(r => r.requiresOfficerReview).length;
    $('#dbNote').innerHTML = pend
      ? `<i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>${pend} flagged risk${pend > 1 ? 's' : ''} awaiting your review (Step 6)`
      : `<i class="bi bi-check-circle-fill text-success me-1"></i>All flagged risks reviewed`;
    const st = Selectors.decisionState();
    const icon = { PENDING: 'bi-hourglass-split', ACCEPTED: 'bi-check-circle-fill', MODIFIED: 'bi-pencil-square', REJECTED: 'bi-x-circle-fill' }[st.status];
    $('#dbStatus').innerHTML = `<span class="eyebrow d-block mb-1">Status</span><span class="status-pill ${st.status}"><i class="bi ${icon}"></i>${esc(st.status)}</span>`;
    bar.classList.toggle('show', show);
  },

  /* ===== audit ===== */
  renderAudit() {
    $('#auditCount').textContent = AppState.auditLog.length;
    $('#auditList').innerHTML = AppState.auditLog.length
      ? [...AppState.auditLog].reverse().map(a => `<li class="${a.actor === 'PROCUREMENT_OFFICER' ? 'officer-evt' : ''} ${(a.event.match(/DECISION_(\w+)/) || [])[0] ? 't-' + a.event.split('_')[1] : ''}">
          <div class="actor">${esc(a.actor.replace('_', ' '))}</div><div class="evt">${esc(a.event)}</div>
          <div class="when">${esc(fmtTime(a.timestamp))} · ${esc(a.id)} · ${esc(a.target)}</div><div class="small mt-1">${esc(a.detail)}</div></li>`).join('')
      : '<li class="text-muted">No events yet. Run an analysis to begin the audit trail.</li>';
  },

  /* ===== stage reveal ===== */
  hideAllStages() {
    for (let i = 2; i <= 7; i++) { const s = $('#step-' + i); s.hidden = true; s.classList.remove('is-visible'); }
    $('#decisionBar').classList.remove('show');
    $('#metaCard').classList.remove('fade-in-up');
  },
  revealStage(n) {
    AppState.revealedStage = Math.max(AppState.revealedStage, n);
    const s = $('#step-' + n);
    if (n > 1) {
      s.hidden = false; s.classList.add('is-visible');
      $$('.pm-card, .stage-head', s).forEach((c, i) => { if (!c.closest('.std-card,.risk-card,.pm-card .pm-card')) c.classList.add('fade-in-up', 'd' + Math.min(i, 5)); });
    }
    this.updateStepNav();
  },

  /* ===== scenario loaded: rebuild the whole UI ===== */
  onScenarioLoaded() {
    const t = AppState.tenderData;
    this.hideAllStages();
    $('#tenderChipText').textContent = t ? `${t.tenderNumber} · ${t.product}` : 'No tender loaded';
    this.renderScenarioPicker();
    this.renderDropzone('idle');
    this.setContent('#metaBody', '<div class="empty-note">Metadata appears after the PDF is parsed.</div>');
    $('#analyzeBtn').disabled = !t;
    $('#analyzeBtnText').textContent = 'Analyze Tender';
    this.renderPipeline(PIPELINE_LABELS, []);
    this.renderAudit();
    this.updateStepNav();
  },
  onAnalysisComplete() {
    $('#analyzeBtn').disabled = false;
    $('#analyzeBtnText').textContent = 'Re-run analysis';
    this.renderScenarioPicker();
  }
};

const PIPELINE_LABELS = [
  'Uploading tender PDF',
  'Parsing document & detecting language',
  'Extracting requirements',
  'Semantic matching against IS catalogue',
  'Building normative / allied graph',
  'Checking standard status (simulated BIS)',
  'Scanning risks & collecting evidence'
];

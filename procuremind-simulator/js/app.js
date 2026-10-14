/* ProcureMind — initialization, event listeners and the simulated analysis sequence. */
'use strict';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let userScrolled = false;
let decisionType = null;

/* ---------- Analysis simulation ---------- */
async function runAnalysis() {
  const id = AppState.currentScenarioId;
  if (!id || AppState.analysisStatus === 'running') return;

  loadScenario(id);                       // fresh state (also resets previous results on re-run)
  AppState.analysisStatus = 'running';
  userScrolled = false;
  Renderer.renderScenarioPicker();        // disables picker while running
  $('#analyzeBtn').disabled = true;
  $('#analyzeBtnText').textContent = 'Analyzing…';

  const states = [];
  const set = (i, st) => { states[i] = st; Renderer.renderPipeline(PIPELINE_LABELS, states); };
  const follow = n => { if (!userScrolled && n > 1) $('#step-' + n).scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const step = async (i, work, stage, auditEvent, auditDetail) => {
    set(i, 'running');
    await sleep(CONFIG.stepDelay);
    work();
    if (stage) { Renderer.revealStage(stage); follow(stage); }
    if (auditEvent) logAudit('SYSTEM', auditEvent, typeof auditDetail === 'function' ? auditDetail() : auditDetail);
    set(i, 'done');
  };

  // 0. upload
  set(0, 'running');
  const ticks = 10;
  for (let k = 1; k <= ticks; k++) { Renderer.renderDropzone('upload', Math.round(k / ticks * 100)); await sleep(CONFIG.uploadMs / ticks); }
  Renderer.renderDropzone('parse', 100);
  set(0, 'done');

  const t = AppState.tenderData;
  await step(1, () => { Renderer.renderMeta(); Renderer.renderDropzone('done'); }, 1, 'TENDER_UPLOADED', 'PDF uploaded and parsed.');
  await step(2, () => Renderer.renderRequirements(), 2, 'REQUIREMENTS_EXTRACTED', () => `Extracted ${AppState.requirements.length} requirements.`);
  await step(3, () => Renderer.renderRecommendations(), 3, 'STANDARDS_RECOMMENDED', () => `${AppState.recommendations.length} standard(s) recommended: ${AppState.recommendations.map(r => Data.standard(r.standardId).isNumber).join('; ')}.`);
  await step(4, () => Renderer.renderGraph(), 4, 'GRAPH_BUILT', () => `${Selectors.graph().allied.length} allied standard link(s) resolved.`);
  await step(5, () => Renderer.renderVerification(), 5, 'STATUS_CHECKED', 'Standard status checked against simulated BIS records.');
  await step(6, () => Renderer.renderRisks(), 6, 'RISKS_FLAGGED', () => AppState.risks.length ? `${AppState.risks.length} risk flag(s) raised; officer review required.` : 'No risk flags raised.');

  Renderer.renderSummary();
  Renderer.revealStage(7);
  Renderer.renderDecisionBar(true);
  follow(7);

  AppState.analysisStatus = 'done';
  Renderer.onAnalysisComplete();
  Renderer.updateStepNav();
  Renderer.toast('Analysis complete', `${t.tenderNumber} is ready for officer review.`, 'success');
}

/* ---------- Decisions ---------- */
function modificationOptions() {
  const std = Data.standard(Selectors.primaryRec().standardId);
  const map = {
    OUTDATED_STANDARD: `Update tender reference to latest revision (${std.isNumber}: ${std.latestRevision})`,
    MISSING_TEST_REFERENCE: 'Add normative test-method reference (e.g. IS/IEC 60529)',
    POTENTIALLY_RESTRICTIVE_SPECIFICATION: 'Remove or generalise single-brand clause',
    TENDER_STANDARD_MISMATCH: 'Amend tender specification to meet the standard constraint'
  };
  const opts = AppState.risks.map(r => map[r.type]).filter(Boolean);
  return [...new Set(opts), 'Other (describe in reason)'];
}

function openDecisionModal(type) {
  if (AppState.analysisStatus !== 'done') return;
  if (type === 'ACCEPTED' && Selectors.pendingAcks().length) {
    Renderer.toast('Review flagged risks first', `Acknowledge ${Selectors.pendingAcks().length} flagged risk(s) in Step 6 before accepting.`, 'warning');
    $('#step-6').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#ackList').classList.add('pulse'); setTimeout(() => $('#ackList').classList.remove('pulse'), 1000);
    return;
  }
  decisionType = type;
  const std = Data.standard(Selectors.primaryRec().standardId);
  const label = { ACCEPTED: 'Accept recommendation', MODIFIED: 'Modify tender / recommendation', REJECTED: 'Reject recommendation' }[type];
  $('#decisionModalTitle').textContent = label;
  $('#dmStd').textContent = std.isNumber;
  $('#dmTender').textContent = `${AppState.tenderData.tenderNumber} · ${AppState.tenderData.title}`;
  $('#dmModifyWrap').classList.toggle('d-none', type !== 'MODIFIED');
  $('#dmModType').innerHTML = modificationOptions().map(o => `<option>${esc(o)}</option>`).join('');
  const needReason = type !== 'ACCEPTED';
  $('#dmReasonReq').classList.toggle('d-none', !needReason);
  $('#dmReason').value = '';
  $('#dmReason').placeholder = needReason ? 'Record your reasoning for the audit trail' : 'Optional note for the audit trail';
  $('#dmConfirm').checked = false;
  $$('#decisionForm .is-invalid').forEach(n => n.classList.remove('is-invalid'));
  const btn = $('#dmSubmit');
  btn.className = 'btn ' + ({ ACCEPTED: 'btn-accept', MODIFIED: 'btn-modify', REJECTED: 'btn-reject' }[type]);
  btn.textContent = { ACCEPTED: 'Record acceptance', MODIFIED: 'Record modification', REJECTED: 'Record rejection' }[type];
  bootstrap.Modal.getOrCreateInstance('#decisionModal').show();
}

function submitDecision(e) {
  e.preventDefault();
  const reason = $('#dmReason').value.trim();
  const needReason = decisionType !== 'ACCEPTED';
  let ok = true;
  if (needReason && reason.length < 5) { $('#dmReason').classList.add('is-invalid'); ok = false; } else $('#dmReason').classList.remove('is-invalid');
  if (!$('#dmConfirm').checked) { $('#dmConfirm').classList.add('is-invalid'); ok = false; } else $('#dmConfirm').classList.remove('is-invalid');
  if (!ok) return;
  const mod = decisionType === 'MODIFIED' ? $('#dmModType').value : null;
  const { decision, audit } = recordDecision(decisionType, reason, mod);
  bootstrap.Modal.getInstance('#decisionModal').hide();
  Renderer.renderDecisionBar(true);
  Renderer.renderSummary();
  Renderer.updateStepNav();
  const pill = $('#dbStatus .status-pill'); pill.classList.add('pulse');
  const kind = { ACCEPTED: 'success', MODIFIED: 'warning', REJECTED: 'danger' }[decisionType];
  Renderer.toast(`Decision recorded: ${decisionType}`, `${Data.standard(decision.standardId).isNumber} — logged by Procurement Officer.`, kind, `${audit.id} · ${decision.decisionId} · ${fmtTime(audit.timestamp)}`);
}

/* ---------- Wiring ---------- */
function init() {
  resetSimulator();
  Renderer.renderStepNav();
  Renderer.onScenarioLoaded();
  Renderer.setActiveStep(1);
  Renderer.initTooltips();

  $('#scenarioPicker').addEventListener('click', e => {
    const card = e.target.closest('[data-scenario]');
    if (!card || AppState.analysisStatus === 'running') return;
    loadScenario(card.dataset.scenario);
  });
  $('#analyzeBtn').addEventListener('click', runAnalysis);
  $('#btnAccept').addEventListener('click', () => openDecisionModal('ACCEPTED'));
  $('#btnModify').addEventListener('click', () => openDecisionModal('MODIFIED'));
  $('#btnReject').addEventListener('click', () => openDecisionModal('REJECTED'));
  $('#decisionForm').addEventListener('submit', submitDecision);
  $('#decisionModal').addEventListener('shown.bs.modal', () => ($('#dmReason').offsetParent ? $('#dmReason') : $('#dmConfirm')).focus());

  $('#ackList').addEventListener('change', e => {
    const cb = e.target.closest('[data-risk]');
    if (!cb) return;
    const risk = Data.risk(cb.dataset.risk);
    AppState.acknowledged[risk.riskId] = cb.checked;
    cb.closest('.form-check').classList.toggle('checked', cb.checked);
    const rs = AppState.risks.filter(r => r.requiresOfficerReview);
    $('#ackProgress').textContent = `${rs.filter(r => AppState.acknowledged[r.riskId]).length}/${rs.length} reviewed`;
    logAudit('PROCUREMENT_OFFICER', cb.checked ? 'RISK_ACKNOWLEDGED' : 'RISK_ACK_REVOKED', `${risk.riskId} — ${risk.title}`);
    Renderer.renderDecisionBar(true);
    Renderer.renderSummary();
  });

  $('#resetBtn').addEventListener('click', () => {
    resetSimulator();
    Renderer.onScenarioLoaded();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Renderer.toast('Simulator reset', 'All analysis results and session audit events were cleared.', 'primary');
  });
  $('#brandLink').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  ['wheel', 'touchmove', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (AppState.analysisStatus === 'running') userScrolled = true; }, { passive: true }));

  // scroll-spy
  const io = new IntersectionObserver(entries => {
    entries.filter(en => en.isIntersecting).forEach(en => Renderer.setActiveStep(+en.target.id.replace('step-', '')));
  }, { rootMargin: '-30% 0px -60% 0px' });
  $$('.stage').forEach(s => io.observe(s));
}

document.addEventListener('DOMContentLoaded', init);
window.PM = { AppState, CONFIG, runAnalysis, loadScenario };

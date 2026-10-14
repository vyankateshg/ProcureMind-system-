/* ProcureMind — AppState, dataset queries and domain logic (no DOM here). */
'use strict';

const DB = window.MOCK_DATASET;

const CONFIG = {
  stepDelay: 650,          // ms per simulated analysis step
  uploadMs: 1100,          // ms for the "upload" progress bar
  dataAsOf: (DB.evidence.map(e => e.checkedAt).sort().pop()) || '2026-10-05'
};

const STEPS = [
  { id: 1, key: 'tender',       title: 'Tender Input',          sub: 'Upload & metadata' },
  { id: 2, key: 'requirements', title: 'Requirements',          sub: 'Extracted from tender' },
  { id: 3, key: 'recommend',    title: 'IS Recommendation',     sub: 'Semantic matching' },
  { id: 4, key: 'graph',        title: 'Normative Graph',       sub: 'Allied standards' },
  { id: 5, key: 'verify',       title: 'BIS Verification',      sub: 'Status & certification' },
  { id: 6, key: 'risk',         title: 'Risks & Evidence',      sub: 'Flags for review' },
  { id: 7, key: 'decision',     title: 'Officer Decision',      sub: 'Accept / Modify / Reject' }
];

const AppState = {
  currentScenarioId: null,
  tenderData: null,
  requirements: [],
  recommendations: [],
  risks: [],
  decisions: [],
  // extended (derived from the same dataset)
  standards: [],
  edges: [],
  certifications: [],
  translation: null,
  auditLog: [],
  acknowledged: {},        // riskId -> true
  analysisStatus: 'idle',  // idle | running | done
  revealedStage: 0         // highest step revealed so far
};

/* ---------- Generic helpers ---------- */
const byId = (arr, key, id) => arr.find(x => x[key] === id) || null;
const uniq = a => [...new Set(a)];

const Data = {
  scenarios: () => DB.scenarios,
  scenario: id => byId(DB.scenarios, 'scenarioId', id),
  tender: id => byId(DB['tender-profiles'], 'scenarioId', id),
  standard: id => byId(DB.standards, 'id', id),
  evidence: id => byId(DB.evidence, 'evidenceId', id),
  requirement: id => byId(DB.requirements, 'requirementId', id),
  risk: id => byId(DB['risk-flags'], 'riskId', id),
  cert: id => byId(DB.certifications, 'certificationId', id)
};

/* ---------- Scenario controller ---------- */
/**
 * Filters the mock dataset for a scenario, updates AppState and rebuilds the UI
 * (Renderer.onScenarioLoaded is defined in dom-renderer.js).
 */
function loadScenario(scenarioId) {
  const scenario = Data.scenario(scenarioId);
  const tender = Data.tender(scenarioId);
  if (!scenario || !tender) { console.error('Unknown scenario', scenarioId); return; }

  const recs = DB.recommendations.filter(r => r.scenarioId === scenarioId);
  const risks = DB['risk-flags'].filter(r => r.scenarioId === scenarioId);
  const stdIds = uniq(recs.map(r => r.standardId)
    .concat(DB['standard-edges'].filter(e => recs.some(r => r.standardId === e.from)).map(e => e.to)));

  AppState.currentScenarioId = scenarioId;
  AppState.tenderData = { ...tender, scenario };
  AppState.requirements = DB.requirements.filter(r => tender.requirements.includes(r.requirementId));
  AppState.recommendations = recs;
  AppState.risks = risks;
  AppState.decisions = DB.decisions.filter(d => d.scenarioId === scenarioId).map(d => ({ ...d, fixture: true }));
  AppState.standards = stdIds.map(Data.standard).filter(Boolean);
  AppState.edges = DB['standard-edges'].filter(e => recs.some(r => r.standardId === e.from));
  AppState.certifications = (tender.certificationRequirements || []).map(Data.cert).filter(Boolean);
  AppState.translation = tender.language !== 'en'
    ? (DB.translations.find(t => t.language === tender.language) || null) : null;
  AppState.auditLog = [];
  AppState.acknowledged = {};
  AppState.analysisStatus = 'idle';
  AppState.revealedStage = 0;

  Renderer.onScenarioLoaded();
}

function resetSimulator() {
  Object.assign(AppState, {
    currentScenarioId: null, tenderData: null, requirements: [], recommendations: [], risks: [],
    decisions: [], standards: [], edges: [], certifications: [], translation: null,
    auditLog: [], acknowledged: {}, analysisStatus: 'idle', revealedStage: 0
  });
}

/* ---------- Derived selectors ---------- */
const Selectors = {
  primaryRec: () => AppState.recommendations.find(r => r.role === 'PRIMARY') || AppState.recommendations[0] || null,

  /** Deterministic score derived from the recommendation's confidence band and signal strengths. */
  confidenceScore(rec) {
    const base = { High: 88, Medium: 72, Low: 55 }[rec.confidenceBand] ?? 60;
    const bonus = Object.values(rec.signals || {}).reduce((s, v) => s + (v === 'High' ? 2 : v === 'Medium' ? 1 : 0), 0);
    return Math.min(97, base + bonus);
  },

  risksForRec: rec => (rec.riskFlagIds || []).map(Data.risk).filter(Boolean),

  evidenceForRec(rec) {
    const ids = uniq([...(rec.evidenceIds || []), ...rec.requirementMatches.flatMap(m => m.evidenceIds || [])]);
    const list = ids.map(Data.evidence).filter(Boolean);
    if (list.length) return list;
    // No evidence record linked in the dataset: derive citations from the tender text itself.
    return rec.requirementMatches.map(m => Selectors.derivedEvidenceForRequirement(Data.requirement(m.requirementId))).filter(Boolean);
  },

  /** Evidence for a requirement: dataset records first, otherwise a derived citation from the tender source text. */
  evidenceForRequirement(req) {
    const list = (req.evidenceIds || []).map(Data.evidence).filter(Boolean);
    return list.length ? list : [Selectors.derivedEvidenceForRequirement(req)];
  },

  derivedEvidenceForRequirement(req) {
    if (!req) return null;
    return {
      evidenceId: 'DERIVED-' + req.requirementId,
      claim: `Requirement "${req.field}" extracted from tender text.`,
      sourceName: 'Tender Document',
      sourceType: 'Extraction (derived)',
      checkedAt: CONFIG.dataAsOf,
      status: 'Derived from extraction',
      simulated: true,
      snippet: req.sourceText,
      location: `${AppState.tenderData ? AppState.tenderData.sourceFile + ' · ' : ''}${req.sourceSpan}`,
      derived: true
    };
  },

  /** Evidence list for a risk flag: linked records plus tender/standard citations that triggered it. */
  evidenceForRisk(risk) {
    let list = (risk.evidenceIds || []).map(Data.evidence).filter(Boolean);
    risk.triggerRequirementIds.forEach(id => {
      const req = Data.requirement(id);
      if (req && !list.some(e => e.snippet && e.snippet.includes(req.sourceText.slice(0, 12)))) {
        list = list.concat(Selectors.derivedEvidenceForRequirement(req));
      }
    });
    if (risk.type === 'TENDER_STANDARD_MISMATCH') {
      risk.standardIds.map(Data.standard).filter(Boolean).forEach(std => {
        (std.specConstraints || []).forEach(c => list.push({
          evidenceId: `DERIVED-${std.id}-${c.field.replace(/\s+/g, '-').toUpperCase()}`,
          claim: `Standard constraint on ${c.field}.`,
          sourceName: 'BIS', sourceType: 'Simulated source', checkedAt: std.checkedAt,
          status: 'Simulated constraint', simulated: true, derived: true,
          snippet: `[SIMULATED] ${std.isNumber}: ${c.field} ≥ ${c.min}`,
          location: std.isNumber
        }));
      });
    }
    return list;
  },

  /** Revision cited by the tender (from the trigger requirement of an OUTDATED_STANDARD risk). */
  citedRevision(std) {
    const risk = AppState.risks.find(r => r.type === 'OUTDATED_STANDARD' && r.standardIds.includes(std.id));
    if (!risk) return null;
    const req = Data.requirement(risk.triggerRequirementIds[0]);
    const m = req && req.value.match(/(19|20)\d{2}/);
    return m ? m[0] : null;
  },

  lifecycle(std) {
    if (std.supersededBy || /SUPERSEDED/i.test(std.status)) return { label: 'SUPERSEDED', cls: 'orange', icon: 'bi-archive' };
    return { label: 'ACTIVE', cls: 'green', icon: 'bi-check-circle-fill' };
  },

  reqLabel(reqId) {
    const r = Data.requirement(reqId);
    return r ? `${r.field}: ${Selectors.opSymbol(r.operator)} ${r.value}${r.unit ? ' ' + r.unit : ''}` : reqId;
  },

  opSymbol: op => ({ EQ: '=', APPROX: '≈', GTE: '≥', LTE: '≤', GT: '>', LT: '<' }[op] || ''),

  /** Allied graph: roots are PRIMARY standards; targets are grouped by category. */
  graph() {
    const roots = AppState.recommendations.filter(r => r.role === 'PRIMARY').map(r => Data.standard(r.standardId));
    const edges = AppState.edges.filter(e => roots.some(r => r && r.id === e.from));
    const categoryOf = std => ({ TEST: 'Test Method', SAFETY: 'Safety', INSTALLATION: 'Installation', TERMINOLOGY: 'Terminology' }[std.type] || 'Terminology');
    const allied = edges.map(e => {
      const std = Data.standard(e.to);
      return { edge: e, std, category: categoryOf(std), recommended: AppState.recommendations.some(r => r.standardId === std.id) };
    });
    return { root: roots[0] || null, allied, categories: ['Test Method', 'Safety', 'Installation', 'Terminology'] };
  },

  decisionState() {
    const primary = Selectors.primaryRec();
    const list = AppState.decisions.filter(d => primary && d.standardId === primary.standardId);
    return list.length ? list[list.length - 1] : { status: 'PENDING', reason: '', fixture: true };
  },

  pendingAcks: () => AppState.risks.filter(r => r.requiresOfficerReview && !AppState.acknowledged[r.riskId])
};

/* ---------- Audit + decisions ---------- */
function logAudit(actor, event, detail) {
  const t = AppState.tenderData;
  const entry = {
    id: 'AUD-' + (AppState.auditLog.length + 1),
    timestamp: new Date().toISOString(),
    actor, event, target: t ? t.tenderNumber : '—', detail
  };
  AppState.auditLog.push(entry);
  Renderer.renderAudit();
  return entry;
}

function recordDecision(status, reason, modification) {
  const primary = Selectors.primaryRec();
  const letter = AppState.currentScenarioId.slice(-1);
  const n = AppState.decisions.filter(d => !d.fixture).length + 1;
  const rec = {
    decisionId: `DEC-${letter}-S${n}`,
    scenarioId: AppState.currentScenarioId,
    standardId: primary.standardId,
    status, reason: reason || '', modification: modification || null,
    actor: 'PROCUREMENT_OFFICER',
    timestamp: new Date().toISOString()
  };
  AppState.decisions.push(rec);
  const std = Data.standard(primary.standardId);
  const audit = logAudit('PROCUREMENT_OFFICER', `DECISION_${status}`,
    `${status} ${std.isNumber}` + (modification ? ` — ${modification}` : '') + (reason ? ` — “${reason}”` : ''));
  return { decision: rec, audit };
}

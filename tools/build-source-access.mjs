import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// This curated guide covers only the six already reviewed foundational reading editions.
// A changed source hash requires a new content review, not automatic substitution.
const readingOrder = ['kernel', 'ametric', 'structure', 'exhaustion', 'ats'];
const reviewedHashes = {
  kernel: '4e1bafc4844d90ca7ba5268d1b6b5ee21bf92f082a2a61b4eea039faed0c037e',
  structure: '065979305b2fc1593abb343e72a86d0ed9c967c089d1a9cbf91be650de25eff2',
  ametric: 'fd0da8feb70e61de9474cc459ca8de6af2619206d439e62425e88334161a535e',
  metricity: '6d73b71c267ea80973994c18c669b338338280887b5a358396e8e05cb7a2801e',
  ats: '1624eacd530dcdaaedec184414c8a7eab8d5096805aee9ffa5452b6f51638c7b',
  exhaustion: 'd06d39b381edddaafe899f20769b0ba551802b23d7b83121530ecab346feece0'
};
const reviewedSummaryHashes = {
  "kernel": "8e0725871cc217544a68b1e78d0f55494de8a43aa75dfa660f60700b5b49f034",
  "structure": "1ef3b1fd41add2f5f248bc2eefa151e21e7e17097d93b1f43baf5e3ed728a09a",
  "ametric": "3efb74bf453ec8a0b1fe0e8b18ef3777036aa21b2634f0ba9d8e0b650f2cb858",
  "metricity": "228fc7266653873a1c2030c3df0656e4cf1a3198ffa42fdb647b44564d9cbc51",
  "ats": "d1fc001e94ae4c95e0934c71b033db616e856dd8550f709a203f33754a09aa9e",
  "exhaustion": "2a4eff9ddfb9d3d14072e9ded1f1ad90b1bb2bc9a1f0d1c9502d2ba0d2d1fb80"
};
const origin = 'https://constraintsystemsinstitute.org';
const link = (label, url) => `[${label}](${url})`;
const glossary = [
  ['Admissibility', 'Bivalent qualification of the fixed original question. An admissibility bit is an exact description only if every required original observation is constant on its fibres.', 'structure', 'Theorems 5.5-5.6', 16, 17],
  ['Standing', 'Warrant to bear the relevant role or target interpretation. A formal or calculational interpretation does not by itself supply physical standing.', 'metricity', 'Definitions 2.7-2.11', 8, 9],
  ['Reference', 'Preservation of the already identified subject and original incidence through representation and reuse; a different occurrence is not automatically evidence for the original claim.', 'kernel', 'Proposition 2.4; Theorem 2.8 / Corollary 2.9', 14, 21],
  ['Irreversibility', 'Retention of original qualification and constraint history. Retaining a failure history is distinct from forcing every later endpoint to remain negative; the latter needs an additional edge condition.', 'structure', 'Theorems 6.3-6.6', 20, 21],
  ['Complete profile', 'The context and all required semantic coordinates on the declared original domain. It is richer than a qualification bit and need not identify a unique occupant.', 'exhaustion', 'Section 3 / Theorem 3.3; Theorem 8.1 / Corollary 8.2', 9, 27],
  ['Admissible interior', 'The greatest safe continuation region for fixed, independently supplied qualification and edge data. It may be empty; uniqueness of the greatest region does not mean uniqueness of every safe subset or of a physical occupant.', 'structure', 'Theorems 6.3-6.6', 20, 21],
  ['AMetric boundary', 'At the fixed authoritative equality-only atom interface, invariant readouts cannot supply additional original-incidence warrant without warranted richer input. Equality-based formal structures and independently warranted enrichment remain possible.', 'ametric', 'Proposition 3.8; Theorem 7.5 / Section 7.6', 21, 40],
  ['L-metric', 'The locally minimal projection interface for warranted physical metric description on the declared background. Its order is a dependency order, not a temporal sequence; licensing generates neither metric structure nor standing nor ontology.', 'metricity', 'Definition 2.12; Definition 5.2; Theorem 6.2 / Corollary 6.3', 9, 17],
  ['Anchor / Tensor / Skin (ATS)', 'Context / complete semantic content / identity-preserving realization in the fixed-domain decomposition. Tensor here is a semantic role and should not be assumed to mean a physical tensor field.', 'ats', 'Section 2.4; Theorems 3.1-3.3; Section 3.4', 6, 8],
  ['Certificate assembly', 'Combining the stated primitive warrants, original-question coverage and compatible retained input/output conditions. Joint original-domain factorization is required for sequential substitution; a licence does not supply an executed occurrence.', 'ats', 'Theorem 7.3; Theorem 7.5', 22, 24]
];

export function buildSourceAccess(root) {
  const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, ''));
  const records = readJson('papers.json');
  const registry = readJson('manuscripts/registry.json');
  const editions = new Map(registry.editions.map(e => [e.id, e]));
  const catalogue = new Map();
  const summaries = new Map();
  const localPath = url => {
    const parsed = new URL(url);
    if (parsed.origin !== origin) throw new Error(`Unexpected source origin: ${url}`);
    const full = path.resolve(root, '.' + decodeURIComponent(parsed.pathname));
    if (!full.startsWith(root + path.sep)) throw new Error(`Invalid source path: ${url}`);
    return full;
  };
  const keys = records.map(p => p.work_id || p.doi);
  if (keys.some(k => !k) || new Set(keys).size !== records.length) throw new Error('Catalogue work identities must be unique');
  for (const [id, sha256] of Object.entries(reviewedHashes)) {
    const e = editions.get(id);
    if (!e || e.sha256 !== sha256) throw new Error(`Source-access content needs edition review: ${id}`);
    const matches = records.filter(p => (p.work_id || p.doi) === e.doi.work_all_versions);
    if (matches.length !== 1 || matches[0].preferred_edition?.sha256 !== sha256 || matches[0].preferred_edition?.doi !== e.doi.exact_release) throw new Error(`Preferred reading edition needs review: ${id}`);
    if (crypto.createHash('sha256').update(fs.readFileSync(localPath(e.pdf_url))).digest('hex') !== sha256) throw new Error(`PDF bytes do not match source registry: ${id}`);
    const summary = fs.readFileSync(localPath(e.reading_aid_url), 'utf8').replace(/\r\n?/g, '\n').trim();
    if (!summary.includes('Attributed reading aid, not a complete manuscript conversion or independent proof verification.') || !summary.includes(sha256)) throw new Error(`Reading-aid identity/qualification missing: ${id}`);
    if (crypto.createHash('sha256').update(summary).digest('hex') !== reviewedSummaryHashes[id]) throw new Error(`Reading-aid content needs review: ${id}`);
    catalogue.set(id, matches[0]); summaries.set(id, summary);
  }
  const e = id => editions.get(id);
  for (const rel of registry.consumer_grounded_reference_relationships) {
    if (rel.consumer_edition_sha256 !== e(rel.consumer_edition_id)?.sha256) throw new Error('Consumer edition identity mismatch');
  }
  const cite = (id, label, page, end = page) => link(`${id}: ${label}, PDF ${end === page ? 'p.' : 'pp.'} ${page}${end === page ? '' : '-' + end}; exact DOI ${e(id).doi.exact_release}`, e(id).pdf_url + '#page=' + page);
  const evidence = ev => {
    const edition = e(ev.edition_id);
    if (!edition || ev.sha256 !== edition.sha256 || ev.pdf_page < 1 || ev.pdf_page_end > edition.pages || ev.url !== edition.pdf_url + '#page=' + ev.pdf_page) throw new Error('Consumer evidence identity/page mismatch');
    return cite(ev.edition_id, ev.section, ev.pdf_page, ev.pdf_page_end);
  };
  const aidList = [...readingOrder, 'metricity'].map(id => `- ${link(e(id).title, e(id).reading_aid_url)}: Attributed summary of the ${e(id).edition_label.toLowerCase()}, cover ${e(id).manuscript_cover_date}; exact release ${e(id).doi.exact_release}. Not the full manuscript.`).join('\n');
  const concise = `# Constraint Systems Institute

> Source access for Amos Jay Maley's research manuscripts: exact PDF editions, a bounded foundational reading guide, and catalogue metadata.

The catalogue currently contains ${records.length} canonical work records; records are not PDF editions. Individual versioned PDFs are authoritative manuscript text. Markdown summaries and guides are attributed reading aids, not full manuscript conversions or independent proof verification.

The foundational direction argued in the manuscripts is non-degenerate determinate construction -> necessary Kernel -> Admissibility, Standing, Reference and Irreversibility (${cite('kernel', 'Proposition 2.4; Theorem 3.1 / Theorem 3.6', 14, 27)}). These roles concern qualification, role warrant, identity/original incidence and retained constraint history. Do not turn this into a blanket global uniqueness claim over other research.

Suggested reading path: Kernel -> AMetric boundary -> Structure of Admissibility -> fixed-domain exhaustion -> Anchor, Tensor, Skin. Metricity is a conditional physical licensing branch. This is editorial reading order, not an exact-edition import graph. Older named references and unresolved frozen imports remain separately recorded.

Logical dependency, local reconstruction, projection and certificate assembly have different evidential meanings. Formal/model/calculational metric interpretation may precede physical standing (${cite('metricity', 'Definitions 2.7-2.11', 8, 9)}). Licensing does not generate metric structure, standing or ontology (${cite('metricity', 'Corollary 6.3', 16, 17)}). The AMetric result permits independently warranted richer inputs (${cite('ametric', 'Theorem 7.5 / Section 7.6', 39, 40)}).

## Start here

- ${link('Expanded formalism, glossary and dependency guide', origin + '/llms-full.txt')}: Six foundational reading editions with exact edition evidence and unresolved-import limits; not the full corpus.
- ${link('Formalism guide in Markdown', origin + '/manuscripts/guide/index.md')}: The same expanded reading aid in a conventional Markdown file.
- ${link('Human-readable foundational guide', origin + '/manuscripts/guide/')}: Existing guide with source-page links.
- ${link('Foundational edition and consumer-reference registry', origin + '/manuscripts/registry.json')}: SHA256 identities, concept versus exact release DOIs and named older imports.

## Foundational reading aids

${aidList}

## Catalogue and citation

- ${link('Current canonical catalogue', origin + '/papers.json')}: Work-level metadata and preferred reading editions; coverage does not imply every paper has been read or verified.
- ${link('Browse and search the repository', origin + '/papers/')}: Canonical work pages with read/download/citation links.
- ${link('Citation and reuse guidance', origin + '/using-the-research/')}: Cite the exact release consulted, not an all-versions DOI as an exact theorem import.
`;
  const full = [`# Constraint Systems Institute: foundational source-access guide`,
    `> Attributed formalism, glossary and dependency reading aid. The exact PDFs are authoritative. This is neither a full manuscript conversion nor an independent proof audit.`,
    `## Coverage and source hierarchy\n\nThe current canonical catalogue has ${records.length} work records, derived from ${link('papers.json', origin + '/papers.json')}. This guide covers only the ${Object.keys(reviewedHashes).length} verified foundational reading editions in ${link('the public source registry', origin + '/manuscripts/registry.json')}. It does not ingest or summarize all catalogue manuscripts. Existing source holds and author exclusions remain outside this expansion.\n\nFor theorem statements, equations, hypotheses, proofs and bibliography, read the exact versioned PDF. Use an exact release DOI plus its SHA256 identity when identifying text. An all-versions work DOI is for discovery. A preferred reading edition is not automatically the frozen edition imported by a consumer. Cover dates and publisher release dates are separately recorded below.`,
    `## Foundational direction and reading order\n\nThe Kernel manuscript argues from actual non-degenerate determinate construction and original incidence to necessary Admissibility, Standing, Reference and Irreversibility roles. These are incurred objecthood commitments, not an optional explanatory overlay. Evidence: ${cite('kernel', 'Proposition 2.4', 14, 17)}; ${cite('kernel', 'Theorem 2.8 / Corollary 2.9', 20, 21)}; ${cite('kernel', 'Theorem 3.1 / Theorem 3.6', 24, 27)}. These are attributed manuscript claims.\n\nEditorial reading path: ${readingOrder.map(id => link(e(id).title, e(id).reading_aid_url)).join(' -> ')}. ${link(e('metricity').title, e('metricity').reading_aid_url)} is the physical metric-licensing branch. The consumer's stated one-way support order is recorded in ${cite('ats', 'Section 1.4', 3)}; this guide's use of preferred reading editions does not resolve the older reference identities named there.`,
    `## How to distinguish relationships\n\n- **Logical dependency:** a consumer uses a warranted premise or construction under stated conditions. A bibliography entry alone establishes only named support. Local reconstruction/reproof is recorded separately.\n- **Projection:** an internal prerequisite relation on the same declared background. Metricity Definition 2.12 defines a dependency order, not temporal emergence; Definition 5.2 uses local minimality. Evidence: ${cite('metricity', 'Definition 2.12', 9)}; ${cite('metricity', 'Definition 5.2', 15)}.\n- **Certificate assembly:** warrants and preservation conditions are combined on the declared original domain; execution requires its own occurrence conditions. Evidence: ${cite('ats', 'Theorem 7.3 / Theorem 7.5', 22, 24)}.\n- **Reading order:** an editorial sequence for understanding the work. It is not a verified theorem-import edge and does not license substituting editions.`,
    `## Working glossary\n\nThese scoped paraphrases do not replace the manuscripts' definitions.\n\n${glossary.map(([term, text, id, label, page, end]) => `- **${term}:** ${text} Evidence: ${cite(id, label, page, end)}.`).join('\n\n')}\n\n- **Work DOI / exact release DOI:** all-versions discovery identity / one particular publisher release. Use the registry fields separately; neither chronology nor a matching title alone confirms the bytes imported by a consumer.`,
    `## AMetric and physical metric licensing limits\n\nThe equality-only authority condition is specific to the fixed original boundary problem. It does not erase formal symbols, equality patterns, tuple relations or all calculational distinctions. AMetric Proposition 3.8 allows invariant formal structures, including equality-based discrete metrics. Theorem 7.5 accommodates independently warranted richer input. Evidence: ${cite('ametric', 'Section 3.1 / Proposition 3.3 / Definition 3.4', 17, 19)}; ${cite('ametric', 'Proposition 3.8', 21, 22)}; ${cite('ametric', 'Theorem 7.5 / Section 7.6', 39, 40)}.\n\nMetricity's weak formal/model/calculational interpretation can precede strong physical interpretation and standing. Its conditional licensing theorem does not construct metric structure, standing or ontology. Evidence: ${cite('metricity', 'Definitions 2.7-2.11', 8, 9)}; ${cite('metricity', 'Theorem 6.2 / Corollary 6.3', 16, 17)}. No globally unique metric interface is asserted across all backgrounds; see ${cite('metricity', 'Definition 2.12', 9)}.`,
    `## Six exact reading editions\n\nThe following summaries reuse the already published attributed reading aids. Their evidence links refer to these exact reading PDFs, not to an unconfirmed older producer edition named by another paper.`];
  for (const id of [...readingOrder, 'metricity']) {
    const edition = e(id), summary = summaries.get(id);
    full.push(`### ${edition.title}\n\n${link('Canonical work page', catalogue.get(id).url)} | ${link('Edition page', edition.edition_url)} | ${link('Authoritative PDF', edition.pdf_url)} | ${link('Exact release DOI', 'https://doi.org/' + edition.doi.exact_release)} | ${link('All-versions work DOI', 'https://doi.org/' + edition.doi.work_all_versions)}\n\nEdition: ${edition.edition_label}; manuscript cover ${edition.manuscript_cover_date}; publisher release ${edition.publisher_publication_date}; ${edition.pages} PDF pages; ${edition.bytes} bytes. SHA256: \`${edition.sha256}\`.\n\nCitation: ${edition.citation}\n\n${summary.slice(summary.indexOf('## Imports')).replace(/^## /gm, '#### ')}`);
  }
  full.push(`## Consumer-grounded support and frozen imports\n\nEvery relationship below is grounded in an exact **consumer** edition. The consumer names an older source reference; the exact imported **producer** bytes remain unconfirmed. The currently hosted preferred reading PDF is not substituted for that named source. Candidate producer pages are not proof of exact-edition import.\n\n${registry.consumer_grounded_reference_relationships.map(rel => `### ${rel.source_work} -> ${e(rel.consumer_edition_id).title}\n\nNamed source: ${rel.source_reference_label}${rel.source_reference_date ? '; ' + rel.source_reference_date : ''}. Relationship: ${rel.relationship_type.replaceAll('_', ' ')}. ${rel.description}\n\nProducer identity: exact imported bytes unconfirmed. Consumer: exact DOI ${e(rel.consumer_edition_id).doi.exact_release}, SHA256 \`${rel.consumer_edition_sha256}\`.\n\nEvidence: ${rel.consumer_evidence.map(evidence).join('; ')}.`).join('\n\n')}`);
  full.push(`## Unresolved Metricity companion editions\n\n${registry.unresolved_imports.map(rel => `- **${e(rel.consumer).title} -> ${e(rel.named_work).title}:** ${rel.reason} Evidence: ${evidence(rel.evidence)}.`).join('\n\n')}\n\nThese are unresolved exact-edition identities, not claims that no companion work exists. A May consumer must not be silently rebound to September reading editions.`);
  full.push(`## Uniqueness, absence and implementation scope\n\nKeep complete-profile equivalence, greatest safe interior, constant candidate readout, single occupant and minimal-realization uniqueness separate. Each has different fixed data and hypotheses. A complete profile can leave multiple occupants; a constant consequence need not identify a single quotient input. Evidence: ${cite('structure', 'Theorems 5.5-5.6 / Theorems 6.3-6.6', 16, 21)}; ${cite('exhaustion', 'Theorem 8.1 / Corollary 8.2 / Proposition 8.4', 26, 27)}; ${cite('ats', 'Theorem 3.3', 7, 8)}.\n\nMinimal realization uniqueness does not imply uniqueness among every adequate realization. A semantic exhaustion result is not by itself a finite implementation or timeout certificate. Original obligation coverage, compositional closure and candidate identification are separate. Evidence: ${cite('exhaustion', 'Theorem 4.3 / Theorem 4.8', 13, 16)}; ${cite('exhaustion', 'Theorem 5.9', 21, 22)}; ${cite('kernel', 'Theorem 7.1 / Section 7.1', 41, 43)}. None of these source-relative claims establishes global uniqueness over other research programs.`);
  full.push(`## Access and fidelity\n\nFor a question: choose the canonical work page; locate the exact reading PDF and release DOI; inspect the cited definition/theorem with its hypotheses; distinguish any consumer's named imported edition; report unresolved identity instead of inventing a source lock. Catalogue metadata is discovery information, not evidence that every paper has been substantively reviewed.\n\nThe six Markdown files linked in ${link('llms.txt', origin + '/llms.txt')} are summaries. Full searchable HTML/Markdown manuscript fidelity remains unverified and deferred: equations, proof text, numbering, references and section anchors have not been certified as complete conversions. Do not quote a summary as if it were manuscript proof text. Use the PDFs for those tasks. SHA256 checks and link/page checks are mechanical checks, not independent verification of mathematical claims.\n\n${link('Browse catalogue', origin + '/papers/')} | ${link('Citation and reuse', origin + '/using-the-research/')} | ${link('Human-readable guide', origin + '/manuscripts/guide/')}`);
  const outputs = {'llms.txt': concise.trim() + '\n', 'llms-full.txt': full.join('\n\n') + '\n', 'manuscripts/guide/index.md': full.join('\n\n') + '\n'};
  let changed = 0;
  for (const [rel, text] of Object.entries(outputs)) {
    const target = path.join(root, rel);
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text) { fs.writeFileSync(target, text); changed++; }
  }
  return {changed, catalogueRecords: records.length, reviewedEditions: Object.keys(reviewedHashes).length};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  console.log(JSON.stringify(buildSourceAccess(root)));
}

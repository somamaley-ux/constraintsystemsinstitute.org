# Lean catalogue maintenance

Edit `data/lean-projects.json`, then run:

```
node tools/build-lean-catalogue.mjs
node tools/prepare-site.mjs --pages index.html lean/index.html
node tools/check-lean-catalogue.mjs
```

The homepage entry routes to the same catalogue with `framework=aasc` and `framework=beyond-aasc`; the unfiltered route is `/lean/`. Static HTML keeps every project available without JavaScript. Filter/search URL state supports reload and Back/Forward. Preserve the homepage `#lean` anchor for old links.

The classification describes framework, not authorship or affiliation. All 14 carried-over or already-featured somamaley-ux projects are AASC-related, including the Gödel encoding and the structural-unification release. The unrelated `LeanMillenniumPrizeProblems` fork is intentionally excluded. This does not remove the user's AASC mathematics endpoint audits or manuscripts.

Sources inspected 12 November 2026: each project's public README, and `foundational_closure_status.md` for Foundational Closure. The latter explicitly credits Amos Jay Maley. Other cards identify the repository owner without assuming that ownership establishes personal authorship. No Lean rebuild was performed for this catalogue update. Historical build evidence must remain distinct from current website checks.

The structural-unification release `v1.0.0` exists. Its README/EVIDENCE document cache-cold compilation, retained historical replay and the unresolved full Lake object-hash comparison. The controlled physical scope and conditional sourced Einstein result remain explicit.

External project: gpartin/LeanDiracDerivation, tag `v0.15.0-research`, commit `2c7774d41166a3b133a81a7b1ef2f816047f095e`. Tagged CITATION.cff credits G. D. Partin. Exact-target Lean proof run 43136544647 and exact-tag Independent evidence run 43139493805 both succeeded. The catalogue reports those project checks, not CSI independent rebuilding. Keep the conditional algebraic/modal lattice-model scope, spatial/time estimates, and physical-electron/general-convergence non-claims. Keep external authorship, non-affiliation and non-endorsement clear.

Repository source status is not a verdict on the complete underlying mathematical or physical domain. For the SAT audit especially, retain neutral proof-spine wording and consult its exact internal statement and external complexity correspondence rather than promoting its manuscript title into a theorem claim.

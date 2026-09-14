# Detector-selection interaction: source and teaching boundary

This interaction uses **60 invented, deterministic teaching records**, with 30 candidate labels and 30 background labels. These labels are known only because the sample was authored for the explanation. They are not observable classifications, fitted experimental outcomes, predicted yields, or predicted distributions. The equal flavor counts and candidate/background proportions have no empirical or theoretical meaning.

Each event has a prompt-object transverse-momentum coordinate from 15–55, a flavor, a leptonic or semileptonic topology, and illustrative displacement, isolation, and track-quality attributes. Any displayed units are teaching coordinates; the numerical cuts do not reproduce a current experiment's trigger menu or the neutrino arc's predicted distribution. There is no randomized sampling, runtime random generator, luminosity, exposure, rate, efficiency, or detector simulation in this model.

## The three stages

1. **Trigger:** the prompt-object coordinate must reach the chosen threshold. This is the only trigger predicate. Passing means the toy record was stored; a trigger-rejected event cannot be recovered later by changing an offline selection.
2. **Reconstruction:** the track must have sufficient quality. The displacement and crowding controls separately permit those illustrative record classes. Low track quality is a hard failure in this toy and is not repaired by any control. These are explanatory alternatives, not claims about an actual experiment's reconstruction capabilities.
3. **Analysis:** leptonic records are included; semileptonic records and flavors follow the selected categories. Stored and reconstructable candidates excluded here can become usable if their retained records are reanalysed with a broader authorized selection.

The API exposes each stage's independent predicate in `gates` and the cumulative outcomes in `passed`. Counts are cumulative. `firstRejectedAt` locates the first obstruction. `storedCandidatesExcludedOffline` explicitly separates retained candidate records excluded downstream from candidates rejected before storage. Candidate/background counts are a property of this authored sample, not an estimate of real signal efficiency or significance.

The inclusive setting intentionally still has failures and backgrounds. The default setting intentionally retains strong candidate and background examples. The interaction therefore supports neither “all HNL triggers fail” nor any numerical assertion such as “99% of the signal was discarded.” Existing analysis or reconstruction choices may already retain relevant records; an experiment-specific recast is required to decide that.

## Scientific motivation and its limits

The source motivation is the neutrino arc's distinction between an underlying source prediction and the concrete record needed to test it. [PCR7.5](https://doi.org/10.5281/zenodo.22747820), PDF pp. 31–41 and 42–50, discusses experiment-specific acceptance, complete channel coverage, response/coarsening, topology, prompt or near-prompt categories, and the limitations of reusing simplified-model searches. [PCR8](https://doi.org/10.5281/zenodo.22747926), PDF pp. 25–31 and 34, requires a qualified common record, complete response/control/sideband model, identifiability, sampling/coverage and independent held-out information.

Those papers do not establish this toy's numerical cuts, event populations, losses, or background behavior. The arc's existing **28–30 GeV / 0.2 mm** search benchmark is also not a derived numerical VJ carrier mass/lifetime; this interaction does not convert it into one. Current-facility protocol qualification remains a separate required input.

## API

`NeutrinoDetector.events` is a frozen array of 60 fixture records. `evaluate({threshold:30, acceptDisplaced:false, acceptCrowded:false, includeSemileptonic:false, flavors:['e','mu','tau']})` returns independent event gates, cumulative outcomes, reasons, storage/selection flags, counts by stage and teaching class, and separate candidate losses at trigger and offline stages. Empty flavor coverage is allowed and selects no analysis records. Thresholds must be finite and between 15 and 55. Boolean policies and flavor names are validated.

## Verification

`node tools/check-neutrino-detector.cjs` checks fixture counts, independent gates, cumulative stage order, monotonic broadening, flavor/category independence from upstream stages, unrecoverable trigger rejection, retained-record reanalysis, hard track-quality failures, malformed input, immutable fixture data and browser export. These checks validate the illustration rather than a real analysis or the scientific source claims.

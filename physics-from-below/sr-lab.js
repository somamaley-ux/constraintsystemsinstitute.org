(function () {
  'use strict';
  const model = window.PhysicsRecoverySR;
  if (!model) return;
  const fixed = (value, places = 2) => (Math.abs(value) < Math.pow(10, -places) / 2 ? 0 : value).toFixed(places);
  const signed = (value, places = 2) => fixed(value, places).replace('-', '−');
  const text = (node, selector, value) => { const target = node.querySelector(selector); if (target) target.textContent = value; };

  const signalLab = document.querySelector('[data-pr-sr-signals]');
  if (signalLab) {
    const steps = [
      { title: 'First, keep track of what happened.', body: 'A signal leaves A, reflects at B and returns to A. These are three different events in one recorded experiment. Moving a label or changing a description must not silently substitute another event.', output: 'E1 → E2 → E3. Same endpoints. Same recorded signal journey.', caption: 'Schematic only: spacing and height on this page are not physical distance or time measurements yet.' },
      { title: 'Attach the readings to those events.', body: 'Now a calibrated clock at A reads 0 microseconds when the signal leaves and 2 microseconds when it returns. The tick marks belong to that same clock and those same recorded events.', output: 'A’s measured round-trip time: 2 microseconds.', caption: 'Clock ticks are now attached to A’s departure and return. A microsecond is one millionth of a second; B has not been assigned a time yet.' },
      { title: 'Use the round trip to compare distance.', body: 'For these stationary endpoints, a delay-free reflection and equal outgoing and returning signal speeds split the travel time in half. That calibrates the separation and assigns the reflection a midpoint time.', output: 'Distance = c × (2 µs − 0 µs) / 2 = 299.8 metres.', caption: 'The ruler is now a radar calibration of the same endpoint separation. E2 receives the midpoint time of 1 microsecond.' },
      { title: 'Build the boundary of possible reach.', body: 'One round trip gives one distance. The paper considers the full family of allowed propagation comparisons. Its completed causal order, clock and equal-treatment-of-directions conditions construct a finite round reach boundary and the spatial comparison inside it.', output: 'From a complete reach structure to a Lorentzian cone: which events can be connected, and which cannot.', caption: 'The shaded cone is a one-space-dimension slice of possible causal reach. The outgoing signal follows its right boundary; the return is another limiting-speed leg inside E1’s future reach. This step uses the full propagation family, beyond the one trip drawn here.' },
      { title: 'A new observer must keep the same experiment.', body: 'Preserving the completed cone initially leaves an overall scale freedom. Using one shared rest-clock calibration removes it. The resulting Lorentz comparison changes the coordinate readings while keeping all three event records.', output: 'At 0.60c: the moving network assigns 2.50 µs between E1 and E3. A’s clock still records 2.00 µs.', caption: 'The original rest-frame drawing stays in place. Sage lines add the moving frame’s time axis and simultaneity direction; the event list shows its assigned times.' }
    ];
    const buttons = [...signalLab.querySelectorAll('[data-pr-sr-step]')];
    const back = signalLab.querySelector('[data-pr-sr-back]'), next = signalLab.querySelector('[data-pr-sr-next]');
    const layers = { ticks: 1, ruler: 2, reach: 3, observer: 4 };
    let step = 0;
    function renderStep() {
      const state = steps[step];
      buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === step)));
      text(signalLab, '[data-pr-sr-stage-label]', `Step ${step + 1} of 5`);
      text(signalLab, '[data-pr-sr-stage-title]', state.title);
      text(signalLab, '[data-pr-sr-stage-text]', state.body);
      text(signalLab, '[data-pr-sr-stage-output]', state.output);
      text(signalLab, '[data-pr-sr-signal-caption]', state.caption);
      signalLab.querySelectorAll('[data-pr-sr-layer]').forEach(layer => { layer.hidden = step < layers[layer.dataset.prSrLayer]; layer.style.display = layer.hidden ? 'none' : ''; });
      const records = step === 0 ? ['The signal leaves.', 'The signal turns back.', 'The same clock records its return.'] : step === 1 ? ['A’s clock: 0.00 µs', 'Reflection identified; time not assigned yet.', 'A’s clock: 2.00 µs'] : step < 4 ? ['A’s clock: 0.00 µs', 'Radar midpoint time: 1.00 µs', 'A’s clock: 2.00 µs'] : model.signalRecords(.6).observed.map(event => `Moving network time: ${fixed(event.t * 1e6)} µs`);
      records.forEach((record, index) => text(signalLab, `[data-pr-sr-record="${index}"]`, record));
      back.disabled = step === 0;
      next.textContent = step === 4 ? 'Start again ↺' : ['Read the clock →', 'Compare distance →', 'Map possible reach →', 'Change observer →'][step];
      text(signalLab, '[data-pr-sr-counter]', `Step ${step + 1} of 5`);
    }
    buttons.forEach((button, index) => button.addEventListener('click', () => { step = index; renderStep(); }));
    back.addEventListener('click', () => { step = Math.max(0, step - 1); renderStep(); });
    next.addEventListener('click', () => { step = (step + 1) % steps.length; renderStep(); });
    renderStep();
    signalLab.dataset.prSrReady = 'true';
  }

  const effects = document.querySelector('[data-pr-sr-effects]');
  if (effects) {
    const tabs = [...effects.querySelectorAll('[data-pr-sr-tab]')];
    const slider = effects.querySelector('#pr-sr-speed');
    const panels = [...effects.querySelectorAll('[data-pr-sr-effect]')];
    const modeButtons = [...effects.querySelectorAll('button[data-pr-sr-mode]')];
    let beta = Number(slider.value) / 100, selected = 'clock', mode = 'observer';
    const speedLabels = { clock: 'Clock speed relative to the observing network', rod: 'Rod speed relative to the measuring frame', simultaneity: 'New frame’s speed relative to the original frame', energy: 'Body speed relative to the chosen frame' };
    function render() {
      const g = model.gamma(beta), speed = fixed(beta);
      const clock = model.clock(beta), rod = model.rod(beta), simultaneous = model.simultaneity(beta), body = model.energy(beta, model.c * model.c, mode);
      text(effects, '#pr-sr-speed-output', `${speed}c · γ = ${fixed(g)}`);
      text(effects, '[data-pr-sr-speed-label]', selected === 'energy' && mode === 'push' ? 'Final body speed after the controlled push' : speedLabels[selected]);
      slider.setAttribute('aria-valuetext', `${speed} times the speed of light, Lorentz factor ${fixed(g)}`);
      text(effects, '[data-pr-sr-clock-network]', `${fixed(clock.coordinateSeconds)} s`);
      text(effects, '[data-pr-sr-clock-time]', `${fixed(clock.coordinateSeconds)} s`);
      effects.querySelector('[data-pr-sr-clock-bar]').style.width = `${100 * g / model.gamma(.9)}%`;
      effects.querySelector('[data-pr-sr-clock-visual]').setAttribute('aria-label', `The same two ticks span four seconds on the clock and ${fixed(clock.coordinateSeconds)} seconds in the observing network.`);
      text(effects, '[data-pr-sr-clock-feedback]', beta === 0 ? 'With no relative motion, the clock and the observing network agree: both record four seconds between the same ticks.' : `At ${speed}c, the network assigns ${fixed(clock.coordinateSeconds)} seconds to the interval the moving clock records as four seconds. Changing the speed changes the comparison, not the clock’s tick identities.`);
      text(effects, '[data-pr-sr-rod-length]', `${fixed(rod.measuredLength)} m`);
      const rodY = 130 + 110 * beta;
      effects.querySelector('[data-pr-sr-rod-slice]').setAttribute('d', `M190 130L450 ${rodY}`);
      effects.querySelector('[data-pr-sr-rod-event]').setAttribute('cy', rodY);
      effects.querySelector('[data-pr-sr-rod-event-label]').setAttribute('y', rodY + 7);
      text(effects, '[data-pr-sr-rod-event-label]', beta === 0 ? 'B0' : 'B(v)');
      // Near rest the two B events are too close for separate labels; the text gives the distinction.
      effects.querySelector('[data-pr-sr-rod-rest-label]').style.display = beta < .38 ? 'none' : '';
      effects.querySelector('[data-pr-sr-rod-rest-dot]').style.display = beta === 0 ? 'none' : '';
      text(effects, '[data-pr-sr-rod-feedback]', beta === 0 ? 'With no relative motion, both frames select A0 and B0. They agree on the 10-metre length.' : `At ${speed}c, the moving frame selects B’s event ${fixed(-rod.restTimeDifference * 1e9)} nanoseconds earlier in the rod’s rest frame. Its simultaneous endpoint measurement is ${fixed(rod.measuredLength)} metres.`);
      text(effects, '[data-pr-sr-sim-time]', `${signed(simultaneous.deltaSeconds * 1e6, 3)} µs`);
      const simY = 100 + 60 * beta * g;
      effects.querySelector('[data-pr-sr-sim-join]').setAttribute('d', `M165 100L465 ${simY}`);
      effects.querySelector('[data-pr-sr-sim-event]').setAttribute('cy', simY);
      effects.querySelector('[data-pr-sr-sim-label]').setAttribute('y', simY + 30);
      text(effects, '[data-pr-sr-sim-feedback]', beta === 0 ? 'The frames now coincide: C and D are simultaneous in both. These are still the same two events, 300 metres apart in the original frame.' : `This frame assigns D a time ${fixed(-simultaneous.deltaSeconds * 1e6, 3)} microseconds earlier than C. The pair remains spacelike: neither event becomes the cause of the other.`);
      text(effects, '[data-pr-sr-energy-total]', `${fixed(body.totalEnergy / 1e15, 1)} PJ`);
      text(effects, '[data-pr-sr-transfer-title]', mode === 'push' ? 'Delivered impulse from rest' : 'Momentum in this frame');
      text(effects, '[data-pr-sr-energy-transfer]', `${fixed(body.momentum / 1e6, 1)} MN·s`);
      text(effects, '[data-pr-sr-energy-operation]', mode === 'push' ? 'Physical change of motion' : 'Observer comparison');
      text(effects, '[data-pr-sr-motion-label]', `${mode === 'push' ? 'Final speed' : 'Relative speed'}: ${speed}c`);
      text(effects, '[data-pr-sr-energy-context]', mode === 'push' ? (beta === 0 ? 'The selected endpoint is rest again: this example requires no net impulse.' : 'The controller transfers momentum. The body ends in motion with its rest internal state retained.') : 'The observer changes. This comparison does not deliver a push to the body.');
      text(effects, '[data-pr-sr-energy-feedback]', mode === 'push' ? `For this rest-to-motion protocol, the delivered impulse equals the final momentum: ${fixed(body.impulse / 1e6, 1)} MN·s. In the small-speed limit, impulse divided by velocity change gives E₀/c²: one kilogram in this example.` : (beta === 0 ? 'In the body’s rest frame, momentum is zero and total energy equals rest energy. No force has been applied by choosing this description.' : 'The same body has different energy and momentum readings in a moving frame. Its rest energy and rest inertial mass remain fixed.'));
      effects.querySelector('[data-pr-sr-body]').dataset.prSrMode = mode;
      modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.prSrMode === mode)));
    }
    function selectTab(name, focus = false) {
      selected = name;
      tabs.forEach(tab => {
        const active = tab.dataset.prSrTab === name;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach(panel => { panel.hidden = panel.dataset.prSrEffect !== name; });
      render();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab.dataset.prSrTab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); selectTab(tabs[next].dataset.prSrTab, true); }
      });
    });
    modeButtons.forEach(button => button.addEventListener('click', () => { mode = button.dataset.prSrMode; render(); }));
    slider.addEventListener('input', () => { beta = Number(slider.value) / 100; render(); });
    effects.querySelector('[data-pr-sr-reset]').addEventListener('click', () => { beta = .6; slider.value = 60; render(); });
    // Announce concise changed results; the slider's own value is announced separately.
    effects.querySelectorAll('.pr-sr-feedback').forEach(node => { node.setAttribute('aria-live', 'polite'); node.setAttribute('aria-atomic', 'true'); });
    selectTab('clock');
    effects.dataset.prSrReady = 'true';
  }
})();

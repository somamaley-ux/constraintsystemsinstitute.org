(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.NeutrinoModel=model;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  // Dimensionless teaching models. No detector response or measured value is imported.
  const flavors=Object.freeze(['e','mu','tau']);
  const sourceRowBound=1/256;
  const defaultDelta=.003;
  const diagonal=values=>values.map((value,i)=>values.map((_,j)=>i===j?value:0));
  const equal=(a,b)=>Math.abs(a-b)<=32*Number.EPSILON*Math.max(Math.abs(a),Math.abs(b),Number.MIN_VALUE);

  function bounded(name,value,min,max,strictMin=false){
    if(!Number.isFinite(value)||(strictMin?value<=min:value<min)||value>max)throw new RangeError(name+' must be '+(strictMin?'greater than ':'at least ')+min+' and at most '+max+'.');
    return value;
  }
  function deltaValue(value,positive=false){return bounded('Illustrative deficit',value,0,sourceRowBound,positive);}

  // Scalar slice of M_lambda=lambda*M_0 and Y_lambda=sqrt(lambda)*Y_0.
  // The displayed endpoints only extend the algebraic illustration of the open (1,2) witness interval.
  function threshold(lambda=1){
    bounded('Threshold factor',lambda,1,2);
    const M=lambda,Y=Math.sqrt(lambda),effective=Y*Y/M;
    return {lambda,M,Y,effective,invariant:equal(effective,1),interior:lambda>1&&lambda<2};
  }

  function strength(delta=defaultDelta,observedHeavy){
    deltaValue(delta);
    const lightDeficits=flavors.map(()=>delta);
    const heavyWeights=observedHeavy===undefined?lightDeficits.slice():observedHeavy;
    if(!Array.isArray(heavyWeights)||heavyWeights.length!==3||!Array.from(heavyWeights).every(Number.isFinite))throw new RangeError('Three finite heavy flavor weights are required.');
    heavyWeights.forEach(value=>bounded('Heavy flavor weight',value,0,1));
    const weights=heavyWeights.slice(),residual=lightDeficits.map((value,i)=>value-weights[i]);
    return {
      delta,flavors:flavors.slice(),lightDeficits,heavyWeights:weights,
      lightWeights:lightDeficits.map(value=>1-value),
      Delta:diagonal(lightDeficits),Omega:diagonal(weights),residual,
      residualMatrix:diagonal(residual),residualNorm:Math.hypot(...residual),
      rank:weights.filter(value=>value>0).length,
      closed:weights.every((value,i)=>equal(value,lightDeficits[i])),
      universal:weights[0]>0&&weights.every(value=>equal(value,weights[0])),
      comparisonOnly:observedHeavy!==undefined,
      markedChild:delta>0
    };
  }

  function perturbation({delta=defaultDelta,split=0,anisotropy=0}={}){
    deltaValue(delta,true);
    bounded('Structural support splitting',split,0,1);
    bounded('Flavor anisotropy',anisotropy,0,1);
    const a=.6*anisotropy,epsilon=.18*split;
    const weights=[delta*(1+a),delta,delta*(1-a)];
    if(weights.some(value=>value===0))throw new RangeError('The illustrative positive weights must remain representable at this scale.');
    const singularValues=weights.map(Math.sqrt),s=Math.sqrt(delta);
    const etaV=Math.max(...singularValues.map(value=>Math.abs(value-s)));
    const rankMargin=s-etaV;
    const relativeSupport=[1-epsilon,1,1+epsilon];
    // U=I is a simple common chart. These explicitly built blocks obey NN^dagger+VV^dagger=I.
    const N=diagonal(weights.map(value=>Math.sqrt(1-value)));
    const V=diagonal(singularValues.map(value=>-value));
    return {
      delta,split,anisotropy,a,epsilon,flavors:flavors.slice(),
      relativeSupport,relativeMassSquared:relativeSupport.map(value=>value*value),
      lightDeficits:weights.slice(),heavyWeights:weights.slice(),lightWeights:weights.map(value=>1-value),
      Delta:diagonal(weights),Omega:diagonal(weights),N,V,couplings:singularValues.slice(),singularValues,
      residual:[0,0,0],residualMatrix:diagonal([0,0,0]),residualNorm:0,
      degenerate:split===0,universal:anisotropy===0,
      rank:3,fullRank:true,closed:true,
      minimumWeight:Math.min(...weights),etaV,rankMargin,rankLowerBound:rankMargin*rankMargin,
      carrierStatus:'conditional',
      scope:'Explicit illustrative block-isometry family; carrier persistence additionally requires a certified trace cell.'
    };
  }

  function experiment({delta=defaultDelta,exposure=25,systematic=.00025,noise=.02,flavors:covered=flavors,heavyCovered=true}={}){
    deltaValue(delta);
    bounded('Relative exposure',exposure,0,Number.MAX_VALUE,true);
    bounded('Systematic floor',systematic,0,1);
    bounded('Statistical scale',noise,0,1);
    if(!Array.isArray(covered)||Array.from(covered).some(flavor=>!flavors.includes(flavor)))throw new RangeError('Flavor coverage must use e, mu and tau.');
    if(typeof heavyCovered!=='boolean')throw new TypeError('Heavy-support coverage must be true or false.');
    const missingFlavors=flavors.filter(flavor=>!covered.includes(flavor));
    const complete=missingFlavors.length===0&&heavyCovered;
    const statistical=noise/Math.sqrt(exposure),radius=systematic+statistical;
    // Frozen toy response: one displayed common-normalization coordinate at delta versus zero.
    // Coverage gates teach protocol completeness; this scalar plot does not implement that full protocol.
    // This identity response is declared here, not inferred from an actual detector or the ideal source gap.
    const carrierRecord=[delta],referenceRecord=[0];
    const separator=Math.hypot(...carrierRecord);
    const separable=2*radius<separator;
    const floorLimited=2*systematic>=separator;
    const remainingMargin=separator/2-systematic;
    const exposureThreshold=remainingMargin>0?Math.pow(noise/remainingMargin,2):null;
    const status=!complete?'incomplete':separable?'capable':'inconclusive';
    return {
      status,delta,exposure,statistical,systematic,radius,separator,
      carrierRecord,referenceRecord,complete,missingFlavors,heavyCovered,
      floorLimited,exposureThreshold,separable:complete&&separable,
      scope:'Two illustrative records with a declared identity response; not a qualified facility test or simulated observation.'
    };
  }

  return {flavors,sourceRowBound,defaultDelta,threshold,strength,perturbation,experiment};
});

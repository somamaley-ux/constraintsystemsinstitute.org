(() => {
 'use strict';
 const input=document.querySelector('#corpus-search-input'),results=document.querySelector('#corpus-search-results'),meta=document.querySelector('#corpus-search-meta'),clear=document.querySelector('#corpus-search-clear'),more=document.querySelector('#corpus-search-more');
 if(!input||!results||!meta||!clear||!more)return;
 const subject=document.querySelector('#corpus-subject'),order=document.querySelector('#corpus-order'),list=document.querySelector('#repository-list');
 const normal=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en');
 const safe=href=>{try{const u=new URL(href,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}};
 const entries=new Map();let visible=12,loaded=false,count=0;
 const params=new URLSearchParams(location.search);if(subject&&[...subject.options].some(o=>o.value===params.get('subject')))subject.value=params.get('subject');if(order&&params.get('sort')==='recent')order.value='recent';input.value=params.get('q')||'';
 for(const link of document.querySelectorAll('main a[href*="github.com/"]')){
  const href=safe(link.href),title=(link.closest('article')?.querySelector('h3')?.textContent||link.textContent||'').trim();if(href&&title.length>3&&!entries.has(href))entries.set(href,{href,title,label:'GitHub repository',context:'Formalization and reference releases',subjects:['Formalization and reference releases'],search:normal(title+' '+href+' lean repository')});
 }
 function render(){
  const terms=normal(input.value.trim()).split(/\s+/).filter(Boolean),filter=subject?.value||'',recent=order?.value==='recent';results.replaceChildren();clear.hidden=!input.value;
  const active=terms.length||filter||recent;if(list)list.hidden=!!active;
  if(!active){meta.textContent=loaded?`${count} repository records. Search by title, concept or DOI.`:'Loading the repository catalogue.';more.hidden=true;return}
  const matches=[...entries.values()].filter(e=>(!filter||e.subjects.includes(filter))&&terms.every(t=>e.search.includes(t))).map(e=>({...e,score:terms.reduce((n,t)=>n+(normal(e.title).includes(t)?4:0)+(normal(e.label).includes(t)?3:0),0)})).sort((a,b)=>recent?(b.date||'').localeCompare(a.date||'')||a.title.localeCompare(b.title):b.score-a.score||a.title.localeCompare(b.title));
  const shown=matches.slice(0,visible);meta.textContent=matches.length?`${matches.length} ${matches.length===1?'result':'results'} - showing ${shown.length}`:'No results. Try a broader term or another subject.';
  for(const e of shown){const row=document.createElement('article');row.className='search-result';const context=document.createElement('span');context.textContent=e.context;const strong=document.createElement('strong'),a=document.createElement('a');a.href=e.href;a.textContent=e.title;strong.append(a);const label=document.createElement('em');label.textContent=e.label+(e.unavailable?' - public source unavailable':'');row.append(context,strong,label);results.append(row)}
  more.hidden=matches.length<=visible;
 }
 function change(){visible=12;render()}
 input.addEventListener('input',change);subject?.addEventListener('change',change);order?.addEventListener('change',change);
 clear.addEventListener('click',()=>{input.value='';change();input.focus({preventScroll:true})});
 for(const button of document.querySelectorAll('[data-search-term]'))button.addEventListener('click',()=>{input.value=button.dataset.searchTerm;change();input.focus({preventScroll:true})});
 more.addEventListener('click',()=>{const first=results.children.length;visible+=12;render();results.children[first]?.querySelector('a')?.focus({preventScroll:true})});
 document.addEventListener('keydown',event=>{if(event.ctrlKey||event.altKey||event.metaKey||event.isComposing)return;const editing=event.target instanceof Element&&(event.target.matches('input,textarea,select')||event.target.isContentEditable);if(event.key==='/'&&!editing){event.preventDefault();input.focus()}if(event.key==='Escape'&&event.target===input){event.preventDefault();input.value='';change()}});
 render();fetch('/papers.json').then(r=>{if(!r.ok)throw Error('Catalogue unavailable');return r.json()}).then(papers=>{
  if(!Array.isArray(papers))throw Error('Invalid catalogue');
  for(const p of papers){
   const href=safe(p.url);if(!href||!p.title)continue;
   const labels=p.subjects||['Other research'],exact=p.preferred_edition?.doi||p.preferred_release?.doi;
   const recordDois=[...(p.publication_records||[]).flatMap(record=>[record.concept_doi,record.exact_release_doi]),...(p.earlier_editions||[]).map(edition=>edition.doi)].filter(Boolean);
   const label=(p.doi||(p.publication_records||[]).map(record=>record.concept_doi).join(' / '))+(p.preferred_edition?.publication_status==='unpublished_on_zenodo'?' · unpublished update':'');
   entries.set(p.work_id||p.doi||href,{href,title:p.title,label,context:labels.join(' / '),subjects:labels,date:p.updated_date||p.preferred_edition?.publisher_publication_date||p.preferred_release?.publisher_publication_date||p.date,unavailable:!!p.release_status,search:normal(`${p.title} ${p.doi||''} ${exact||''} ${recordDois.join(' ')} ${p.url} ${p.keywords||''} ${p.description||''} ${labels.join(' ')} ${(p.research_groups||[]).join(' ')}`)});count++
  }
  document.body.classList.add('repository-search-ready');loaded=true;render();
 }).catch(()=>{if(list)list.hidden=false;meta.textContent='Search is temporarily unavailable. Browse the complete repository below.';more.hidden=true});
})();

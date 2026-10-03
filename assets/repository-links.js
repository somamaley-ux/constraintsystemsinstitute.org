(() => {
 'use strict';
 if(document.body?.dataset.paperLayout==='repository')return;
 Promise.all(['/data/repository-paper-aliases.json','/data/repository-cited-assets.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error();return r.json()}))).then(([aliases,assets])=>{
  const route=anchor=>{
   const match=(anchor.getAttribute('href')||'').match(/^https?:\/\/(?:doi\.org\/10\.5281\/zenodo\.|zenodo\.org\/(?:records?\/|doi\/10\.5281\/zenodo\.))(\d+)\/?(?:[?#].*)?$/);
   if(!match){
    let url;try{url=new URL(anchor.getAttribute('href'),location.href)}catch{return}const asset=assets[url.pathname];if(!asset||url.origin!==location.origin)return;
    anchor.setAttribute('href',asset.url+(asset.same_as_current_published_pdf?'':'#cited-pdf-'+asset.sha256));anchor.removeAttribute('download');anchor.setAttribute('aria-label','Open paper and citation');return;
   }const doi='10.5281/zenodo.'+match[1],entry=aliases[doi];if(!entry)return;
   anchor.dataset.citedDoi=doi;if(entry.work_doi)anchor.dataset.paperDoi=entry.work_doi;else delete anchor.dataset.paperDoi;if(entry.work_id)anchor.dataset.paperWorkId=entry.work_id;anchor.setAttribute('data-paper-link','');anchor.setAttribute('href',entry.url);
  };
  document.querySelectorAll('a[href]').forEach(route);
  new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'){route(record.target);continue}for(const node of record.addedNodes){if(!(node instanceof Element))continue;if(node.matches('a[href]'))route(node);node.querySelectorAll('a[href]').forEach(route)}}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
 }).catch(()=>{});
})();

import fs from 'node:fs';
import path from 'node:path';
export function routeRepositoryLinks(root,html,relativePage='index.html'){
 if(/data-paper-layout=["']repository["']/.test(html))return html;
 const file=path.join(root,'data','repository-paper-aliases.json');if(!fs.existsSync(file))return html;
 const aliases=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
 const assetFile=path.join(root,'data','repository-cited-assets.json');
 const assets=fs.existsSync(assetFile)?JSON.parse(fs.readFileSync(assetFile,'utf8').replace(/^\uFEFF/,'')):{};
 return html.replace(/<a\b[^>]*>/gi,tag=>{
  const attr=tag.match(/\bhref=(["'])(.*?)\1/i);if(!attr)return tag;
  const location=new URL(attr[2],`https://constraintsystemsinstitute.org/${relativePage}`),asset=assets[location.pathname];
  if(asset&&location.hostname==='constraintsystemsinstitute.org'){
   const target=asset.url+(asset.same_as_current_published_pdf?'':'#cited-pdf-'+asset.sha256);
   return tag.replace(attr[0],`href="${target}" data-paper-link data-paper-doi="${asset.work_doi}"`).replace(/\sdownload(?:=(["']).*?\1)?/i,'').replace(/\s(?:title|aria-label)=(["']).*?\1/gi,'').replace(/<a\b/i,'<a aria-label="Open paper and citation"');
  }
  const match=attr[2].match(/^https?:\/\/(?:doi\.org\/10\.5281\/zenodo\.|zenodo\.org\/(?:records?\/|doi\/10\.5281\/zenodo\.))(\d+)\/?(?:[?#].*)?$/);if(!match)return tag;
  const doi='10.5281/zenodo.'+match[1],entry=aliases[doi];if(!entry)return tag;
  const identity=entry.work_id?`data-paper-work-id="${entry.work_id}"`:`data-paper-doi="${entry.work_doi}"`;
  return tag.replace(attr[0],`href="${entry.url}" data-paper-link ${identity} data-cited-doi="${doi}"`);
 });
}

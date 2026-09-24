// Code-native sharing artwork for the physics recovery overview.
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="glow"><stop stop-color="#403240"/><stop offset="1" stop-color="#201e23"/></radialGradient></defs>
<rect width="1200" height="630" fill="#201e23"/><ellipse cx="960" cy="330" rx="450" ry="500" fill="url(#glow)"/>
<text x="62" y="67" fill="#b7c9b1" font-family="Segoe UI,Arial,sans-serif" font-size="17" letter-spacing="2">CONSTRAINT SYSTEMS INSTITUTE</text>
<text x="62" y="152" fill="#ccb4c2" font-family="Segoe UI,Arial,sans-serif" font-size="18" letter-spacing="2">PHYSICS FROM A COMMON FOUNDATION</text>
<g fill="#f0e5e3" font-family="Georgia,serif" font-size="74"><text x="58" y="259">Where the familiar</text><text x="58" y="345">laws come from.</text></g>
<text x="62" y="415" fill="#ccbfc9" font-family="Segoe UI,Arial,sans-serif" font-size="25">Different equations. One physical world.</text>
<g fill="none" stroke-width="2" stroke-linecap="round"><path d="M805 263L865 167L925 263M865 150V280M795 263H935" stroke="#d0b4c4"/><path d="M987 180Q1065 250 1143 180M987 205Q1065 273 1143 205M1012 151Q1042 245 1012 280M1070 151Q1040 245 1070 280M1118 151Q1088 245 1118 280" stroke="#b5c4d0"/>
<path d="M795 367C830 367 817 330 840 368S860 422 875 343S900 335 913 362S935 368 940 368" stroke="#b7c9b1"/><path d="M1020 342L1108 342L1064 405Z" stroke="#d1b89c"/><circle cx="1020" cy="342" r="12" stroke="#d1b89c"/><circle cx="1108" cy="342" r="12" stroke="#d1b89c"/><circle cx="1064" cy="405" r="12" stroke="#d1b89c"/>
<path d="M850 445V477H1090V445M970 477V514M870 514H1070" stroke="#b7c9b166"/></g>
<g fill="#c7b9c4" font-family="Segoe UI,Arial,sans-serif" font-size="17" text-anchor="middle"><text x="865" y="310">Special relativity</text><text x="1065" y="310">General relativity</text><text x="865" y="442">Quantum dynamics</text><text x="1065" y="442">Matter &amp; interactions</text><text x="970" y="548" fill="#b7c9b1">A common foundation</text></g>
<path d="M62 496H140" stroke="#b7c9b1" stroke-width="2"/><text x="62" y="564" fill="#baaeba" font-family="Segoe UI,Arial,sans-serif" font-size="17">constraintsystemsinstitute.org/physics-from-below/</text></svg>`;
sharp(Buffer.from(svg)).jpeg({quality:87,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(path.join(root,'assets/social/physics-from-below.jpg')).then(()=>console.log('Built physics recovery sharing image:1200x630.')).catch(error=>{console.error(error);process.exitCode=1;});

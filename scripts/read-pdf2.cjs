const pdf = require('pdf-parse');
const fs = require('fs');

const buf = fs.readFileSync('C:/Users/khizar.imtiaz/Downloads/tokenlens-phase3.pdf');
// pdf-parse exports differently depending on version
const pdfParse = typeof pdf === 'function' ? pdf : (pdf.default || pdf);

pdfParse(buf).then(data => {
  console.log('Pages:', data.numpages);
  console.log(data.text);
}).catch(e => {
  console.error('Error:', e.message);
  // Try the sub-module directly
  try {
    const pp = require('pdf-parse/lib/pdf-parse.js');
    const fn = typeof pp === 'function' ? pp : pp.default;
    fn(buf).then(d => { console.log(d.text); }).catch(console.error);
  } catch(e2) { console.error(e2.message); }
});

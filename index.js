import fs from 'fs';
import util from 'util';
// import pdf from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { diffLines } from 'diff';
// import pdfjsWorker  from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjsLib.disableFontFace = true;
// import { PDFDocument } from 'pdf-lib';

async function extractTextFromPDF(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const maxPages = pdf.numPages;
  let text = '';

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(' ') + '\n';
  }

  return text;
}

async function comparePDFs(pdf1Path, pdf2Path) {
  const text1 = await extractTextFromPDF(pdf1Path);
  const text2 = await extractTextFromPDF(pdf2Path);

  // console.log('### 111', { text1 });
  // console.log('### 222', { text2 });

  const differences = diffLines(text1, text2);

  // console.log('### 111', { differences });

  differences.forEach((part) => {
    const color = part.added ? '42m' : part.removed ? '41m' : '42m';

    let msg = util.inspect(
      part.value,
      {
        colors: true,
      }
    );

    msg = msg.replace('32m', `${color}\u001b[30m`).replace('39m', '49m\u001b[39m');

    console.log('## Diff', msg);
  });
}

comparePDFs(
  './pdf1.pdf',
  './pdf2.pdf'
);

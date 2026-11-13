import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { CourseType } from '../types';
import { sanitizeFileName } from './security';
import { APP_FOOTER_CREDITS } from '../constants/credits';

export interface RecoveryReportData {
  course: CourseType | string;
  year: number | string;
  period: string; // e.g. "1º BIMESTRE", "2º BIMESTRE", "3º BIMESTRE", "4º BIMESTRE", "MÓDULO 1"
  subject: string; // Componente Curricular
  code?: string; // Sigla, e.g. "HIS1"
  teacher?: string; // Professor(a)
  teachers?: string[]; // Professores(as)
}

/**
 * Sanitize text to ensure compatibility with standard WinAnsi PDF fonts and eliminate control characters
 */
function sanitizePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[“”""]/g, '"')
    .replace(/[‘’'']/g, "'")
    .replace(/[•]/g, '-')
    .replace(/[\t]/g, ' ');
}

/**
 * Wrap text into lines fitting within maxWidth
 */
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const clean = sanitizePdfText(text);
  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Strips organizational suffixes like "(bimestral)" or "(modular)" so the course name
 * appears clean and institutional on the printed PDF report form.
 */
function cleanCourseNameForReport(courseName: string): string {
  if (!courseName) return '';
  return courseName
    .replace(/\s*\(\s*bimestral\s*\)/gi, '')
    .replace(/\s*\(\s*modular\s*\)/gi, '')
    .trim();
}

/**
 * Generates an official PDF report of Recovery Exemption (Relatório de Controle de Recuperação Paralela)
 * matching the institutional form required by IFSP.
 */
export async function generateRecoveryReportPdf(
  data: RecoveryReportData,
  fileName?: string
): Promise<File> {
  const pdfDoc = await PDFDocument.create();

  // Standard Serif font (Times Roman) matching the institutional template
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // A4 Page dimensions (595.28 x 841.89 pt)
  const page = pdfDoc.addPage([595.28, 841.89]);
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // 1. EMBED IFSP LOGO
  let logoDrawn = false;
  try {
    const response = await fetch('/assets/img/Marca_IFSP_SJP_V-01.png');
    if (response.ok) {
      const imgBuffer = await response.arrayBuffer();
      const pngImage = await pdfDoc.embedPng(imgBuffer);

      // Desired logo display dimensions (proportional, increased 50% from 72 to 108)
      const logoWidth = 108;
      const logoHeight = (logoWidth * pngImage.height) / pngImage.width;
      const logoX = (pageWidth - logoWidth) / 2;
      const logoTop = 812;
      const logoY = logoTop - logoHeight;

      page.drawImage(pngImage, {
        x: logoX,
        y: logoY,
        width: logoWidth,
        height: logoHeight,
      });
      logoDrawn = true;
    }
  } catch (err) {
    console.warn('Could not load PNG logo, drawing header text:', err);
  }

  if (!logoDrawn) {
    // Fallback Institutional Text Header if image unavailable
    const instText1 = 'INSTITUTO FEDERAL';
    const instText2 = 'São Paulo';
    const t1Width = fontBold.widthOfTextAtSize(instText1, 14);
    const t2Width = fontRegular.widthOfTextAtSize(instText2, 11);

    page.drawText(instText1, {
      x: (pageWidth - t1Width) / 2,
      y: 770,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(instText2, {
      x: (pageWidth - t2Width) / 2,
      y: 754,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // 2. DOCUMENT TITLE (Centered, Bold, All-Caps)
  const titleLine1 = 'CONTROLE DE';
  const titleLine2 = 'RECUPERAÇÃO PARALELA';
  const titleFontSize = 14;

  const t1W = fontBold.widthOfTextAtSize(titleLine1, titleFontSize);
  const t2W = fontBold.widthOfTextAtSize(titleLine2, titleFontSize);

  page.drawText(titleLine1, {
    x: (pageWidth - t1W) / 2,
    y: 668,
    size: titleFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  page.drawText(titleLine2, {
    x: (pageWidth - t2W) / 2,
    y: 650,
    size: titleFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 3. MAIN TABLE
  const tableWidth = 440;
  const tableX = (pageWidth - tableWidth) / 2;
  const tableTopY = 618;
  const col1Width = 145; // Label column width
  const col2Width = tableWidth - col1Width; // 295

  // Normalize data values - strip "(bimestral)" and "(modular)" from course name
  const rawCourse = cleanCourseNameForReport(data.course || 'Técnico em Informática');
  const courseText = sanitizePdfText(rawCourse || 'Técnico em Informática');
  const yearText = sanitizePdfText(String(data.year || 2026));
  const periodText = sanitizePdfText(data.period.toUpperCase());

  const resolvedTeachers = (data.teachers?.length ? data.teachers : [data.teacher || 'Docente responsável'])
    .map((teacher) => teacher.trim())
    .filter(Boolean)
    .map((teacher) =>
      sanitizePdfText(/^prof(\.|a\.|ª|essor|essora)?\b/i.test(teacher) ? teacher : `Prof. ${teacher}`)
    );
  const subjectText = sanitizePdfText(data.subject || 'Componente Curricular');

  // Dynamic row heights depending on text length
  const courseLines = wrapText(courseText, fontRegular, 10.5, col2Width - 16);
  const courseRowHeight = Math.max(28, courseLines.length * 14 + 12);

  const subjectLines = wrapText(subjectText, fontRegular, 10.5, col2Width - 16);
  const subjectRowHeight = Math.max(28, subjectLines.length * 14 + 12);

  const teacherLines = resolvedTeachers.flatMap((teacher) =>
    wrapText(teacher, fontRegular, 10.5, col2Width - 16)
  );
  const teacherRowHeight = Math.max(26, teacherLines.length * 14 + 12);

  const rows = [
    { label: 'Curso:', lines: courseLines, height: courseRowHeight },
    { label: 'Ano:', lines: [yearText], height: 26 },
    { label: 'Período:', lines: [periodText], height: 26 },
    { label: resolvedTeachers.length > 1 ? 'Professores:' : 'Professor:', lines: teacherLines, height: teacherRowHeight },
    { label: 'Componente Curricular:', lines: subjectLines, height: subjectRowHeight },
  ];

  const totalTableHeight = rows.reduce((acc, r) => acc + r.height, 0);
  const tableBottomY = tableTopY - totalTableHeight;

  // Draw Table Outer Border
  page.drawRectangle({
    x: tableX,
    y: tableBottomY,
    width: tableWidth,
    height: totalTableHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.2,
  });

  // Draw Table Vertical Divider between Col 1 and Col 2
  page.drawLine({
    start: { x: tableX + col1Width, y: tableBottomY },
    end: { x: tableX + col1Width, y: tableTopY },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // Draw Rows & Content
  let currentY = tableTopY;
  rows.forEach((row, idx) => {
    // Row horizontal bottom divider (for all except last row)
    if (idx < rows.length - 1) {
      page.drawLine({
        start: { x: tableX, y: currentY - row.height },
        end: { x: tableX + tableWidth, y: currentY - row.height },
        color: rgb(0, 0, 0),
        thickness: 1,
      });
    }

    // Col 1: Label (Bold)
    page.drawText(row.label, {
      x: tableX + 10,
      y: currentY - 18,
      size: 10.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Col 2: Value lines (Regular)
    row.lines.forEach((line, lineIdx) => {
      page.drawText(line, {
        x: tableX + col1Width + 10,
        y: currentY - 18 - lineIdx * 14,
        size: 10.5,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    });

    currentY -= row.height;
  });

  // 4. OFFICIAL STATEMENT BOX (Below Table)
  // Matching the blue/gray container in the image
  const boxTopY = tableBottomY - 18;
  const boxWidth = tableWidth;
  const boxHeight = 72;
  const boxX = tableX;

  // Light blue-tinted background as seen in user's image
  page.drawRectangle({
    x: boxX,
    y: boxTopY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.91, 0.94, 0.98), // subtle blue-gray fill
    borderColor: rgb(0.18, 0.28, 0.45), // soft dark-navy border
    borderWidth: 1.2,
  });

  // Text inside the box from user image:
  // "Para este componente curricular não foi necessária a aplicação de recuperação paralela no bimestre em questão."
  const isModular = periodText.includes('MÓDULO') || periodText.includes('MODULO');
  const statementText = isModular
    ? 'Para este componente curricular não foi necessária a aplicação de recuperação paralela no módulo em questão.'
    : 'Para este componente curricular não foi necessária a aplicação de recuperação paralela no bimestre em questão.';

  const statementLines = wrapText(statementText, fontRegular, 11, boxWidth - 32);
  const textStartY = boxTopY - 26;

  statementLines.forEach((line, idx) => {
    page.drawText(line, {
      x: boxX + 16,
      y: textStartY - idx * 17,
      size: 11,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });
  });

  // 5. SIGNATURE & DATE SECTION (Professional Academic Footer matching official template)
  const signSectionY = boxTopY - boxHeight - 75;

  // City & Date
  const today = new Date();
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  const dateStr = `São José do Rio Preto - SP, ${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateStr, 10.5);

  page.drawText(dateStr, {
    x: (pageWidth - dateWidth) / 2,
    y: signSectionY,
    size: 10.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Signer Name & Title formatting (teacher name placed above signature line)
  const signerSub = 'Docente / IFSP Câmpus São José do Rio Preto';
  const nameFontSize = 12;
  const subFontSize = 9;
  const signatureColumns = resolvedTeachers.length === 1 ? 1 : 2;
  const signatureWidth = signatureColumns === 1 ? 300 : 210;

  const mainPageTeachers = resolvedTeachers.length <= 4 ? resolvedTeachers : [];
  mainPageTeachers.forEach((displayName, index) => {
    const column = index % signatureColumns;
    const row = Math.floor(index / signatureColumns);
    const centerX =
      signatureColumns === 1
        ? pageWidth / 2
        : 155 + column * 285;
    const signLineY = signSectionY - 55 - row * 74;
    const nameWidth = fontBold.widthOfTextAtSize(displayName, nameFontSize);
    const subWidth = fontRegular.widthOfTextAtSize(signerSub, subFontSize);

    page.drawText(displayName, {
      x: centerX - nameWidth / 2,
      y: signLineY + 8,
      size: nameFontSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: centerX - signatureWidth / 2, y: signLineY },
      end: { x: centerX + signatureWidth / 2, y: signLineY },
      color: rgb(0.2, 0.2, 0.2),
      thickness: 1,
    });
    page.drawText(signerSub, {
      x: centerX - subWidth / 2,
      y: signLineY - 14,
      size: subFontSize,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });
  });

  const footerText = sanitizePdfText(APP_FOOTER_CREDITS);

  // Document Footer
  const docNotice = 'Documento gerado eletronicamente · IFSP Câmpus São José do Rio Preto';
  const docNoticeWidth = fontRegular.widthOfTextAtSize(docNotice, 7.5);
  page.drawText(docNotice, {
    x: (pageWidth - docNoticeWidth) / 2,
    y: 33,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.55, 0.55, 0.55),
  });

  const fWidth = fontRegular.widthOfTextAtSize(footerText, 6.5);
  page.drawText(footerText, {
    x: (pageWidth - fWidth) / 2,
    y: 21,
    size: 6.5,
    font: fontRegular,
    color: rgb(0.68, 0.68, 0.68),
  });

  if (resolvedTeachers.length > 4) {
    const overflowTeachers = resolvedTeachers.slice(0);
    for (let start = 0; start < overflowTeachers.length; start += 8) {
      const signaturePage = pdfDoc.addPage([595.28, 841.89]);
      const signatureTeachers = overflowTeachers.slice(start, start + 8);
      const signatureTitle = 'ASSINATURAS DOS DOCENTES';
      const signatureTitleWidth = fontBold.widthOfTextAtSize(signatureTitle, 14);

      signaturePage.drawText(signatureTitle, {
        x: (pageWidth - signatureTitleWidth) / 2,
        y: 765,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      signatureTeachers.forEach((displayName, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const centerX = 155 + column * 285;
        const signLineY = 650 - row * 145;
        const nameWidth = fontBold.widthOfTextAtSize(displayName, nameFontSize);
        const subWidth = fontRegular.widthOfTextAtSize(signerSub, subFontSize);

        signaturePage.drawText(displayName, {
          x: centerX - nameWidth / 2,
          y: signLineY + 8,
          size: nameFontSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
        signaturePage.drawLine({
          start: { x: centerX - 105, y: signLineY },
          end: { x: centerX + 105, y: signLineY },
          color: rgb(0.2, 0.2, 0.2),
          thickness: 1,
        });
        signaturePage.drawText(signerSub, {
          x: centerX - subWidth / 2,
          y: signLineY - 14,
          size: subFontSize,
          font: fontRegular,
          color: rgb(0.25, 0.25, 0.25),
        });
      });

      signaturePage.drawText(docNotice, {
        x: (pageWidth - docNoticeWidth) / 2,
        y: 33,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.55, 0.55, 0.55),
      });
      signaturePage.drawText(footerText, {
        x: (pageWidth - fWidth) / 2,
        y: 21,
        size: 6.5,
        font: fontRegular,
        color: rgb(0.68, 0.68, 0.68),
      });
    }
  }

  // Output
  const pdfBytes = await pdfDoc.save();
  const safePeriodCode = periodText.replace(/[^A-Z0-9]/gi, '_');
  const safeSubj = (data.code || 'DISC').replace(/[^A-Z0-9]/gi, '');
  const rawFileName = fileName || `Relatorio_Sem_Recuperacao_${safePeriodCode}_${safeSubj}.pdf`;
  const safeFileName = sanitizeFileName(rawFileName, 'Relatorio_Sem_Recuperacao.pdf');

  return new File([pdfBytes], safeFileName, { type: 'application/pdf' });
}

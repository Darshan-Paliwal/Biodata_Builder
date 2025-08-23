import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body.formData || {};

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const title = `BIO DATA : ${formData.name?.toUpperCase() || "UNKNOWN"}`;
    const titleWidth = fontBold.widthOfTextAtSize(title, 52);
    const titleX = (width - titleWidth) / 2;
    page.drawText(title, {
      x: titleX,
      y: height - 200, // Moved title down slightly
      size: 52,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    let yPos = height - 300; // Adjusted starting yPos to move text down
    const lineHeight = 62;
    const textAreaWidth = 1400;
    const valueMaxWidth = textAreaWidth - 170;

    const drawField = (label: string, value: string) => {
      if (!value || value === "-") return;
      page.drawText("•", { x: 100, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
      page.drawText(label, { x: 150, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      const colonX = 150 + fontBold.widthOfTextAtSize(label, 32);
      page.drawText(" :", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      const valueX = colonX + 20;
      const lines = wrapText(value, valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - (i * 40), size: 32, font, color: rgb(0, 0, 0) });
      }
      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    const drawSiblingField = () => {
      const siblingType = formData.siblingType || "Sister";
      const siblingName = formData.siblingName || "";
      if (!siblingName) return;
      const label = `${siblingType} Name`;
      page.drawText("•", { x: 100, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
      page.drawText(label, { x: 150, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      const colonX = 150 + fontBold.widthOfTextAtSize(label, 32);
      page.drawText(" :", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      const valueX = colonX + 20;
      const lines = wrapText(siblingName, valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - (i * 40), size: 32, font, color: rgb(0, 0, 0) });
      }
      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    const drawMobileField = (labelPrefix: string, person: string, number: string) => {
      if (!person && !number) return;
      const label = `${labelPrefix} (Person)`;
      if (person) {
        page.drawText("•", { x: 100, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
        page.drawText(label, { x: 150, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
        const colonX = 150 + fontBold.widthOfTextAtSize(label, 32);
        page.drawText(" :", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
        const valueX = colonX + 20;
        const lines = wrapText(person, valueMaxWidth, font, 32);
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], { x: valueX, y: yPos - (i * 40), size: 32, font, color: rgb(0, 0, 0) });
        }
        yPos -= lineHeight + (lines.length - 1) * 40;
      }
      if (number) {
        const numberLabel = `${labelPrefix} (Number)`;
        page.drawText("•", { x: 100, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
        page.drawText(numberLabel, { x: 150, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
        const colonX = 150 + fontBold.widthOfTextAtSize(numberLabel, 32);
        page.drawText(" :", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
        const valueX = colonX + 20;
        const lines = wrapText(number, valueMaxWidth, font, 32);
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], { x: valueX, y: yPos - (i * 40), size: 32, font, color: rgb(0, 0, 0) });
        }
        yPos -= lineHeight + (lines.length - 1) * 40;
      }
    };

    if (formData.name) drawField("Name", formData.name);
    if (formData.birthName) drawField("Birth Name", formData.birthName);
    if (formData.dob) drawField("DOB", formData.dob);
    if (formData.birthTime) drawField("Birth Time", formData.birthTime);
    if (formData.birthPlace) drawField("Birth Place", formData.birthPlace);
    if (formData.district) drawField("District", formData.district);
    if (formData.gotra) drawField("Gotra", formData.gotra);
    if (formData.height) drawField("Height", formData.height);
    if (formData.bloodGroup) drawField("Blood Group", formData.bloodGroup);
    if (formData.qualification) drawField("Qualification", formData.qualification);
    if (formData.occupation) drawField("Occupation", formData.occupation);
    if (formData.fatherName) drawField("Father Name", formData.fatherName);
    if (formData.motherName) drawField("Mother Name", formData.motherName);
    if (formData.motherOccupation) drawField("Mother Occupation", formData.motherOccupation);
    drawSiblingField();
    if (formData.residence) drawField("Residence", formData.residence);
    if (formData.permanentAddress) drawField("Permanent Address", formData.permanentAddress);
    drawMobileField("Mobile Number (Mother)", formData.mobileMotherPerson || "", formData.mobileMother || "");
    drawMobileField("Mobile Number (Mama)", formData.mobileMamaPerson || "", formData.mobileMama || "");

    if (formData.image) {
      const imageBytes = Uint8Array.from(atob(formData.image.split(",")[1]), (c) => c.charCodeAt(0));
      let embeddedImage;
      if (formData.image.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (formData.image.startsWith("data:image/png")) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported image format");
      }
      const imgDims = embeddedImage.scale(0.65);
      const imageX = 1550;
      page.drawImage(embeddedImage, { x: imageX, y: 500, width: imgDims.width, height: imgDims.height });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
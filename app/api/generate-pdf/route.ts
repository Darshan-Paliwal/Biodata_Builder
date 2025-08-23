import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
  const words = (text || "").split(" ");
  const lines: string[] = [];
  let currentLine = "";

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

// Convert 24h time -> 12h with AM/PM
function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const hour = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body.formData || {};

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ---- Title ----
    const title = `BIO DATA : ${formData.name?.toUpperCase() || "UNKNOWN"}`;
    const titleWidth = fontBold.widthOfTextAtSize(title, 52);
    const titleX = (width - titleWidth) / 2;
    page.drawText(title, {
      x: titleX,
      y: height - 200,
      size: 52,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // ---- Layout ----
    let yPos = height - 350; // start slightly lower
    const lineHeight = 62;
    const valueMaxWidth = 1200;
    const colonX = 650; // fixed colon alignment
    const valueX = colonX + 30;

    const drawField = (label: string, value: string) => {
      if (!value || value === "-") return;
      page.drawText("•", { x: 100, y: yPos, size: 32, font });
      page.drawText(label, { x: 150, y: yPos, size: 32, font: fontBold });
      page.drawText(":", { x: colonX, y: yPos, size: 32, font: fontBold });

      const lines = wrapText(String(value), valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - i * 40, size: 32, font });
      }
      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    const drawSiblingField = () => {
      const siblingType = formData.siblingType || "Sister";
      const siblingName = formData.siblingName || "";
      if (!siblingName) return;

      const label = `${siblingType} Name`;
      page.drawText("•", { x: 100, y: yPos, size: 32, font });
      page.drawText(label, { x: 150, y: yPos, size: 32, font: fontBold });
      page.drawText(":", { x: colonX, y: yPos, size: 32, font: fontBold });

      const lines = wrapText(String(siblingName), valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - i * 40, size: 32, font });
      }
      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    const drawMobileField = (relation: string, number: string) => {
      if (!relation && !number) return;
      const label = relation ? `Mobile Number (${relation})` : "Mobile Number";

      page.drawText("•", { x: 100, y: yPos, size: 32, font });
      page.drawText(label, { x: 150, y: yPos, size: 32, font: fontBold });
      page.drawText(":", { x: colonX, y: yPos, size: 32, font: fontBold });

      const lines = wrapText(String(number || ""), valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - i * 40, size: 32, font });
      }
      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    // ---- Draw all fields ----
    if (formData.name) drawField("Name", formData.name);
    if (formData.birthName) drawField("Birth Name", formData.birthName);
    if (formData.dob) drawField("DOB", formData.dob);
    if (formData.birthTime) drawField("Birth Time", formatTime(formData.birthTime));
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

    // ✅ Mobile numbers fixed
    drawMobileField(formData.mobileRelation1, formData.mobileNumber1);
    drawMobileField(formData.mobileRelation2, formData.mobileNumber2);

    // ---- Image ----
    if (formData.image) {
      const base64 = String(formData.image);
      const base64Data = base64.split(",")[1];
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      let embeddedImage;
      if (base64.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (base64.startsWith("data:image/png")) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported image format");
      }

      const imgDims = embeddedImage.scale(0.65);
      const imageX = 1550;
      page.drawImage(embeddedImage, {
        x: imageX,
        y: 500,
        width: imgDims.width,
        height: imgDims.height,
      });
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
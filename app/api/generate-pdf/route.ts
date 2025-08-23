// app/api/generate-pdf/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/** Split text into lines that fit maxWidth using the provided font+size */
const wrapText = (
  text: string,
  maxWidth: number,
  font: any,
  size: number
): string[] => {
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

/** Convert "HH:mm" -> "hh:mm AM/PM" */
const formatTime = (timeStr?: string) => {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const h12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body?.formData ?? {};

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ---------- Pre-embed image ----------
    let embeddedImage: any = null;
    let hasImage = false;
    let imgWidth = 0;
    let imgHeight = 0;
    const imageX = width - 550; // right side placement
    const imageY = height - 900;

    if (formData.image) {
      const base64: string = String(formData.image);
      const commaIdx = base64.indexOf(",");
      const base64Data = commaIdx >= 0 ? base64.slice(commaIdx + 1) : base64;
      const imageBytes = Buffer.from(base64Data, "base64");

      if (base64.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (base64.startsWith("data:image/png")) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      }

      if (embeddedImage) {
        const dims = embeddedImage.scale(0.5);
        imgWidth = dims.width;
        imgHeight = dims.height;
        hasImage = true;
      }
    }

    // ---------- Title ----------
    const title = `BIO DATA : ${formData.name?.toUpperCase() || "UNKNOWN"}`;
    const titleWidth = fontBold.widthOfTextAtSize(title, 52);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: height - 200,
      size: 52,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // ---------- Text layout ----------
    let yPos = height - 350;
    const lineHeight = 62;
    const bulletX = 100;
    const labelX = 150;
    const colonX = 650;
    const valueX = colonX + 30;
    const rightMargin = 100;

    // function to calculate available text width (avoid image area)
    const getValueMaxWidth = () => {
      if (
        hasImage &&
        yPos <= imageY + imgHeight &&
        yPos >= imageY - 50 // allow small buffer
      ) {
        return imageX - 50 - valueX; // wrap text before hitting image
      }
      return width - rightMargin - valueX;
    };

    const drawValueLines = (value: string) => {
      const lines = wrapText(String(value ?? ""), getValueMaxWidth(), font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: valueX,
          y: yPos - i * 40,
          size: 32,
          font,
          color: rgb(0, 0, 0),
        });
      }
      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    const drawField = (label: string, value?: string) => {
      const v = (value ?? "").trim();
      if (!v) return;

      page.drawText("•", { x: bulletX, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
      page.drawText(label, { x: labelX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      page.drawText(":", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      drawValueLines(v);
    };

    const drawSibling = () => {
      const type = (formData.siblingType ?? "Sister").trim();
      const name = (formData.siblingName ?? "").trim();
      if (!name) return;
      drawField(`${type} Name`, name);
    };

    const drawMobile = (relation?: string, number?: string) => {
      const rel = (relation ?? "").trim();
      const num = (number ?? "").trim();
      if (!rel && !num) return;
      const label = rel ? `Mobile Number (${rel})` : "Mobile Number";
      drawField(label, num);
    };

    // ---------- Draw all fields ----------
    drawField("Name", formData.name);
    drawField("Birth Name", formData.birthName);
    drawField("DOB", formData.dob);
    drawField("Birth Time", formatTime(formData.birthTime));
    drawField("Birth Place", formData.birthPlace);
    drawField("District", formData.district);
    drawField("Gotra", formData.gotra);
    drawField("Height", formData.height);
    drawField("Blood Group", formData.bloodGroup);
    drawField("Qualification", formData.qualification);
    drawField("Occupation", formData.occupation);
    drawField("Father Name", formData.fatherName);
    drawField("Mother Name", formData.motherName);
    drawField("Mother Occupation", formData.motherOccupation);
    drawSibling();
    drawField("Residence", formData.residence);
    drawField("Permanent Address", formData.permanentAddress);
    drawMobile(formData.mobileRelation1, formData.mobileNumber1);
    drawMobile(formData.mobileRelation2, formData.mobileNumber2);

    const extra: Array<{ label?: string; value?: string }> = Array.isArray(formData.extraFields)
      ? formData.extraFields
      : [];
    for (const item of extra) {
      const lbl = (item?.label ?? "").trim();
      const val = (item?.value ?? "").trim();
      if (lbl && val) drawField(lbl, val);
    }

    // ---------- Draw image ----------
    if (hasImage && embeddedImage) {
      page.drawImage(embeddedImage, {
        x: imageX,
        y: imageY,
        width: imgWidth,
        height: imgHeight,
      });
    }

    // ---------- Return PDF ----------
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
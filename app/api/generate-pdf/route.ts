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
    const page = pdfDoc.addPage([2400, 1800]); // large canvas like your original
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ---------- Pre-embed image (so we can compute wrapping against it) ----------
    let embeddedImage: any = null;
    let hasImage = false;

    // Fixed image placement on the right
    const imageX = 1550;
    const imageY = 500;

    let imgWidth = 0;
    let imgHeight = 0;
    let imageTop = 0;
    let imageBottom = 0;

    if (formData.image) {
      const base64: string = String(formData.image);
      const commaIdx = base64.indexOf(",");
      const base64Data = commaIdx >= 0 ? base64.slice(commaIdx + 1) : base64;
      const imageBytes = Buffer.from(base64Data, "base64"); // Node-safe decode

      if (base64.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (base64.startsWith("data:image/png")) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      }

      if (embeddedImage) {
        const dims = embeddedImage.scale(0.65);
        imgWidth = dims.width;
        imgHeight = dims.height;
        imageTop = imageY + imgHeight;
        imageBottom = imageY;
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
    let yPos = height - 350; // start slightly lower for better look
    const lineHeight = 62;
    const bulletX = 100;
    const labelX = 150;
    const colonX = 650; // fixed vertical colon alignment
    const valueX = colonX + 30;
    const rightMargin = 100;
    const gutter = 40; // space between text column and image column

    const getValueMaxWidth = () => {
      // While we are vertically overlapping the image area, keep text to the left of the image.
      const withinImageBand = hasImage && yPos <= imageTop && yPos >= imageBottom;
      if (withinImageBand) {
        const narrow = imageX - gutter - valueX;
        return Math.max(200, narrow); // never let it go too tiny
      }
      // Otherwise, use full width
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

    // Mobiles (front-end sends mobileRelation1/2 + mobileNumber1/2)
    drawMobile(formData.mobileRelation1, formData.mobileNumber1);
    drawMobile(formData.mobileRelation2, formData.mobileNumber2);

    // Extra dynamic fields (array of { label, value })
    const extra: Array<{ label?: string; value?: string }> = Array.isArray(formData.extraFields)
      ? formData.extraFields
      : [];
    for (const item of extra) {
      const lbl = (item?.label ?? "").trim();
      const val = (item?.value ?? "").trim();
      if (lbl && val) drawField(lbl, val);
    }

    // ---------- Draw image last (so text never renders "over" it) ----------
    if (hasImage && embeddedImage) {
      page.drawImage(embeddedImage, {
        x: imageX,
        y: imageY,
        width: imgWidth,
        height: imgHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
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
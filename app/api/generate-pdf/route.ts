// app/api/generate-pdf/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/** Split text into lines dynamically depending on image overlap */
const wrapTextDynamic = (
  text: string,
  yStart: number,
  hasImage: boolean,
  imageX: number,
  imageTop: number,
  imageBottom: number,
  gutter: number,
  valueX: number,
  width: number,
  rightMargin: number,
  font: any,
  size: number
): string[] => {
  const words = (text || "").split(" ");
  const lines: string[] = [];
  let currentLine = "";
  let currentY = yStart;

  const flushLine = () => {
    if (!currentLine) return;
    lines.push(currentLine);
    currentLine = "";
  };

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    // Check if this line is in the vertical band of the image
    const withinImageBand =
      hasImage && currentY <= imageTop && currentY >= imageBottom;
    const maxWidth = withinImageBand
      ? Math.max(200, imageX - gutter - valueX)
      : width - rightMargin - valueX;

    if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
      currentLine = testLine;
    } else {
      flushLine();
      currentLine = word;
      currentY -= 40;
    }
  }
  flushLine();

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
  return `${h12.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")} ${ampm}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body?.formData ?? {};

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]); // large canvas
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ---------- Pre-embed image ----------
    let embeddedImage: any = null;
    let hasImage = false;

    const imageX = 1550;
    const imageY = 500;

    let imgWidth = 0;
    let imgHeight = 0;
    let imageTop = 0;
    let imageBottom = 0;

    if (formData.image) {
      const base64: string = String(formData.image);
      const commaIdx = base64.indexOf(",");
      const base64Data =
        commaIdx >= 0 ? base64.slice(commaIdx + 1) : base64;
      const imageBytes = Buffer.from(base64Data, "base64");

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
    let yPos = height - 350;
    const lineHeight = 62;
    const bulletX = 100;
    const labelX = 150;
    const colonX = 650;
    const valueX = colonX + 30;
    const rightMargin = 100;
    const gutter = 40;

    const drawValueLines = (value: string) => {
      const lines = wrapTextDynamic(
        String(value ?? ""),
        yPos,
        hasImage,
        imageX,
        imageTop,
        imageBottom,
        gutter,
        valueX,
        width,
        rightMargin,
        font,
        32
      );

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

      page.drawText("•", {
        x: bulletX,
        y: yPos,
        size: 32,
        font,
        color: rgb(0, 0, 0),
      });
      page.drawText(label, {
        x: labelX,
        y: yPos,
        size: 32,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      page.drawText(":", {
        x: colonX,
        y: yPos,
        size: 32,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
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

    const extra: Array<{ label?: string; value?: string }> =
      Array.isArray(formData.extraFields) ? formData.extraFields : [];
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
    const pdfBuffer = Buffer.from(pdfBytes); // ✅ FIX for Netlify

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
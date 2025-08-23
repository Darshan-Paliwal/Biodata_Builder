import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { biodata, extraFields } = await req.json();

    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = height - 50; // top margin
    const lineHeight = 20;

    // Title
    page.drawText("BIO DATA : MAYUR PALIWAL", {
      x: 180,
      y,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight * 2;

    // Image (Right side)
    const imagePath = path.resolve("./public/profile.jpg");
    if (fs.existsSync(imagePath)) {
      const imgBytes = fs.readFileSync(imagePath);
      const img = await pdfDoc.embedJpg(imgBytes);
      page.drawImage(img, {
        x: 400,
        y: height - 300,
        width: 150,
        height: 200,
      });
    }

    // Draw biodata as key: value
    const drawLine = (key: string, value: string) => {
      const text = `${key}: ${value}`;
      page.drawText(text, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    };

    Object.entries(biodata).forEach(([key, value]) => {
      if (y < 100) {
        // new page if space ends
        y = height - 50;
        pdfDoc.addPage();
      }
      drawLine(key, String(value));
    });

    // Extra fields from frontend
    if (extraFields && extraFields.length > 0) {
      extraFields.forEach((field: { key: string; value: string }) => {
        drawLine(field.key, field.value);
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Mayur_Paliwal_Biodata.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
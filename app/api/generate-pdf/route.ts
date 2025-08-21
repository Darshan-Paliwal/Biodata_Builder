// app/api/generate-pdf/route.ts

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Load font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 14;

    // Title
    page.drawText("Biodata", {
      x: 230,
      y: 800,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    // Margin & starting Y
    const textMargin = 80;
    let y = 740;

    // Extract fields
    const fields: [string, string][] = Object.entries(body);

    // Find the widest key
    const maxKeyWidth = Math.max(
      ...fields.map(([key]) => font.widthOfTextAtSize(key, fontSize))
    );

    // Fixed alignment positions
    const colonX = textMargin + maxKeyWidth + 10;
    const valueX = colonX + 20;

    // Draw each field
    fields.forEach(([key, value]) => {
      // Bullet
      page.drawText("•", {
        x: textMargin - 20,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // Key
      page.drawText(key, {
        x: textMargin,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // Colon (aligned)
      page.drawText(":", {
        x: colonX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // Value (aligned)
      page.drawText(value, {
        x: valueX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // Move to next line
      y -= 40;
    });

    // Footer
    const footerText = "Created by Darshan Paliwal";
    const footerLink = "darshanpaliwal.netlify.app";

    page.drawText(footerText, {
      x: 80,
      y: 40,
      font,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(footerLink, {
      x: 80 + font.widthOfTextAtSize(footerText, 12) + 10,
      y: 40,
      font,
      size: 12,
      color: rgb(0, 0, 1), // blue for link
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
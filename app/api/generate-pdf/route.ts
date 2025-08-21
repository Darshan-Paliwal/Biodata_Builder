import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, education, skills, experience } =
      await req.json();

    // Create a new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Fonts and styling
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const marginX = 70;
    let y = 750;

    // Title
    page.drawText("Biodata", {
      x: 250,
      y,
      size: 22,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 50;

    // All fields
    const fields: [string, string][] = [
      ["Name", name || ""],
      ["Email", email || ""],
      ["Phone", phone || ""],
      ["Address", address || ""],
      ["Education", education || ""],
      ["Skills", skills || ""],
      ["Experience", experience || ""],
    ];

    // Calculate max key width
    const maxKeyWidth = Math.max(
      ...fields.map(([key]) => font.widthOfTextAtSize(key, fontSize))
    );

    const colonX = marginX + maxKeyWidth + 10;
    const valueX = colonX + 20;

    // Draw each field aligned properly
    fields.forEach(([key, value]) => {
      // bullet
      page.drawText("•", {
        x: marginX - 20,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // key
      page.drawText(key, {
        x: marginX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // colon (aligned)
      page.drawText(":", {
        x: colonX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // value (aligned)
      page.drawText(value, {
        x: valueX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      y -= 40;
    });

    // Footer
    y = 50;
    page.drawText("Created by Darshan Paliwal", {
      x: marginX,
      y,
      font,
      size: 10,
      color: rgb(0.2, 0.2, 0.7), // bluish text
    });
    page.drawText(" → darshanpaliwal.netlify.app", {
      x: marginX + 140,
      y,
      font,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
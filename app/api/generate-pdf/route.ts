import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// API route for POST /api/generate-pdf
export async function POST(req: Request) {
  try {
    const { name, dob, gender, address, phone, email, education, skills, imageBase64 } =
      await req.json();

    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { height } = page.getSize();

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    page.drawText("Bio Data", {
      x: 50,
      y: height - 60,
      size: 22,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Text start position
    let yPos = height - 100;
    const lineHeight = 25;

    // Helper function to align "Label : Value"
    function drawField(label: string, value: string) {
      const labelWidth = fontBold.widthOfTextAtSize(label + " :", 12);
      page.drawText(label + " :", {
        x: 50,
        y: yPos,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      page.drawText(value || "-", {
        x: 50 + labelWidth + 10,
        y: yPos,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPos -= lineHeight;
    }

    // Draw fields (left side)
    drawField("Name", name);
    drawField("DOB", dob);
    drawField("Gender", gender);
    drawField("Address", address);
    drawField("Phone", phone);
    drawField("Email", email);
    drawField("Education", education);
    drawField("Skills", skills);

    // Insert image (right side)
    if (imageBase64) {
      const imageBytes = Uint8Array.from(
        atob(imageBase64.split(",")[1]),
        (c) => c.charCodeAt(0)
      );

      let embeddedImage;
      if (imageBase64.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      }

      const imgDims = embeddedImage.scale(0.25); // resize
      page.drawImage(embeddedImage, {
        x: 400,
        y: height - 250,
        width: imgDims.width,
        height: imgDims.height,
      });
    }

    // Save PDF
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
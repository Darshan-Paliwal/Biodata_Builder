// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      dob,
      email,
      mobile,
      relation,
      address,
      education,
      occupation,
      father,
      mother,
      height,
      weight,
      blood,
      marital,
      hobbies,
      imageBase64
    } = await req.json();

    // Create PDF with custom canvas size (2400x1800)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]);

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 36;

    // Layout setup
    const startX = 200;
    const startY = 1600;
    const lineGap = 70;
    let y = startY;

    const colonX = 800;  // fixed column for colons
    const valueX = 900;  // fixed column for values

    const labels = [
      ["Name", name],
      ["Date of Birth", dob],
      ["Email", email],
      ["Mobile Number", mobile],
      ["Relation", relation],
      ["Address", address],
      ["Education", education],
      ["Occupation", occupation],
      ["Father's Name", father],
      ["Mother's Name", mother],
      ["Height", height],
      ["Weight", weight],
      ["Blood Group", blood],
      ["Marital Status", marital],
      ["Hobbies", hobbies],
    ];

    // Draw rows
    labels.forEach(([label, value]) => {
      page.drawText(label, { x: startX, y, size: fontSize, font: fontBold, color: rgb(0, 0, 0) });
      page.drawText(":", { x: colonX, y, size: fontSize, font, color: rgb(0, 0, 0) });
      page.drawText(value || "-", { x: valueX, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineGap;
    });

    // Add image (if provided)
    if (imageBase64) {
      try {
        const imageBytes = Buffer.from(imageBase64, "base64");
        const img = (await pdfDoc.embedPng(imageBytes).catch(() => null)) 
                 || (await pdfDoc.embedJpg(imageBytes).catch(() => null));
        if (img) {
          const imgDims = img.scale(0.5);
          page.drawImage(img, {
            x: 1700,
            y: 1200,
            width: imgDims.width,
            height: imgDims.height,
          });
        }
      } catch {
        console.warn("Image embedding failed.");
      }
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
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
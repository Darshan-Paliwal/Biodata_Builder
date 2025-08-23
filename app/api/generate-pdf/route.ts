// app/api/generate-pdf/route.ts
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { name, age, gender, imageUrl } = await req.json();

    // ✅ Create PDF with fixed size (Landscape)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]); // width = 2400, height = 1800
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("Biodata", {
      x: 1000,
      y: height - 200,
      size: 60,
      font,
      color: rgb(0, 0, 0),
    });

    // Left-side text block
    const leftX = 200;
    let currentY = height - 400;
    const lineGap = 100;

    const drawField = (label: string, value: string) => {
      page.drawText(`${label.padEnd(10)}: ${value || ""}`, {
        x: leftX,
        y: currentY,
        size: 50,
        font,
        color: rgb(0, 0, 0),
      });
      currentY -= lineGap;
    };

    drawField("Name", name);
    drawField("Age", age);
    drawField("Gender", gender);

    // Right-side image
    if (imageUrl) {
      try {
        const imgBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());

        let img;
        if (imageUrl.toLowerCase().endsWith(".png")) {
          img = await pdfDoc.embedPng(imgBytes);
        } else {
          img = await pdfDoc.embedJpg(imgBytes);
        }

        const imgDims = img.scale(1);
        const imgWidth = 600;
        const imgHeight = (imgDims.height / imgDims.width) * imgWidth;

        page.drawImage(img, {
          x: 1600,
          y: height - imgHeight - 400,
          width: imgWidth,
          height: imgHeight,
        });
      } catch {
        page.drawText("Image failed to load", {
          x: 1600,
          y: height - 400,
          size: 40,
          font,
          color: rgb(1, 0, 0),
        });
      }
    }

    // ✅ Return PDF
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
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
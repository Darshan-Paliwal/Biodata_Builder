import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont("Helvetica");
    const fontBold = await pdfDoc.embedFont("Helvetica-Bold");

    let yPos = 800;
    const lineHeight = 50;
    const valueMaxWidth = 370;

    // fixed positions
    const bulletX = 100;
    const labelX = 150;
    const colonX = 400; // ✅ fixed so all colons align
    const valueX = colonX + 20;

    const wrapText = (text: string, maxWidth: number, font: any, fontSize: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    const drawField = (label: string, value: string) => {
      if (!value) return;

      page.drawText("•", { x: bulletX, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
      page.drawText(label, { x: labelX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      page.drawText(":", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });

      const lines = wrapText(value, valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - i * 40, size: 32, font, color: rgb(0, 0, 0) });
      }

      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    const drawMobileField = (relation: string, number: string) => {
      if (!relation && !number) return;

      const label = relation && relation.trim() !== "" ? `Mobile Number (${relation})` : `Mobile Number`;

      page.drawText("•", { x: bulletX, y: yPos, size: 32, font, color: rgb(0, 0, 0) });
      page.drawText(label, { x: labelX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });
      page.drawText(":", { x: colonX, y: yPos, size: 32, font: fontBold, color: rgb(0, 0, 0) });

      const value = number || "";
      const lines = wrapText(value, valueMaxWidth, font, 32);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: valueX, y: yPos - i * 40, size: 32, font, color: rgb(0, 0, 0) });
      }

      yPos -= lineHeight + (lines.length - 1) * 40;
    };

    // Fill PDF
    drawField("Name", data.name);
    drawField("Email", data.email);
    drawField("Address", data.address);

    if (data.mobiles && Array.isArray(data.mobiles)) {
      data.mobiles.forEach((m: any) => {
        drawMobileField(m.relation, m.number);
      });
    }

    drawField("Notes", data.notes);

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="output.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
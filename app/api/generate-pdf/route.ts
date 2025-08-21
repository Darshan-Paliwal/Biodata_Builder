import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body.formData || {};
    const imageBase64 = body.image || null;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const title = `BIO DATA : ${formData.name?.toUpperCase() || "UNKNOWN"}`;
    const titleWidth = fontBold.widthOfTextAtSize(title, 52);
    const titleX = (width - titleWidth) / 2;
    page.drawText(title, {
      x: titleX,
      y: height - 150,
      size: 52,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    const labels = [
      "Name",
      "Birth Name",
      "DOB",
      "Birth Time",
      "Birth Place",
      "District",
      "Gotra",
      "Height",
      "Blood Group",
      "Qualification",
      "Occupation",
      "Father Name",
      "Mother Name",
      "Mother Occupation",
      "Sister Name",
      "Sister Qualification",
      "Residence",
      "Permanent Address",
      "Mobile Number (Mother)",
      "Mobile Number (Mama)",
    ];

    const maxLabelWidth = Math.max(...labels.map((label) => fontBold.widthOfTextAtSize(label, 32)));

    let yPos = height - 250;
    const lineHeight = 62;
    const wrappedLineHeight = 40;
    const valueMaxWidth = 1550 - (150 + maxLabelWidth + 20);

    function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
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
    }

    const drawField = (label: string, value: string) => {
      page.drawText("•", {
        x: 100,
        y: yPos,
        size: 32,
        font,
        color: rgb(0, 0, 0),
      });

      page.drawText(label, {
        x: 150,
        y: yPos,
        size: 32,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      const colonX = 150 + maxLabelWidth;
      page.drawText(" :", {
        x: colonX,
        y: yPos,
        size: 32,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      const valueX = colonX + 20;
      const lines = wrapText(value || "-", valueMaxWidth, font, 32);

      page.drawText(lines[0], {
        x: valueX,
        y: yPos,
        size: 32,
        font,
        color: rgb(0, 0, 0),
      });

      for (let i = 1; i < lines.length; i++) {
        yPos -= wrappedLineHeight;
        page.drawText(lines[i], {
          x: valueX,
          y: yPos,
          size: 32,
          font,
          color: rgb(0, 0, 0),
        });
      }

      yPos -= lineHeight - wrappedLineHeight * (lines.length - 1);
    };

    drawField("Name", formData.name || "-");
    drawField("Birth Name", formData.birthName || "-");
    drawField("DOB", formData.dob || "-");
    drawField("Birth Time", formData.birthTime || "-");
    drawField("Birth Place", formData.birthPlace || "-");
    drawField("District", formData.district || "-");
    drawField("Gotra", formData.gotra || "-");
    drawField("Height", formData.height || "-");
    drawField("Blood Group", formData.bloodGroup || "-");
    drawField("Qualification", formData.qualification || "-");
    drawField("Occupation", formData.occupation || "-");
    drawField("Father Name", formData.fatherName || "-");
    drawField("Mother Name", formData.motherName || "-");
    drawField("Mother Occupation", formData.motherOccupation || "-");
    drawField("Sister Name", formData.sisterName || "-");
    drawField("Sister Qualification", formData.sisterQualification || "-");
    drawField("Residence", formData.residence || "-");
    drawField("Permanent Address", formData.permanentAddress || "-");
    drawField("Mobile Number (Mother)", formData.mobileMother || "-");
    drawField("Mobile Number (Mama)", formData.mobileMama || "-");

    if (imageBase64) {
      const imageBytes = Uint8Array.from(
        atob(imageBase64.split(",")[1]),
        (c) => c.charCodeAt(0)
      );

      let embeddedImage;
      if (imageBase64.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (imageBase64.startsWith("data:image/png")) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported image format");
      }

      const imgDims = embeddedImage.scale(0.75);
      page.drawImage(embeddedImage, {
        x: 1600,
        y: 400,
        width: imgDims.width,
        height: imgDims.height,
      });
    }

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
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFImage } from "pdf-lib";

export async function POST(req: Request) {
  const { formData, image } = await req.json();

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const page = pdfDoc.addPage([2400, 1800]);

    // Title
    const title = "BIO DATA : " + (formData.name || "N/A");
    const titleWidth = font.widthOfTextAtSize(title, 80);
    const titleX = (2400 - titleWidth) / 2;
    page.drawText(title, {
      x: titleX,
      y: 1650,
      size: 80,
      font,
      color: rgb(0, 0, 0),
    });

    // Fields
    let y = 1500;
    const fields: [string, string][] = [
      ["Name", formData.name || "N/A"],
      ["Birth Name", formData.birthName || "N/A"],
      ["DOB", formData.dob || "N/A"],
      ["Birth time", formData.birthTime || "N/A"],
      ["Birth Place", formData.birthPlace || "N/A"],
      ["District", formData.district || "N/A"],
      ["Gotra", formData.gotra || "N/A"],
      ["Height", formData.height || "N/A"],
      ["Blood Group", formData.bloodGroup || "N/A"],
      ["Qualification", formData.qualification || "N/A"],
      ["Occupation", formData.occupation || "N/A"],
      ["Father Name", formData.fatherName || "N/A"],
      ["Mother Name", formData.motherName || "N/A"],
      ["Mother Occupation", formData.motherOccupation || "N/A"],
      ["Sister Name", formData.sisterName || "N/A"],
      ["Sister Qualification", formData.sisterQualification || "N/A"],
      ["Residence", formData.residence || "N/A"],
      ["Permanent Address", formData.permanentAddress || "N/A"],
      ["Mobile Number (Mother)", formData.mobileMother || "N/A"],
      ["Mobile Number (Mama)", formData.mobileMama || "N/A"],
    ];

    const textMargin = 100;
    const fontSize = 48;

    let maxKeyWidth = 0;
    fields.forEach(([key]) => {
      const keyWidth = font.widthOfTextAtSize(key, fontSize);
      if (keyWidth > maxKeyWidth) maxKeyWidth = keyWidth;
    });

    fields.forEach(([key, value]) => {
      const keyWidth = font.widthOfTextAtSize(key, fontSize);
      const keyX = textMargin + (maxKeyWidth - keyWidth);

      page.drawText("•", {
        x: textMargin - 50,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText(key, {
        x: keyX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText(":", {
        x: textMargin + maxKeyWidth + 10,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText(value, {
        x: textMargin + maxKeyWidth + 30,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      y -= 70;
    });

    // Photo
    if (image) {
      try {
        const base64Data = image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
          c.charCodeAt(0)
        );

        let img: PDFImage;
        if (image.startsWith("data:image/png")) {
          img = await pdfDoc.embedPng(imageBytes);
        } else {
          img = await pdfDoc.embedJpg(imageBytes);
        }

        const boxX = 1400;
        const boxWidth = 800;
        const boxHeight = 1200;

        const widthRatio = boxWidth / img.width;
        const heightRatio = boxHeight / img.height;
        const scale = Math.min(widthRatio, heightRatio, 1);

        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;

        const xOffset = (boxWidth - drawWidth) / 2;
        const yOffset = (boxHeight - drawHeight) / 2;

        const boxY = (1800 - boxHeight) / 2;

        page.drawImage(img, {
          x: boxX + xOffset,
          y: boxY + yOffset,
          width: drawWidth,
          height: drawHeight,
        });
      } catch (err) {
        console.error("Image error:", err);
      }
    }

    // ✅ Return PDF as Buffer (works on Netlify)
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
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
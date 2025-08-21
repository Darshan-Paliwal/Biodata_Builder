// app/api/generate-pdf/route.ts
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFImage } from "pdf-lib";

export async function POST(req: Request) {
  const { formData, image } = await req.json();
  console.log("Received data:", JSON.stringify({ formData, image: image ? "present" : "absent" }).substring(0, 100) + "...");

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman); // Standard font

    const page = pdfDoc.addPage([2400, 1800]); // Landscape page

    // Centered Title
    const title = "BIO DATA : " + (formData.name || "N/A");
    const titleWidth = font.widthOfTextAtSize(title, 80); // Measure title
    const titleX = (2400 - titleWidth) / 2; // Center title
    page.drawText(title, { x: titleX, y: 1650, size: 80, font, color: rgb(0, 0, 0) });

    // Form data with aligned colons
    let y = 1500;
    const fields = [
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

    const textMargin = 100; // Margin
    const fontSize = 48;

    let maxKeyWidth = 0;
    fields.forEach(([key]) => {
      const keyWidth = font.widthOfTextAtSize(key, fontSize);
      if (keyWidth > maxKeyWidth) maxKeyWidth = keyWidth;
    });

    fields.forEach(([key, value]) => {
  const keyWidth = font.widthOfTextAtSize(key, fontSize);
  const keyX = textMargin + (maxKeyWidth - keyWidth); // Align keys
  page.drawText("•", textMargin - 50, y, { font, size: fontSize, color: rgb(0, 0, 0) }); // Bullet with options object
  page.drawText(key, keyX, y, { font, size: fontSize, color: rgb(0, 0, 0) }); // Key with options
  page.drawText(":", textMargin + maxKeyWidth + 10, y, { font, size: fontSize, color: rgb(0, 0, 0) }); // Colon with options
  page.drawText(value, textMargin + maxKeyWidth + 30, y, { font, size: fontSize, color: rgb(0, 0, 0) }); // Value with options
  y -= 70;
});

    // Image handling
    if (image) {
      try {
        const base64Data = image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        let img: PDFImage;
        if (image.startsWith("data:image/png")) {
          img = await pdfDoc.embedPng(imageBytes);
        } else {
          img = await pdfDoc.embedJpg(imageBytes);
        }

        const naturalWidth = img.width;
        const naturalHeight = img.height;
        console.log("Image dimensions:", { naturalWidth, naturalHeight });

        const boxX = 1400;
        const boxWidth = 800;
        const boxHeight = 1200;

        const widthRatio = boxWidth / naturalWidth;
        const heightRatio = boxHeight / naturalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);
        console.log("Scale:", scale);

        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;
        console.log("Draw dimensions:", { drawWidth, drawHeight });

        const xOffset = (boxWidth - drawWidth) / 2;
        const yOffset = (boxHeight - drawHeight) / 2;
        console.log("Offsets:", { xOffset, yOffset });

        const boxY = (1800 - boxHeight) / 2;

        page.drawImage(img, {
          x: boxX + xOffset,
          y: boxY + yOffset,
          width: drawWidth,
          height: drawHeight,
          opacity: 1,
        });
      } catch (err) {
        console.error("Image error:", err);
      }
    }

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    console.log("PDF size:", pdfBytes.length);
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
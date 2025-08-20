// app/api/generate-pdf/route.ts
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFImage } from "pdf-lib";

export async function POST(req: Request) {
  const { formData, image } = await req.json();
  console.log("Received data:", JSON.stringify({ formData, image: image ? "present" : "absent" }).substring(0, 100) + "...");

  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman); // Standard font for text

    // Add a page (landscape, 2400x1800px)
    const page = pdfDoc.addPage([2400, 1800]);

    // Centered Title
    const title = "BIO DATA : " + (formData.name || "N/A");
    const titleWidth = font.widthOfTextAtSize(title, 80); // Measure title width
    const pageWidth = 2400;
    const titleX = (pageWidth - titleWidth) / 2; // Center title
    page.drawText(title, {
      x: titleX,
      y: 1650,
      size: 80,
      font,
      color: rgb(0, 0, 0),
    });

    // Add form data with bullet points and aligned colons
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

    const textMargin = 100; // Margin for spacing
    const fontSize = 48;

    // Calculate maximum key width for colon alignment
    let maxKeyWidth = 0;
    fields.forEach(([key]) => {
      const keyWidth = font.widthOfTextAtSize(key, fontSize);
      if (keyWidth > maxKeyWidth) maxKeyWidth = keyWidth;
    });

    fields.forEach(([key, value]) => {
      const keyWidth = font.widthOfTextAtSize(key, fontSize);
      const keyX = textMargin + (maxKeyWidth - keyWidth); // Right-align keys
      page.drawText("•", textMargin - 50, y, { font, size: fontSize, color: rgb(0, 0, 0) }); // Bullet
      page.drawText(key, keyX, y, { font, size: fontSize, color: rgb(0, 0, 0) });
      page.drawText(":", textMargin + maxKeyWidth + 10, y, { font, size: fontSize, color: rgb(0, 0, 0) }); // Fixed colon
      page.drawText(value, textMargin + maxKeyWidth + 30, y, { font, size: fontSize, color: rgb(0, 0, 0) });
      y -= 70;
    });

    // Add Image with centered placement
    if (image) {
      try {
        // Convert base64 to Uint8Array
        const base64Data = image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        // Embed image based on type
        let img: PDFImage;
        if (image.startsWith("data:image/png")) {
          img = await pdfDoc.embedPng(imageBytes);
        } else {
          img = await pdfDoc.embedJpg(imageBytes);
        }

        // Get original dimensions
        const naturalWidth = img.width;
        const naturalHeight = img.height;
        console.log("Original image dimensions:", { naturalWidth, naturalHeight });

        // Box dimensions on the right
        const boxX = 1400;
        const boxWidth = 800;
        const boxHeight = 1200;

        // Calculate scale to fit without upscaling
        const widthRatio = boxWidth / naturalWidth;
        const heightRatio = boxHeight / naturalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);
        console.log("Scale factor:", scale);

        // Apply scale for display
        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;
        console.log("Display dimensions:", { drawWidth, drawHeight });

        // Center within box
        const xOffset = (boxWidth - drawWidth) / 2;
        const yOffset = (boxHeight - drawHeight) / 2;
        console.log("Offsets:", { xOffset, yOffset });

        // Vertically center box on page
        const pageHeight = 1800;
        const boxY = (pageHeight - boxHeight) / 2;

        // Draw image
        page.drawImage(img, {
          x: boxX + xOffset,
          y: boxY + yOffset,
          width: drawWidth,
          height: drawHeight,
          opacity: 1,
        });
      } catch (err) {
        console.error("Error adding image:", err);
      }
    }

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    console.log("PDF generated successfully, size:", pdfBytes.length);
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error) {
    console.error("Error in PDF generation:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
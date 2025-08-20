import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFImage } from "pdf-lib";

export async function POST(req: Request) {
  const { formData, image } = await req.json();
  console.log("Received data:", JSON.stringify({ formData, image: image ? "present" : "absent" }).substring(0, 100) + "...");

  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add a page (landscape, 2400x1800px)
    const page = pdfDoc.addPage([2400, 1800]);

    // Centered Title
    const title = "BIO DATA : " + (formData.name || "N/A");
    const titleWidth = font.widthOfTextAtSize(title, 80);
    const pageWidth = 2400;
    const titleX = (pageWidth - titleWidth) / 2; // Center the title
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

    const textMargin = 100; // Margin as per previous update
    // Find the maximum width of field names to align colons
    const maxLabelWidth = Math.max(...fields.map(([key]) => font.widthOfTextAtSize(key, 48)));
    const colonX = textMargin + maxLabelWidth + 10; // Position after the widest label, with a small gap

    fields.forEach(([key, value]) => {
      page.drawText("•", textMargin, y, { font, size: 48, color: rgb(0, 0, 0) });
      page.drawText(key, textMargin, y, { font, size: 48, color: rgb(0, 0, 0) });
      page.drawText(":", colonX, y, { font, size: 48, color: rgb(0, 0, 0) }); // Align colon vertically
      page.drawText(value, colonX + font.widthOfTextAtSize(":", 48) + 10, y, { font, size: 48, color: rgb(0, 0, 0) }); // Value after colon
      y -= 70;
    });

    // Add Image (if provided) with centered placement in 800x1200 box
    if (image) {
      try {
        // Convert base64 to Uint8Array
        const base64Data = image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        // Embed the image
        let img: PDFImage;
        if (image.startsWith("data:image/png")) {
          img = await pdfDoc.embedPng(imageBytes);
        } else {
          img = await pdfDoc.embedJpg(imageBytes); // Default to JPEG
        }

        // Get original dimensions
        const naturalWidth = img.width;
        const naturalHeight = img.height;
        console.log("Original image dimensions:", { naturalWidth, naturalHeight });

        // Reserved box dimensions on the right
        const boxX = 1600;
        const boxY = 300;
        const boxWidth = 800;
        const boxHeight = 1200;

        // Calculate scale factor to fit within box without upscaling
        const widthRatio = boxWidth / naturalWidth;
        const heightRatio = boxHeight / naturalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1); // No upscaling
        console.log("Scale factor:", scale);

        // Apply scale to get display dimensions
        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;
        console.log("Display dimensions:", { drawWidth, drawHeight });

        // Calculate centering offsets within the box
        const xOffset = (boxWidth - drawWidth) / 2;
        const yOffset = (boxHeight - drawHeight) / 2;
        console.log("Offsets:", { xOffset, yOffset });

        // Ensure vertical centering within the box
        const verticalCenterY = boxY + yOffset;

        // Draw image centered in the box
        page.drawImage(img, {
          x: boxX + xOffset,
          y: verticalCenterY,
          width: drawWidth,
          height: drawHeight,
          opacity: 1,
        });
      } catch (err) {
        console.error("Error adding image:", err);
      }
    }

    // Serialize the PDFDocument to bytes
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
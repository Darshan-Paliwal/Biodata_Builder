import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  const { formData, image } = await req.json();
  console.log("Received data:", JSON.stringify({ formData, image: image ? "present" : "absent" }).substring(0, 100) + "...");

  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add a page (landscape, 2400x1800px)
    const page = pdfDoc.addPage([2400, 1800]);

    // Title
    page.drawText("BIO DATA : " + (formData.name || "N/A"), {
      x: 100,
      y: 1650,
      size: 80,
      font,
      color: rgb(0, 0, 0),
    });

    // Add form data with bullet points
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

    fields.forEach(([key, value]) => {
      page.drawText("•", 50, y, { font, size: 48, color: rgb(0, 0, 0) });
      page.drawText(`${key}: ${value}`, 100, y, { font, size: 48, color: rgb(0, 0, 0) });
      y -= 70;
    });

    // Add Image (if provided) with centered placement in 700x1000 box
    if (image) {
      try {
        // Convert base64 to Uint8Array
        const base64Data = image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const img = await pdfDoc.embedJpg(imageBytes); // Use embedPng if PNG

        // Determine image type and embed accordingly
        let imgInstance = img;
        if (image.startsWith("data:image/png")) {
          imgInstance = await pdfDoc.embedPng(imageBytes);
        }

        const { width: naturalWidth, height: naturalHeight } = imgInstance.scale(1);
        console.log("Image dimensions:", { naturalWidth, naturalHeight });

        // Reserved box dimensions on the right
        const boxX = 1600;
        const boxY = 300;
        const boxWidth = 800;
        const boxHeight = 1300;

        // Calculate scale factor to fit within box proportionally
        const widthRatio = boxWidth / naturalWidth;
        const heightRatio = boxHeight / naturalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1); // No upscaling

        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;

        // Calculate centering offsets within the box
        const xOffset = (boxWidth - drawWidth) / 2;
        const yOffset = (boxHeight - drawHeight) / 2;

        // Draw image centered in the box
        page.drawImage(imgInstance, {
          x: boxX + xOffset,
          y: boxY + yOffset,
          width: drawWidth,
          height: drawHeight,
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
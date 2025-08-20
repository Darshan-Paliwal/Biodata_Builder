import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import sizeOf from "image-size";

export async function POST(req: Request) {
  const { formData, image } = await req.json();
  console.log("Received data:", JSON.stringify({ formData, image: image ? "present" : "absent" }).substring(0, 100) + "...");

  try {
    // Initialize jsPDF with landscape and high resolution
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [2400, 1800],
    });

    // Title
    doc.setFontSize(80);
    doc.text("BIO DATA : " + (formData.name || "N/A"), 100, 150);

    // Add form data with bullet points
    doc.setFontSize(48);
    let y = 300;
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
      doc.text("•", 50, y); // Bullet point
      doc.text(`${key}: ${value}`, 100, y);
      y += 70;
    });

    // Add Image (if provided) with proportional scaling
    if (image) {
      try {
        let imgType = "JPEG";
        if (image.startsWith("data:image/png")) imgType = "PNG";

        const imageBytes = Buffer.from(image.split(",")[1], "base64");
        const dimensions = sizeOf(imageBytes);
        const naturalWidth = dimensions.width;
        const naturalHeight = dimensions.height;
        console.log("Image dimensions:", { naturalWidth, naturalHeight });

        // Reserved box dimensions
        const boxX = 1600;
        const boxY = 300;
        const maxWidth = 700;
        const maxHeight = 1000;

        // Calculate scale factor to fit within max dimensions proportionally
        const widthRatio = maxWidth / naturalWidth;
        const heightRatio = maxHeight / naturalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1); // Ensure scale <= 1 to avoid upscaling

        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;

        // Add image with calculated dimensions and no compression
        doc.addImage(image, imgType, boxX, boxY, drawWidth, drawHeight, null, 'NONE');
      } catch (err) {
        console.error("Error adding image:", err);
      }
    }

    // Generate and send PDF
    const pdfData = doc.output("arraybuffer");
    const pdfBlob = new Blob([pdfData], { type: "application/pdf" });

    console.log("PDF generated successfully, size:", pdfData.byteLength);
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
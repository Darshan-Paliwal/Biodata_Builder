import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  const data = await req.json();
  console.log("Received data:", JSON.stringify(data).substring(0, 100) + "...");

  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add a blank page to the document
    const page = pdfDoc.addPage([550, 750]);
    const { width, height } = page.getSize();
    const fontSize = 12;

    // Add title
    page.drawText("Biodata", {
      x: width / 2 - 50,
      y: height - 50,
      size: 25,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    let yPosition = height - 100;

    // Add text fields
    const fields = [
      `Full Name: ${data.name || "N/A"}`,
      `Date of Birth: ${data.dob || "N/A"}`,
      `Place of Birth: ${data.placeOfBirth || "N/A"}`,
      `Height: ${data.height || "N/A"}`,
      `Education: ${data.education || "N/A"}`,
      `Occupation: ${data.occupation || "N/A"}`,
      `Father's Name: ${data.fatherName || "N/A"}`,
      `Mother's Name: ${data.motherName || "N/A"}`,
      `Siblings: ${data.siblings || "N/A"}`,
      `Contact Number: ${data.contact || "N/A"}`,
      `Address: ${data.address || "N/A"}`,
    ];

    fields.forEach((field) => {
      page.drawText(field, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
        maxWidth: width - 100,
      });
      yPosition -= 20; // Adjust spacing
    });

    // Add photo if provided
    if (data.photo) {
      try {
        const imageBytes = Buffer.from(data.photo.split(",")[1], "base64");
        const image = await pdfDoc.embedJpg(imageBytes); // Assume JPG; change to embedPng if PNG
        page.drawImage(image, {
          x: width - 150,
          y: height - 150,
          width: 100,
          height: 100,
        });
      } catch (imageError) {
        console.error("Image processing error:", imageError);
      }
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Convert to Blob
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
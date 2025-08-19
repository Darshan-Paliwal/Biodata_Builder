import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  const data = await req.json();

  const doc = new PDFDocument({ margin: 50 });

  // Collect PDF data into a buffer
  const buffers: Buffer[] = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });

  // Add content to PDF
  doc.fontSize(25).text("Biodata", { align: "center" });
  doc.moveDown();

  if (data.photo) {
    try {
      const imageBuffer = Buffer.from(data.photo.split(",")[1], "base64");
      doc.image(imageBuffer, 400, 50, { fit: [100, 100], align: "right" });
    } catch (error) {
      console.error("Error adding image:", error);
    }
  }

  doc.fontSize(12).text(`Full Name: ${data.name || "N/A"}`);
  doc.text(`Date of Birth: ${data.dob || "N/A"}`);
  doc.text(`Place of Birth: ${data.placeOfBirth || "N/A"}`);
  doc.text(`Height: ${data.height || "N/A"}`);
  doc.text(`Education: ${data.education || "N/A"}`);
  doc.text(`Occupation: ${data.occupation || "N/A"}`);
  doc.text(`Father's Name: ${data.fatherName || "N/A"}`);
  doc.text(`Mother's Name: ${data.motherName || "N/A"}`);
  doc.text(`Siblings: ${data.siblings || "N/A"}`);
  doc.text(`Contact Number: ${data.contact || "N/A"}`);
  doc.text(`Address: ${data.address || "N/A"}`);

  doc.end();

  const pdfBuffer = await pdfPromise;

  // Convert Buffer to Blob for NextResponse
  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  return new NextResponse(pdfBlob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=biodata.pdf",
    },
  });
}
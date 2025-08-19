import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  const data = await req.json();
  console.log("Received data:", JSON.stringify(data).substring(0, 100) + "..."); // Log truncated data

  try {
    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF data into a buffer
    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", (error) => reject(error));
    });

    // Add content to PDF (photo disabled temporarily)
    doc.fontSize(25).text("Biodata", { align: "center" });
    doc.moveDown();
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

    // Convert Buffer to Uint8Array for Blob
    const pdfArray = new Uint8Array(pdfBuffer);
    const pdfBlob = new Blob([pdfArray], { type: "application/pdf" });

    console.log("PDF generated successfully, size:", pdfBuffer.length);
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
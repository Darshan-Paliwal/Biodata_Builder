import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  const data = await req.json();
  console.log("Received data:", JSON.stringify(data).substring(0, 100) + "...");

  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add a page
    const page = pdfDoc.addPage([400, 600]);

    // Add minimal text
    page.drawText(`Name: ${data.name || "N/A"}`, {
      x: 50,
      y: 500,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDFDocument to bytes
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
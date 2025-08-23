import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = doc.pipe(new (require("stream").PassThrough)());

    // Title
    doc.fontSize(18).text("Biodata", { align: "center" });
    doc.moveDown(2);

    // Helper for aligned fields
    const drawField = (label: string, value: string | undefined) => {
      if (!value) return;
      const labelWidth = 150; // fixed width for labels
      doc.fontSize(12).text(label, { continued: true, width: labelWidth });
      doc.text(": " + value);
    };

    // Fields
    drawField("Full Name", body.fullName);
    drawField("Date of Birth", body.dob);
    drawField("Gender", body.gender);
    drawField("Address", body.address);
    drawField("Education", body.education);
    drawField("Occupation", body.occupation);
    drawField("Mobile Number", body.mobileNumber);
    if (body.mobileRelation) {
      drawField("Relation (Mobile)", body.mobileRelation);
    }

    doc.moveDown(1);

    // Add photo (if provided)
    if (body.image) {
      try {
        const imageBuffer = Buffer.from(body.image, "base64");
        const x = doc.page.width - 200;
        const y = 100;
        doc.image(imageBuffer, x, y, { fit: [120, 120], align: "right" });
      } catch (e) {
        console.error("Image error:", e);
      }
    }

    doc.end();

    const pdfBuffer = await getStream.buffer(stream);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      dob,
      pob,
      timeOfBirth,
      height,
      weight,
      complexion,
      religion,
      caste,
      gotra,
      education,
      occupation,
      income,
      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      address,
      mobileNumber,
      relationWithPerson,
      hobbies,
      expectations,
      imageUrl,
    } = body;

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = doc.pipe(getStream.buffer());

    // Title
    doc.fontSize(20).text("Biodata", { align: "center" });
    doc.moveDown(1.5);

    // === Layout constants ===
    const labelX = 70;
    const colonX = 220; // <-- fixed colon column
    const valueX = 240; // <-- value starts right after colon
    let y = 120;
    const lineGap = 25;

    // Helper to align fields horizontally (label : value)
    const drawRow = (label: string, value?: string) => {
      if (!value) return;
      doc.fontSize(12).text(label, labelX, y);
      doc.text(":", colonX, y); // all colons aligned here
      doc.text(value, valueX, y);
      y += lineGap;
    };

    // Personal Details
    drawRow("Full Name", fullName);
    drawRow("Date of Birth", dob);
    drawRow("Place of Birth", pob);
    drawRow("Time of Birth", timeOfBirth);
    drawRow("Height", height);
    drawRow("Weight", weight);
    drawRow("Complexion", complexion);
    drawRow("Religion", religion);
    drawRow("Caste", caste);
    drawRow("Gotra", gotra);
    drawRow("Education", education);
    drawRow("Occupation", occupation);
    drawRow("Income", income);

    // Family
    drawRow("Father's Name", fatherName);
    drawRow("Father's Occupation", fatherOccupation);
    drawRow("Mother's Name", motherName);
    drawRow("Mother's Occupation", motherOccupation);

    // Address + Mobile
    drawRow("Address", address);
    drawRow("Mobile Number", mobileNumber);
    drawRow("Relation with Mobile Number Person", relationWithPerson);

    // Extras
    drawRow("Hobbies", hobbies);
    drawRow("Expectations", expectations);

    // === Image on right side ===
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const buffer = Buffer.from(await res.arrayBuffer());

        const imgX = 380;
        const imgY = 120;
        const imgW = 150;
        const imgH = 180;

        doc.image(buffer, imgX, imgY, { width: imgW, height: imgH });
      } catch (e) {
        console.error("Image load failed:", e);
      }
    }

    doc.end();
    const pdfBuffer = await stream;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
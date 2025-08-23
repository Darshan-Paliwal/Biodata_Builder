// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { height: pageHeight } = page.getSize();
    let y = pageHeight - 80;
    const fontSize = 12;

    // === Title ===
    page.drawText("Biodata", {
      x: 250,
      y,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 50;

    // === Layout constants ===
    const labelX = 60;
    const colonX = 200; // colons aligned vertically
    const valueX = 220; // values start after colon
    const lineGap = 25;

    const drawRow = (label: string, value?: string) => {
      if (!value) return;
      page.drawText(label, { x: labelX, y, size: fontSize, font });
      page.drawText(":", { x: colonX, y, size: fontSize, font });
      page.drawText(value, { x: valueX, y, size: fontSize, font });
      y -= lineGap;
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

    // === Add Image (right side) ===
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const buffer = await res.arrayBuffer();
        const img = await pdfDoc.embedJpg(buffer).catch(async () => {
          return await pdfDoc.embedPng(buffer);
        });

        const imgDims = img.scale(0.3);
        const imgX = 380;
        const imgY = pageHeight - 300;

        page.drawImage(img, {
          x: imgX,
          y: imgY,
          width: imgDims.width,
          height: imgDims.height,
        });
      } catch (err) {
        console.error("Image load failed:", err);
      }
    }

    // Finalize PDF
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
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
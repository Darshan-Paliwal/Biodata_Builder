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
    } = body;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { height: pageHeight } = page.getSize();
    const fontSize = 12;
    let y = pageHeight - 60;

    // Title
    page.drawText("Biodata", {
      x: 230,
      y,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 40;

    // Helper function → align colons vertically
    const drawAlignedText = (label: string, value: string | undefined) => {
      if (!value) return;
      const labelX = 60;
      const colonX = 200;
      const valueX = 210;

      page.drawText(label, { x: labelX, y, size: fontSize, font });
      page.drawText(":", { x: colonX, y, size: fontSize, font });
      page.drawText(value, { x: valueX, y, size: fontSize, font });

      y -= 25;
    };

    // Personal Details
    drawAlignedText("Full Name", fullName);
    drawAlignedText("Date of Birth", dob);
    drawAlignedText("Place of Birth", pob);
    drawAlignedText("Time of Birth", timeOfBirth);
    drawAlignedText("Height", height);
    drawAlignedText("Weight", weight);
    drawAlignedText("Complexion", complexion);
    drawAlignedText("Religion", religion);
    drawAlignedText("Caste", caste);
    drawAlignedText("Gotra", gotra);
    drawAlignedText("Education", education);
    drawAlignedText("Occupation", occupation);
    drawAlignedText("Income", income);

    // Family
    drawAlignedText("Father's Name", fatherName);
    drawAlignedText("Father's Occupation", fatherOccupation);
    drawAlignedText("Mother's Name", motherName);
    drawAlignedText("Mother's Occupation", motherOccupation);

    // Address + Mobile
    drawAlignedText("Address", address);
    drawAlignedText("Mobile Number", mobileNumber);
    drawAlignedText(
      "Relation with Mobile Number Person",
      relationWithPerson
    );

    // Extras
    drawAlignedText("Hobbies", hobbies);
    drawAlignedText("Expectations", expectations);

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes); // Fix for Netlify/Node

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
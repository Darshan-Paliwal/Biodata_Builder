import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body.formData || {};
    const imageBase64 = body.image || null;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Heading centered
    const title = `BIO DATA : ${formData.name?.toUpperCase() || "UNKNOWN"}`;
    const titleWidth = fontBold.widthOfTextAtSize(title, 22);
    const titleX = (width - titleWidth) / 2;
    page.drawText(title, {
      x: titleX,
      y: height - 60,
      size: 22,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Labels for alignment
    const labels = [
      "Name",
      "Birth Name",
      "DOB",
      "Birth Time",
      "Birth Place",
      "District",
      "Gotra",
      "Height",
      "Blood Group",
      "Qualification",
      "Occupation",
      "Father Name",
      "Mother Name",
      "Mother Occupation",
      "Sister Name",
      "Sister Qualification",
      "Residence",
      "Permanent Address",
      "Mobile Number (Mother)",
      "Mobile Number (Mama)",
    ];

    const maxLabelWidth = Math.max(...labels.map((label) => fontBold.widthOfTextAtSize(label, 12)));

    let yPos = height - 100;
    const lineHeight = 25;

    function drawField(label: string, value: string) {
      // Bullet
      page.drawText("•", {
        x: 40,
        y: yPos,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      // Label
      page.drawText(label, {
        x: 50,
        y: yPos,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Colon aligned
      const colonX = 50 + maxLabelWidth;
      page.drawText(" :", {
        x: colonX,
        y: yPos,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Value
      const valueX = colonX + 10;
      page.drawText(value || "-", {
        x: valueX,
        y: yPos,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      yPos -= lineHeight;
    }

    drawField("Name", formData.name);
    drawField("Birth Name", formData.birthName);
    drawField("DOB", formData.dob);
    drawField("Birth Time", formData.birthTime);
    drawField("Birth Place", formData.birthPlace);
    drawField("District", formData.district);
    drawField("Gotra", formData.gotra);
    drawField("Height", formData.height);
    drawField("Blood Group", formData.bloodGroup);
    drawField("Qualification", formData.qualification);
    drawField("Occupation", formData.occupation);
    drawField("Father Name", formData.fatherName);
    drawField("Mother Name", formData.motherName);
    drawField("Mother Occupation", formData.motherOccupation);
    drawField("Sister Name", formData.sisterName);
    drawField("Sister Qualification", formData.sisterQualification);
    drawField("Residence", formData.residence);
    drawField("Permanent Address", formData.permanentAddress);
    drawField("Mobile Number (Mother)", formData.mobileMother);
    drawField("Mobile Number (Mama)", formData.mobileMama);

    if (imageBase64) {
      const imageBytes = Uint8Array.from(
        atob(imageBase64.split(",")[1]),
        (c) => c.charCodeAt(0)
      );

      let embeddedImage;
      if (imageBase64.startsWith("data:image/jpeg")) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      }

      const imgDims = embeddedImage.scale(0.25);
      page.drawImage(embeddedImage, {
        x: 400,
        y: height - 250,
        width: imgDims.width,
        height: imgDims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = body.formData || {};
    const imageBase64 = body.image || null;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("Bio Data", {
      x: 50,
      y: height - 60,
      size: 22,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    let yPos = height - 100;
    const lineHeight = 25;

    function drawField(label: string, value: string) {
      const labelWidth = fontBold.widthOfTextAtSize(label + " :", 12);
      page.drawText(label + " :", {
        x: 50,
        y: yPos,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      page.drawText(value || "-", {
        x: 50 + labelWidth + 10,
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
    drawField("Mobile (Mother)", formData.mobileMother);
    drawField("Mobile (Mama)", formData.mobileMama);

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
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      dob,
      email,
      mobileNumber,
      relation,
      address,
      education,
      occupation,
      fatherName,
      motherName,
      height,
      weight,
      bloodGroup,
      maritalStatus,
      hobbies,
      photo,
    } = body;

    // ✅ Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([2400, 1800]); // fixed layout
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { height: pageHeight } = page.getSize();
    let y = pageHeight - 150;
    const lineHeight = 60;

    // ✅ Helper function (arrow function instead of function decl)
    const drawText = (label: string, value: string, isHeader = false) => {
      const fontSize = isHeader ? 48 : 36;
      const labelX = 200;
      const colonX = 750; // keep colons aligned
      const valueX = 800;

      page.drawText(label, { x: labelX, y, size: fontSize, font, color: rgb(0, 0, 0) });
      page.drawText(":", { x: colonX, y, size: fontSize, font, color: rgb(0, 0, 0) });
      page.drawText(value || "-", { x: valueX, y, size: fontSize, font, color: rgb(0, 0, 0) });

      y -= lineHeight;
    };

    // ✅ Add biodata fields
    drawText("Name", name, true);
    drawText("Date of Birth", dob);
    drawText("Email", email);
    drawText("Mobile Number", mobileNumber);
    drawText("Relation", relation);
    drawText("Address", address);
    drawText("Education", education);
    drawText("Occupation", occupation);
    drawText("Father's Name", fatherName);
    drawText("Mother's Name", motherName);
    drawText("Height", height);
    drawText("Weight", weight);
    drawText("Blood Group", bloodGroup);
    drawText("Marital Status", maritalStatus);
    drawText("Hobbies", hobbies);

    // ✅ Embed photo if available
    if (photo) {
      try {
        const imgBytes = Uint8Array.from(atob(photo), (c) => c.charCodeAt(0));
        const img = await pdfDoc.embedJpg(imgBytes);
        const dims = img.scale(0.5);

        page.drawImage(img, {
          x: 1800,
          y: pageHeight - 700,
          width: dims.width,
          height: dims.height,
        });
      } catch (err) {
        console.error("Image embedding failed:", err);
      }
    }

    // ✅ Save PDF
    const pdfBytes = await pdfDoc.save();

    // ✅ Wrap in Buffer for NextResponse
    return new NextResponse(Buffer.from(pdfBytes), {
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
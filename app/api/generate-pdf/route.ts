import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Create a new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    const { name, email, phone, address, skills, experience, education } = body;

    let y = 800;

    // Title
    page.drawText("Biodata", {
      x: 50,
      y,
      size: 24,
      color: rgb(0, 0.53, 0.71),
    });
    y -= 40;

    // Name
    if (name) {
      page.drawText(`Name: ${name}`, { x: 50, y, size: 14 });
      y -= 20;
    }

    // Email
    if (email) {
      page.drawText(`Email: ${email}`, { x: 50, y, size: 14 });
      y -= 20;
    }

    // Phone
    if (phone) {
      page.drawText(`Phone: ${phone}`, { x: 50, y, size: 14 });
      y -= 20;
    }

    // Address
    if (address) {
      page.drawText(`Address: ${address}`, { x: 50, y, size: 14 });
      y -= 30;
    }

    // Skills
    if (skills && skills.length > 0) {
      page.drawText("Skills:", { x: 50, y, size: 16, color: rgb(0, 0, 0.8) });
      y -= 20;
      skills.forEach((skill: string) => {
        page.drawText(`- ${skill}`, { x: 70, y, size: 12 });
        y -= 15;
      });
      y -= 20;
    }

    // Experience
    if (experience && experience.length > 0) {
      page.drawText("Experience:", {
        x: 50,
        y,
        size: 16,
        color: rgb(0, 0, 0.8),
      });
      y -= 20;
      experience.forEach((exp: { role: string; company: string; years: string }) => {
        page.drawText(`${exp.role} at ${exp.company} (${exp.years})`, {
          x: 70,
          y,
          size: 12,
        });
        y -= 15;
      });
      y -= 20;
    }

    // Education
    if (education && education.length > 0) {
      page.drawText("Education:", {
        x: 50,
        y,
        size: 16,
        color: rgb(0, 0, 0.8),
      });
      y -= 20;
      education.forEach((edu: { degree: string; institution: string; year: string }) => {
        page.drawText(`${edu.degree}, ${edu.institution} (${edu.year})`, {
          x: 70,
          y,
          size: 12,
        });
        y -= 15;
      });
    }

    // Footer
    page.drawText("Created by Darshan Paliwal", {
      x: 50,
      y: 50,
      size: 12,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText("darshanpaliwal.netlify.app", {
      x: 50,
      y: 35,
      size: 12,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // ✅ FIX: wrap Uint8Array in Buffer (valid BodyInit)
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
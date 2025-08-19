"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    placeOfBirth: "",
    height: "",
    education: "",
    occupation: "",
    fatherName: "",
    motherName: "",
    siblings: "",
    contact: "",
    address: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = { ...formData, photo };

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "biodata.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to generate PDF");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Biodata PDF Generator</h1>
      <form onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Date of Birth:</label>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

        <label>Place of Birth:</label>
        <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} />

        <label>Height (e.g., 5'6"):</label>
        <input type="text" name="height" value={formData.height} onChange={handleChange} />

        <label>Education:</label>
        <input type="text" name="education" value={formData.education} onChange={handleChange} />

        <label>Occupation:</label>
        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />

        <label>Father's Name:</label>
        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />

        <label>Mother's Name:</label>
        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />

        <label>Siblings (e.g., 1 brother, 2 sisters):</label>
        <input type="text" name="siblings" value={formData.siblings} onChange={handleChange} />

        <label>Contact Number:</label>
        <input type="tel" name="contact" value={formData.contact} onChange={handleChange} />

        <label>Address:</label>
        <textarea name="address" value={formData.address} onChange={handleChange} />

        <label>Photo:</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </form>
    </main>
  );
}
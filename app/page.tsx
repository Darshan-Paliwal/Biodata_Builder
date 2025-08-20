"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    birthName: "",
    dob: "",
    birthTime: "",
    birthPlace: "",
    district: "",
    gotra: "",
    height: "",
    bloodGroup: "",
    qualification: "",
    occupation: "",
    fatherName: "",
    motherName: "",
    motherOccupation: "",
    sisterName: "",
    sisterQualification: "",
    residence: "",
    permanentAddress: "",
    mobileMother: "",
    mobileMama: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, image }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biodata.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to generate PDF");
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
        <label>Birth Name:</label>
        <input type="text" name="birthName" value={formData.birthName} onChange={handleChange} />
        <label>DOB:</label>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
        <label>Birth Time:</label>
        <input type="text" name="birthTime" value={formData.birthTime} onChange={handleChange} />
        <label>Birth Place:</label>
        <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
        <label>District:</label>
        <input type="text" name="district" value={formData.district} onChange={handleChange} />
        <label>Gotra:</label>
        <input type="text" name="gotra" value={formData.gotra} onChange={handleChange} />
        <label>Height:</label>
        <input type="text" name="height" value={formData.height} onChange={handleChange} />
        <label>Blood Group:</label>
        <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
        <label>Qualification:</label>
        <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} />
        <label>Occupation:</label>
        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
        <label>Father Name:</label>
        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
        <label>Mother Name:</label>
        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
        <label>Mother Occupation:</label>
        <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} />
        <label>Sister Name:</label>
        <input type="text" name="sisterName" value={formData.sisterName} onChange={handleChange} />
        <label>Sister Qualification:</label>
        <input type="text" name="sisterQualification" value={formData.sisterQualification} onChange={handleChange} />
        <label>Residence:</label>
        <input type="text" name="residence" value={formData.residence} onChange={handleChange} />
        <label>Permanent Address:</label>
        <input type="text" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} />
        <label>Mobile Number (Mother):</label>
        <input type="tel" name="mobileMother" value={formData.mobileMother} onChange={handleChange} />
        <label>Mobile Number (Mama):</label>
        <input type="tel" name="mobileMama" value={formData.mobileMama} onChange={handleChange} />
        <label>Photo:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </form>
    </main>
  );
}
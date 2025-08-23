"use client";

import { useState } from "react";

type ExtraField = { id: string; label: string; value: string };

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
    siblingType: "Sister",
    siblingName: "",
    residence: "",
    permanentAddress: "",
    mobileRelation1: "",
    mobileNumber1: "",
    mobileRelation2: "",
    mobileNumber2: "",
    image: null as File | null,
    imageBase64: "" as string | null,
  });

  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiblingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imageBase64: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Extra Fields handlers ---
  const addExtraField = () => {
    setExtraFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", value: "" },
    ]);
  };

  const updateExtraField = (
    id: string,
    key: "label" | "value",
    value: string
  ) => {
    setExtraFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const removeExtraField = (id: string) => {
    setExtraFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = {
      formData: {
        ...formData,
        image: formData.imageBase64 || null,
        extraFields: extraFields
          .filter((f) => f.label.trim() || f.value.trim())
          .map((f) => ({ label: f.label.trim(), value: f.value.trim() })),
      },
    };

    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      body: JSON.stringify(formDataToSend),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biodata.pdf";
      a.click();
    } else {
      console.error("Failed to generate PDF:", await response.text());
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Bio Data Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>
        <br />
        <label>
          Birth Name:
          <input type="text" name="birthName" value={formData.birthName} onChange={handleChange} />
        </label>
        <br />
        <label>
          DOB:
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
        </label>
        <br />
        <label>
          Birth Time:
          <input type="time" name="birthTime" value={formData.birthTime} onChange={handleChange} />
        </label>
        <br />
        <label>
          Birth Place:
          <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
        </label>
        <br />
        <label>
          District:
          <input type="text" name="district" value={formData.district} onChange={handleChange} />
        </label>
        <br />
        <label>
          Gotra:
          <input type="text" name="gotra" value={formData.gotra} onChange={handleChange} />
        </label>
        <br />
        <label>
          Height:
          <input type="text" name="height" value={formData.height} onChange={handleChange} />
        </label>
        <br />
        <label>
          Blood Group:
          <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
        </label>
        <br />
        <label>
          Qualification:
          <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} />
        </label>
        <br />
        <label>
          Occupation:
          <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
        </label>
        <br />
        <label>
          Father Name:
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
        </label>
        <br />
        <label>
          Mother Name:
          <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
        </label>
        <br />
        <label>
          Mother Occupation:
          <input
            type="text"
            name="motherOccupation"
            value={formData.motherOccupation}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Sibling:
          <select name="siblingType" value={formData.siblingType} onChange={handleSiblingChange}>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
          </select>
          <input
            type="text"
            name="siblingName"
            value={formData.siblingName}
            onChange={handleSiblingChange}
            placeholder="Enter name"
          />
        </label>
        <br />
        <label>
          Residence:
          <input type="text" name="residence" value={formData.residence} onChange={handleChange} />
        </label>
        <br />
        <label>
          Permanent Address:
          <input
            type="text"
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
          />
        </label>
        <br />

        {/* Mobile Numbers */}
        <h3>Mobile Numbers</h3>
        <label>
          Relation:
          <input
            type="text"
            name="mobileRelation1"
            value={formData.mobileRelation1}
            onChange={handleChange}
            placeholder="e.g. Mother"
          />
        </label>
        <br />
        <label>
          Mobile Number:
          <input
            type="tel"
            name="mobileNumber1"
            value={formData.mobileNumber1}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </label>
        <br />
        <label>
          Relation:
          <input
            type="text"
            name="mobileRelation2"
            value={formData.mobileRelation2}
            onChange={handleChange}
            placeholder="e.g. Mama"
          />
        </label>
        <br />
        <label>
          Mobile Number:
          <input
            type="tel"
            name="mobileNumber2"
            value={formData.mobileNumber2}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </label>
        <br />

        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        <br />

        {/* --- Add More Details --- */}
        <h3>Add More Details</h3>
        <div>
          <button type="button" onClick={addExtraField}>
            ➕ Add Field
          </button>
        </div>
        <br />
        {extraFields.map((f) => (
          <div key={f.id} style={{ marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Label (e.g. Hobbies)"
              value={f.label}
              onChange={(e) => updateExtraField(f.id, "label", e.target.value)}
              style={{ width: "45%", marginRight: "8px" }}
            />
            <input
              type="text"
              placeholder="Value (e.g. Reading, Music)"
              value={f.value}
              onChange={(e) => updateExtraField(f.id, "value", e.target.value)}
              style={{ width: "45%", marginRight: "8px" }}
            />
            <button type="button" onClick={() => removeExtraField(f.id)}>
              ❌
            </button>
          </div>
        ))}

        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </form>

      {/* Footer */}
<footer
  style={{
    marginTop: "2rem",
    width: "100%",
    background: "linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)", // Indigo → Purple → Pink
    color: "white",
    textAlign: "center",
    padding: "1rem 0",
    fontSize: "0.9rem",
  }}
>
  Created by <span style={{ fontWeight: 600 }}>Darshan Paliwal</span> |{" "}
  <a
    href="https://darshanpaliwal.netlify.app"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "white",
      textDecoration: "underline",
      marginLeft: "4px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    }}
  >
    Portfolio <span>↗</span>
  </a>
</footer>
    </div>
  );
}
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    birthName: '',
    dob: '',
    birthTime: '',
    birthPlace: '',
    district: '',
    gotra: '',
    height: '',
    bloodGroup: '',
    qualification: '',
    occupation: '',
    fatherName: '',
    motherName: '',
    motherOccupation: '',
    siblingType: 'Sister', // Default value for dropdown
    siblingName: '', // Text field for sibling name
    residence: '',
    permanentAddress: '',
    mobileMother: '',
    mobileMama: '',
    image: null as File | null, // For image upload
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiblingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'image' && formData.image) {
        formDataToSend.append(key, formData.image);
      } else {
        formDataToSend.append(key, formData[key] as string);
      }
    }

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      body: JSON.stringify({ formData }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'biodata.pdf';
      a.click();
    } else {
      console.error('Failed to generate PDF');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Bio Data Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Birth Name:
          <input
            type="text"
            name="birthName"
            value={formData.birthName}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          DOB:
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Birth Time:
          <input
            type="time"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Birth Place:
          <input
            type="text"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          District:
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Gotra:
          <input
            type="text"
            name="gotra"
            value={formData.gotra}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Height:
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Blood Group:
          <input
            type="text"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Qualification:
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Occupation:
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Father Name:
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Mother Name:
          <input
            type="text"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Mother Occupation:
          <input
            type="text"
            name="motherOccupation"
            value={formData.motherOccupation}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Sibling:
          <select
            name="siblingType"
            value={formData.siblingType}
            onChange={handleSiblingChange}
            required
          >
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
          </select>
          <input
            type="text"
            name="siblingName"
            value={formData.siblingName}
            onChange={handleSiblingChange}
            placeholder="Enter name"
            required
          />
        </label>
        <br />
        <label>
          Residence:
          <input
            type="text"
            name="residence"
            value={formData.residence}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Permanent Address:
          <input
            type="text"
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Mobile Number (Mother):
          <input
            type="tel"
            name="mobileMother"
            value={formData.mobileMother}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Mobile Number (Mama):
          <input
            type="tel"
            name="mobileMama"
            value={formData.mobileMama}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Upload Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </label>
        <br />
        <button type="submit">Generate PDF</button>
      </form>
    </div>
  );
}
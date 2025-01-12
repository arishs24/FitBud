import React, { useState } from "react";
import { db } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore";

const AddPatient = () => {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "patients", patientId);
      await setDoc(docRef, {
        name,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseFloat(weight),
        sex,
        medical_conditions: medicalConditions.split(",").map((condition) => condition.trim()),
        created_at: new Date().toISOString(),
      }, { merge: true });

      alert("Patient data saved successfully!");
      setPatientId("");
      setName("");
      setAge("");
      setHeight("");
      setWeight("");
      setSex("");
      setMedicalConditions("");
    } catch (error) {
      console.error("Error saving patient data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add/Update Patient</h1>
      <input
        type="text"
        placeholder="Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Height (cm)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        required
      />
      <select
        value={sex}
        onChange={(e) => setSex(e.target.value)}
        required
      >
        <option value="">Select Sex</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <textarea
        placeholder="Medical Conditions (comma-separated)"
        value={medicalConditions}
        onChange={(e) => setMedicalConditions(e.target.value)}
      />
      <button type="submit">Save Patient</button>
    </form>
  );
};

export default AddPatient;

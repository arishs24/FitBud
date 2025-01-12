import React, { useState } from "react";
import { db } from "../firebase"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore";

const AddPatient = () => {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "patients", patientId);
      await setDoc(docRef, {
        name,
        age: parseInt(age),
        medical_conditions: medicalConditions.split(",").map((condition) => condition.trim()),
        created_at: new Date().toISOString(),
      }, { merge: true });

      alert("Patient data saved successfully!");
      setPatientId("");
      setName("");
      setAge("");
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

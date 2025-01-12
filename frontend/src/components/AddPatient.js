import React, { useState } from "react";
import { db } from "../firebase"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore";
import '../pages/login.css'

const AddPatient = () => {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "patients", patientId);
      await setDoc(
        docRef,
        {
          name,
          age: parseInt(age),
          medical_conditions: medicalConditions.split(",").map((condition) => condition.trim()),
          created_at: new Date().toISOString(),
        },
        { merge: true }
      );

      alert("Patient data saved successfully!");
      setPatientId("");
      setName("");
      setAge("");
      setMedicalConditions("");
    } catch (error) {
      console.error("Error saving patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signInContainer">
      <div className="loginPage">
        <div className="item">
          <h2>Add or Update Patient</h2>
          <form onSubmit={handleSubmit}>
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
            <button disabled={loading}>{loading ? "Saving..." : "Save Patient"}</button>
          </form>
        </div>
        <div className="seperator"></div>
        <div className="item">
          <h2>Instructions</h2>
          <p>Enter the patient's ID, name, age, and medical conditions. You can also update an existing patient's data by using their Patient ID.</p>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;

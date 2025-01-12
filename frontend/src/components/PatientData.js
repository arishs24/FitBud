import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom"; 

const PatientData = () => {
  const { patientId } = useParams(); 
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const docRef = doc(db, "patients", patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatientData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return <p>Loading patient data...</p>;
  }

  if (!patientData) {
    return <p>No data found for this patient.</p>;
  }

  return (
    <div>
      <h1>Patient Data</h1>
      <p><strong>Name:</strong> {patientData.name}</p>
      <p><strong>Age:</strong> {patientData.age}</p>
      <p><strong>Height:</strong> {patientData.height} cm</p>
      <p><strong>Weight:</strong> {patientData.weight} kg</p>
      <p><strong>Sex:</strong> {patientData.sex}</p>
      <p><strong>Medical Conditions:</strong> {patientData.medical_conditions?.join(", ")}</p>
    </div>
  );
};

export default PatientData;

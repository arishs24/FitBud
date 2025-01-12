import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import AddPatient from "./components/AddPatient"; 
import PatientData from "./components/PatientData"; 
import Connection from "./pages/Connection";

function App() {
  return (
    <Router>
      <div>
        <h1>Patient Management System</h1>
        <nav>
          <a href="/">Home</a> | <a href="/add-patient">Add Patient</a> | <a href="/view-patient/patient123">View Patient</a>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/view-patient/:patientId" element={<PatientData />} />
          <Route path="/updates" element={<Connection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

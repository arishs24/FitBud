import React, { useState } from "react";

const PatientData = () => {
  const [condition, setCondition] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchConditionInfo = async () => {
    setLoading(true);
    try {
      const websocket = new WebSocket("ws://localhost:8765");

      websocket.onopen = () => {
        console.log("WebSocket connection established");
        websocket.send(condition);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResponse(data);
        websocket.close();
        setLoading(false);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setLoading(false);
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCondition(e.target.value);
  };

  return (
    <div>
      <h1>Patient Data</h1>
      <div>
        <input
          type="text"
          value={condition}
          onChange={handleInputChange}
          placeholder="Enter medical condition"
        />
        <button onClick={fetchConditionInfo}>Fetch Info</button>
      </div>
      {loading && <p>Loading...</p>}
      {response && (
        <div>
          {response.status === "success" ? (
            <>
              <h2>Condition: {response.condition}</h2>
              <p>{response.information}</p>
            </>
          ) : (
            <p>{response.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientData;

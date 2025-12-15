import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OCRScanner from "../components/OCRScanner"; // <--- IMPORT OCR COMPONENT

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    time: "",
    prescriptionImage: null,
  });
  const navigate = useNavigate();

  const isTakenToday = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString).toDateString() === new Date().toDateString();
  };

  const fetchMedicines = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      const res = await axios.get("http://localhost:5000/api/medicines", {
        headers: { "x-auth-token": token },
      });
      setMedicines(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [navigate]);

  const markAsTaken = useCallback(
    async (id) => {
      const token = localStorage.getItem("token");
      try {
        await axios.put(
          `http://localhost:5000/api/medicines/${id}/taken`,
          {},
          { headers: { "x-auth-token": token } }
        );
        fetchMedicines();
      } catch (err) {
        alert("Error");
      }
    },
    [fetchMedicines]
  );

  const deleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/medicines/${id}`, {
        headers: { "x-auth-token": token },
      });
      fetchMedicines();
    } catch (err) {
      alert("Error deleting medicine");
    }
  };

  // OCR Handler: Updates form state when text is scanned
  const handleOCRData = (data) => {
    setForm((prev) => ({ ...prev, name: data.name, dosage: data.dosage }));
    alert(`Scanned successfully!\nName: ${data.name}\nDosage: ${data.dosage}`);
  };

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Alarm Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      medicines.forEach((med) => {
        if (med.time === currentTime && !isTakenToday(med.lastTaken)) {
          if (window.confirm(`🔔 Time to take ${med.name}!\nDid you take it?`))
            markAsTaken(med._id);
        }
      });
    }, 12000); // Check every 12 seconds
    return () => clearInterval(interval);
  }, [medicines, markAsTaken]);

  const addMedicine = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("dosage", form.dosage);
    formData.append("time", form.time);
    if (form.prescriptionImage)
      formData.append("prescriptionImage", form.prescriptionImage);

    try {
      await axios.post("http://localhost:5000/api/medicines", formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      });
      window.location.reload();
    } catch (err) {
      alert("Error adding medicine");
    }
  };

  return (
    <div className="container">
      <h2 className="section-title">Your Daily Medicines</h2>

      <div className="grid-container">
        {medicines.map((med) => (
          <div
            key={med._id}
            className={`card ${
              isTakenToday(med.lastTaken) ? "taken" : "pending"
            }`}
          >
            {/* Header: Name and Time */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#333" }}>{med.name}</h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  {med.dosage}
                </p>
              </div>
              <span style={{ fontWeight: "bold", color: "#0061f2" }}>
                ⏰ {med.time}
              </span>
            </div>

            {/* Image Preview */}
            {med.prescriptionImage && (
              <a
                href={`http://localhost:5000/${med.prescriptionImage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`http://localhost:5000/${med.prescriptionImage}`}
                  alt="Prescription"
                  className="preview"
                />
              </a>
            )}

            {/* Status Bar */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {isTakenToday(med.lastTaken) ? (
                <span className="status-badge status-success">
                  ✅ Taken Today
                </span>
              ) : (
                <span className="status-badge status-warning">⏳ Pending</span>
              )}

              {!isTakenToday(med.lastTaken) && (
                <button
                  onClick={() => markAsTaken(med._id)}
                  style={{
                    width: "auto",
                    padding: "5px 15px",
                    fontSize: "0.8rem",
                    marginTop: 0,
                  }}
                >
                  Mark Taken
                </button>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => deleteMedicine(med._id)}
              style={{
                background: "#dc3545",
                marginTop: "15px",
                fontSize: "0.8rem",
                padding: "8px",
              }}
            >
              Delete Medicine
            </button>
          </div>
        ))}
      </div>

      {/* Form Section */}
      <div className="form-box" style={{ margin: "0 auto", maxWidth: "600px" }}>
        <h3>➕ Add New Reminder</h3>
        [cite_start]{/* OCR Component [cite: 46] */}
        <OCRScanner onScanComplete={handleOCRData} />
        <hr
          style={{ margin: "20px 0", border: "0", borderTop: "1px solid #eee" }}
        />
        <form onSubmit={addMedicine} style={{ textAlign: "left" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <input
              placeholder="Medicine Name"
              value={form.name} // Bound to state for OCR auto-fill
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Dosage"
              value={form.dosage} // Bound to state for OCR auto-fill
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              required
            />
          </div>
          <input
            placeholder="Time (e.g. 09:15 PM)"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <label
            style={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              marginTop: "10px",
              display: "block",
            }}
          >
            Upload Prescription (Optional):
          </label>
          <input
            type="file"
            onChange={(e) =>
              setForm({ ...form, prescriptionImage: e.target.files[0] })
            }
            style={{ background: "white" }}
          />
          <button type="submit">Save Reminder</button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

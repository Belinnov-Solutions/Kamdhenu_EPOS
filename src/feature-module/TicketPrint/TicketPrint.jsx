import React, { useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js";
import axios from "axios";

const TicketPrint = () => {
  const canvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //  const apiBase = getConfig().API_BASE_URL;
const apiBase = window.__APP_CONFIG__?.API_BASE_URL || "";

  const fetchTicketData = async () => {
    try {
      const BASE_URL =
        apiBase || "http://localhost:5000/"; // Fallback URL
      console.log("Fetching from:", `${BASE_URL}api/v1/Order/GetTickets`);

      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}api/v1/Order/GetTickets`);
      console.log("API Response:", response.data);

      if (response.data.data && response.data.data.length > 0) {
        setTicketData(response.data.data[0]);
      } else {
        setError("No ticket data available");
      }
    } catch (err) {
      const errorMsg = err.response
        ? `Server responded with ${err.response.status}`
        : err.message;
      setError(`Failed to fetch ticket data: ${errorMsg}`);
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketData && canvasRef.current) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "code128",
          text: ticketData.ticketNo || "TEMP-TICKET",
          scale: 3,
          height: 10,
          includetext: true,
        });
        setCanvasWidth(canvasRef.current.width);
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
    }
  }, [ticketData]);

  // Initial render check
  console.log("Current state:", { loading, error, ticketData });

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Ticket Printing System</h2>

      <button
        onClick={fetchTicketData}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "Loading..." : "Generate Ticket"}
      </button>

      {error && (
        <div style={{ color: "red", margin: "20px 0" }}>
          {error}
          <button onClick={fetchTicketData} style={{ marginLeft: "10px" }}>
            Retry
          </button>
        </div>
      )}

      {ticketData ? (
        <div
          className="ticket-print"
          style={{ margin: "0 auto", maxWidth: "600px" }}
        >
          <h3>{ticketData.deviceType || "Device"} Service Ticket</h3>
          <p>
            <strong>Ticket No:</strong> {ticketData.ticketNo || "N/A"}
          </p>
          <p>
            <strong>Order No:</strong> {ticketData.orderNumber || "N/A"}
          </p>
          <p>
            <strong>Customer:</strong> {ticketData.customerName || "N/A"}
          </p>
          <p>
            <strong>Device:</strong> {ticketData.brand || ""}{" "}
            {ticketData.model || "N/A"}
          </p>
          <p>
            <strong>Task:</strong> {ticketData.taskTypeName || "N/A"}
          </p>
          <p>
            <strong>Service Charge:</strong> ${ticketData.serviceCharge || "0"}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {ticketData.dueDate
              ? new Date(ticketData.dueDate).toLocaleDateString()
              : "N/A"}
          </p>

          {ticketData.notes?.length > 0 ? (
            <div style={{ marginTop: "10px", textAlign: "left" }}>
              <strong>Notes:</strong>
              <ul>
                {ticketData.notes.map((note, index) => (
                  <li key={index}>
                    <strong>{note.type}:</strong> {note.notes}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No notes available</p>
          )}

          <div style={{ margin: "20px auto", textAlign: "center" }}>
            <canvas ref={canvasRef} />
            {ticketData.ticketNo && (
              <div
                style={{
                  width: canvasWidth,
                  margin: "10px auto 0",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  letterSpacing: "2px",
                  fontWeight: "bold",
                }}
              >
                {ticketData.ticketNo}
              </div>
            )}
          </div>
        </div>
      ) : (
        !loading &&
        !error && (
          <div style={{ margin: "20px 0", color: "#666" }}>
            Click &quot;Generate Ticket&quot; to load ticket data
          </div>
        )
      )}
    </div>
  );
};

export default TicketPrint;

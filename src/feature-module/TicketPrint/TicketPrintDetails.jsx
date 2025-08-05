import React from "react";
import TicketLabel from "./TicketPrint";

const TicketPrintDetails = () => {
  const ticketData = {
    heading: "Service Ticket",
    IMEI: "123456789012345",
    SNo: "SN123456",
    userName: "John Doe",
    id: "U001",
    phoneNumber: "9876543210",
  };
  return (
    <div>
      <TicketLabel {...ticketData} />
    </div>
  );
};
export default TicketPrintDetails;

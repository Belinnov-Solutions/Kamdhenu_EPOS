import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../img/imagewithbasebath";
import { Edit, Eye, Trash2 } from "feather-icons-react/build/IconComponents";
import TooltipIcons from "../../common/tooltip-content/tooltipIcons";
import { Tooltip } from "antd";
import Select from "react-select";
import PropTypes from "prop-types"; // Add this import
import { useDispatch } from "react-redux";
import { customerAdded } from "../../redux/customerSlice"; // Adjust the import path as necessary
import { useSelector } from "react-redux";
import { selectCartItems } from "../../redux/accessoriesSlice"; // Add this import
// import { selectSubCategories } from "../../redux/accessoriesSlice";
import "bootstrap/dist/js/bootstrap.bundle.min";
import axios from "axios";
import { selectCartItems as selectPartItems } from "../../redux/partSlice";
import { selectExtras, selectReportedIssues } from "../../redux/checklistSlice";
import "./posModals.css";
import { repairAdded } from "../../redux/repairSlice";
const PosModals = ({ onCustomerCreated }) => {
  // Add this function at the top of your PosModals component, before the component definition
  const resolveItemName = (item) => {
    return (
      item?.name ||
      item?.productName ||
      item?.subCategoryName ||
      item?.product?.productName ||
      item?.product?.subCategoryName ||
      item?.productname ||
      item?.product?.productname ||
      item?.taskTypeName ||
      item?.sku ||
      "Unnamed Product"
    );
  };
  const dispatch = useDispatch();
  const extras = useSelector(selectExtras);
  const reportedIssues = useSelector(selectReportedIssues);
  const repairItems = useSelector((state) => state.repair?.repairItems || []);
  const repairData = useSelector((state) => state.repair);
  const partItems = useSelector(selectPartItems);
  const ticketData = useSelector((state) => state.ticket);
  const selectedServices = useSelector(
    (state) => state.serviceType.selectedServices || []
  );
  const orderItems = useSelector(selectCartItems);
  const [apiResponse, setApiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    customerId,
    customerName,
    // phone,
    // email,
    // address,
    // city,
    // state,
    // country,
    // zipcode,
  } = useSelector((state) => state.customer);
  const {
    phone: userPhone,
    email: userEmail,
    name: storeName,
    address: userAddress,
  } = useSelector((state) => state.user);
  const { userId, storeId } = useSelector((state) => state.user);
  // const cartItems = useSelector(selectCartItems);
  const hasProducts = orderItems.length > 0 || partItems.length > 0;
  const productType = hasProducts ? "Product" : "Service";
  //   ...orderItems.map((item) => ({
  //     productId: item.id,
  //     subcategoryid: item.subcategoryId,
  //     productName: resolveItemName(item), // Use the same naming function
  //     brandName: item.brand || "Generic",
  //     partDescription: item.description || "No description",
  //     deviceType: "Mobile",
  //     deviceModel: item.model || "Generic",
  //     serialNumber: item.serialNumber || "",
  //     quantity: item.quantity,
  //     price: item.price,
  //     productType: "Product",
  //   })),
  //   ...partItems.map((item) => ({
  //     productId: item.id,
  //     subcategoryid: item.subcategoryId,
  //     productName: resolveItemName(item), // Use the same naming function
  //     brandName: item.brand || "Generic",
  //     partDescription: item.description || "No description",
  //     deviceType: "Mobile",
  //     deviceModel: item.model || "Generic",
  //     serialNumber: item.serialNumber || "",
  //     quantity: item.quantity,
  //     price: item.price,
  //     productType: "Product",
  //   })),
  // ];
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  // const subCategories = useSelector(selectSubCategories);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // In PosModals component

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const BASE_URL = process.env.REACT_APP_BASEURL;

      const response = await fetch(`${BASE_URL}api/v1/User/AddCustomer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipcode: formData.zipcode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }
      const responseData = await response.json();
      const customerData = responseData.data.data;

      // const data = await response.json();
      setSubmitSuccess(true);

      onCustomerCreated(formData);

      dispatch(
        customerAdded({
          customerId: customerData.customerId,
          customerName: customerData.customerName,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          country: customerData.country,
          zipcode: customerData.zipcode,
          createdAt: customerData.createdAt,
          delind: customerData.delind,
        })
      );

      onCustomerCreated(customerData);
      // Close modal after successful submission
      setTimeout(() => {
        document.getElementById("create").querySelector(".close").click();
        // Reset form
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zipcode: "",
        });
        setSubmitSuccess(false);
      }, 1500);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  // end create customer

  // Modify the handlePaymentSelection to do something with the selection
  const handlePaymentSelection = async (method) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setSelectedPayment(method);
    try {
      // Get the first repair item (or use empty object as fallback)
      const firstRepairItem = repairItems[0] || {};

      const prepareChecklistResponses = () => {
        const responses = [];

        // Add extras checklist items
        if (extras.length > 0) {
          const latestExtras = extras[extras.length - 1];

          // Regular checklist items
          latestExtras.selectedExtras.forEach((item) => {
            responses.push({
              checklistId: item.id,
              value: item.isChecked,
              repairInspection: "Extras",
            });
          });

          // Handle notes
          if (latestExtras.notes) {
            responses.push({
              checklistId: latestExtras.notesItemId,
              value: true, // Set to true when there's text
              repairInspection: latestExtras.notes, // Put the actual note text here
            });
          } else {
            responses.push({
              checklistId: latestExtras.notesItemId,
              value: false, // Set to false when empty
              repairInspection: "ExtrasNotes", // Default text when empty
            });
          }
        }

        // Add reported issues checklist items
        if (reportedIssues.length > 0) {
          const latestIssues = reportedIssues[reportedIssues.length - 1];

          // Regular checklist items
          latestIssues.selectedIssues.forEach((item) => {
            responses.push({
              checklistId: item.id,
              value: item.isChecked,
              repairInspection: "ReportedIssues",
            });
          });

          // Handle other issue
          if (latestIssues.otherIssue) {
            responses.push({
              checklistId: latestIssues.otherIssueItemId,
              value: true, // Set to true when there's text
              repairInspection: latestIssues.otherIssue, // Put the actual text here
            });
          } else {
            responses.push({
              checklistId: latestIssues.otherIssueItemId,
              value: false, // Set to false when empty
              repairInspection: "OtherIssue", // Default text when empty
            });
          }

          // Handle notes
          if (latestIssues.notes) {
            responses.push({
              checklistId: latestIssues.notesItemId,
              value: true, // Set to true when there's text
              repairInspection: latestIssues.notes, // Put the actual note text here
            });
          } else {
            responses.push({
              checklistId: latestIssues.notesItemId,
              value: false, // Set to false when empty
              repairInspection: "ReportedIssuesNotes", // Default text when empty
            });
          }
        }

        return responses;
      };

      const parts = [
        ...orderItems.map((item) => ({
          productId: item.id,
          subcategoryid: item.subcategoryId,
          productName: resolveItemName(item),
          brandName: item.brand || "Generic",
          partDescription: item.description || "No description",
          deviceType: "Mobile",
          deviceModel: item.model || "Generic",
          serialNumber: item.serialNumber || "",
          quantity: item.quantity,
          price: item.price,
          productType: "Product",
        })),
        ...partItems.map((item) => ({
          productId: item.id,
          subcategoryid: item.subcategoryId,
          productName: resolveItemName(item),
          brandName: item.brand || "Generic",
          partDescription: item.description || "No description",
          deviceType: "Mobile",
          deviceModel: item.model || "Generic",
          serialNumber: item.serialNumber || "",
          quantity: item.quantity,
          price: item.price,
          productType: "Product",
        })),
      ];

      const payload = {
        repairOrderId: "00000000-0000-0000-0000-000000000000",
        orderNumber: "",
        storeId: storeId,
        customerId: customerId,
        userId: userId,
        issueDescription:
          firstRepairItem.customerNotes || repairData?.customerNotes,
        repairStatus: "New",
        paymentMethod: method,
        receivedDate: firstRepairItem.dateCreated
          ? new Date(firstRepairItem.dateCreated).toISOString()
          : new Date().toISOString(),
        expectedDeliveryDate: firstRepairItem.dueDate
          ? new Date(firstRepairItem.dueDate).toISOString()
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isFinalSubmit: hasProducts ? true : false,
        // isFinalSubmit: false,
        productType: productType,
        tickets: {
          ticketNo: "",
          deviceType: firstRepairItem.deviceType,
          ipAddress: "",
          brand: firstRepairItem.brand,
          model: firstRepairItem.model,
          deviceColour: firstRepairItem.deviceColour,
          imeiNumber: firstRepairItem.imeiNumber,
          serialNumber: firstRepairItem.serialNumber,
          passcode: firstRepairItem.passcode,
          serviceCharge: firstRepairItem.serviceCharge,
          repairCost: firstRepairItem.repairCost,
          technicianId: firstRepairItem.technicianId,
          technicianName: firstRepairItem.technicianName || "", // Add technician name here

          dueDate: firstRepairItem.dueDate
            ? new Date(firstRepairItem.dueDate).toISOString()
            : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "New",
          taskTypeId: firstRepairItem.taskTypeId,
          notes: [
            {
              id: "00000000-0000-0000-0000-000000000000",
              notes: firstRepairItem.internalNotes || "No internal notes",
              type: "Internal notes",
            },
            {
              id: "00000000-0000-0000-0000-000000000001",
              notes: firstRepairItem.customerNotes || "No customer notes",
              type: "Customer notes",
            },
          ],
        },
        parts: productType === "Product" ? parts : [],
        checklistResponses: {
          ticketId: "",
          orderId: "",
          responses: prepareChecklistResponses(),
        },
        totalAmount: calculateTotalPayable(),
      };

      // Make the API call
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/order/ConfirmOrder`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        dispatch(repairAdded(response.data));
        setApiResponse({
          message: response.data.message || "Order placed successfully!",
          orderNumber: response.data.orderNumber,
          error: false,
        });

        // Close the print-receipt modal first
        const printReceiptModal = document.getElementById("print-receipt");
        const modalInstance =
          window.bootstrap.Modal.getInstance(printReceiptModal);
        modalInstance.hide();

        // Then show the success modal
        const successModal = new window.bootstrap.Modal(
          document.getElementById("order-success-modal")
        );
        successModal.show();
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      setApiResponse({
        message: "Error placing order. Please try again.",
        orderNumber: null,
        error: true, // This is important to trigger the error styling
      });

      // Ensure print receipt modal is closed
      const printReceiptModal = document.getElementById("print-receipt");
      const printModalInstance =
        window.bootstrap.Modal.getInstance(printReceiptModal);
      if (printModalInstance) {
        printModalInstance.hide();
      }

      const successModal = new window.bootstrap.Modal(
        document.getElementById("order-success-modal")
      );
      successModal.show();
    } finally {
      setIsProcessing(false);
    }
  };

  // Then somewhere in your JSX, display the selected method if needed
  {
    selectedPayment && (
      <div className="selected-payment-method">Selected: {selectedPayment}</div>
    );
  }

  // Main receipt printing function
  // const handlePrintReceipt = () => {
  //   // Group items by subcategory
  //   const itemsBySubcategory = {};
  //   const allItems = [
  //     ...(ticketData.ticketItems || []),
  //     ...selectedServices,
  //     ...orderItems,
  //     ...partItems,
  //   ];

  //   allItems.forEach((item) => {
  //     const subcategoryId = item.subcategoryId || "uncategorized";
  //     const subcategoryName =
  //       subCategories.find((sub) => sub.id === item.subcategoryId)?.name ||
  //       "Uncategorized";

  //     if (!itemsBySubcategory[subcategoryId]) {
  //       itemsBySubcategory[subcategoryId] = {
  //         subcategoryName,
  //         items: [],
  //       };
  //     }
  //     itemsBySubcategory[subcategoryId].items.push(item);
  //   });

  //   // Print main receipt first, then all subcategory summaries automatically
  //   printMainReceipt(itemsBySubcategory)
  //     .then(() => {
  //       // Print all subcategory summaries sequentially without user interaction
  //       return printSubcategorySummaries(itemsBySubcategory);
  //     })
  //     .then(() => {
  //       // All printing is complete
  //       console.log("All receipts printed successfully");

  //       // Optionally close the modal after printing is done
  //       const modalEl = document.getElementById("order-success-modal");
  //       const modal = window.bootstrap.Modal.getInstance(modalEl);
  //       if (modal) {
  //         modal.hide();
  //       }

  //       // Refresh the page after a delay if needed
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 1000);
  //     })
  //     .catch((error) => {
  //       console.error("Error printing receipts:", error);
  //     });
  // };

  //   const printMainReceipt = (itemsBySubcategory) => {
  //     return new Promise((resolve) => {
  //       const iframe = createHiddenIframe();
  //       const content = `
  //         <html>
  //             <head>
  //                 <title>Receipt</title>
  //                 <style>
  //                     @page {
  //                         size: 80mm auto;
  //                         margin: 0;
  //                     }
  //                     body {
  //                         font-family: Arial, sans-serif;
  //                         width: 76mm;
  //                         margin: 0 auto;
  //                         padding: 2px;
  //                         font-size: 12px;
  //                         -webkit-print-color-adjust: exact;
  //                     }
  //                     .store-info {
  //                         text-align: center;
  //                         margin-bottom: 3px;
  //                     }
  //                     .store-name {
  //                         font-weight: bold;
  //                         text-transform: uppercase;
  //                         margin-bottom: 1px;
  //                         font-size: 13px;
  //                     }
  //                     .store-details {
  //                         margin: 1px 0;
  //                         font-size: 10px;
  //                     }
  //                     table {
  //                         width: 100%;
  //                         border-collapse: collapse;
  //                         font-size: 11px;
  //                     }
  //                     hr {
  //                         border: 0;
  //                         border-top: 1px dashed #000;
  //                         margin: 2px 0;
  //                     }
  //                     .text-right {
  //                         text-align: right;
  //                     }
  //                     .fw-bold {
  //                         font-weight: bold;
  //                     }
  //                     th, td {
  //                       padding: 1px 0;
  //                   }
  //                 </style>
  //             </head>
  //             <body>
  //                 <div class="store-info">
  //                     <div class="store-name">${
  //                       storeName || "DOMN/DOWN PIZZA STORE"
  //                     }</div>
  //                     <div class="store-details">${
  //                       userAddress || "PLACE: 978-8-7779-1-0"
  //                     }</div>
  //                     <div class="store-details">Phone: ${
  //                       userPhone || "80686677-6"
  //                     }</div>
  //                     <div class="store-details">Email: ${
  //                       userEmail || "admin@pizza@example.com"
  //                     }</div>
  //                 </div>
  //                 <hr>

  //                 <table style="width: 100%; font-size: 14px; margin-bottom: 4px;">
  //                     <tbody>
  //                         <tr>
  //                             <td style="padding: 1px 0;">
  //                                 <strong>Customer:</strong> ${
  //                                   customerName || "Walk in"
  //                                 }
  //                             </td>
  //                         </tr>
  //                         <tr>
  //                             <td style="padding: 1px 0;">
  //                                 <strong>Order #:</strong> ${
  //                                   apiResponse?.orderNumber || "OPD.354905023"
  //                                 }
  //                             </td>
  //                         </tr>
  //                         <tr>
  //                             <td style="padding: 1px 0;">
  //                                 <strong>Date:</strong> ${new Date().toLocaleDateString(
  //                                   "en-US",
  //                                   {
  //                                     month: "2-digit",
  //                                     day: "2-digit",
  //                                     year: "numeric",
  //                                   }
  //                                 )}
  //                             </td>
  //                         </tr>
  //                     </tbody>
  //                 </table>

  //                 <hr>

  //                 <table style="width: 100%; font-size: 14px; margin-bottom: 4px;">
  //                     <thead>
  //                         <tr>
  //                             <th style="text-align: left; padding: 2px 0; border-bottom: 1px dashed #000;">ITEM</th>
  //                             <th style="text-align: right; padding: 2px 0; border-bottom: 1px dashed #000;">PRICE</th>
  //                         </tr>
  //                     </thead>
  //                     <tbody>

  // ${Object.values(itemsBySubcategory)
  //   .map((categoryData) =>
  //     categoryData.items
  //       .map(
  //         (item) => `
  //         <tr>
  //             <td style="padding: 2px 0;">${
  //               item.quantity ? `${item.quantity} x ` : ""
  //             }${resolveItemName(item)}</td>
  //             <td style="text-align: right; padding: 2px 0;">₹${(
  //               item.price * (item.quantity || 1)
  //             ).toFixed(2)}</td>
  //         </tr>
  //     `
  //       )
  //       .join("")
  //   )
  //   .join("")}
  //                     </tbody>
  //                 </table>

  //                 <hr>

  //                 <table style="width: 100%; font-size: 14px; margin: 4px 0;">
  //                     <tbody>
  //                         <tr>
  //                             <td style="padding: 2px 0;">SUBTOTAL</td>
  //                             <td style="text-align: right; padding: 2px 0;">₹${calculateSubtotal()?.toFixed(
  //                               2
  //                             )}</td>
  //                         </tr>
  //                         <tr>
  //                             <td style="padding: 2px 0;">TAX (3%)</td>
  //                             <td style="text-align: right; padding: 2px 0;">₹${calculateTax()?.toFixed(
  //                               2
  //                             )}</td>
  //                         </tr>
  //                         <tr style="font-weight: bold;">
  //                             <td style="padding: 2px 0;">TOTAL</td>
  //                             <td style="text-align: right; padding: 2px 0;">₹${calculateTotalPayable()?.toFixed(
  //                               2
  //                             )}</td>
  //                         </tr>
  //                     </tbody>
  //                 </table>

  //                 <hr>

  //                 <div style="text-align: center; font-size: 14px;">
  //                     <div style="font-weight: bold; margin-bottom: 2px;">CUSTOMER COPY</div>
  //                     <div>THANK YOU FOR VISITING</div>
  //                     <div style="font-weight: bold;">${
  //                       storeName || "DOMN/DOWN PIZZA STORE"
  //                     }</div>
  //                 </div>

  //                 <script>
  //                     setTimeout(() => {
  //                         window.print();
  //                         setTimeout(() => {
  //                             window.parent.postMessage('mainReceiptPrinted', '*');
  //                             window.close();
  //                         }, 100);
  //                     }, 200);
  //                 </script>
  //             </body>
  //         </html>
  //         `;

  //       document.body.appendChild(iframe);
  //       const iframeDoc = iframe.contentDocument;
  //       iframeDoc.open();
  //       iframeDoc.write(content);
  //       iframeDoc.close();

  //       const messageHandler = (e) => {
  //         if (e.data === "mainReceiptPrinted") {
  //           window.removeEventListener("message", messageHandler);
  //           document.body.removeChild(iframe);
  //           resolve();
  //         }
  //       };
  //       window.addEventListener("message", messageHandler);
  //     });
  //   };

  //   const printSubcategorySummaries = (itemsBySubcategory) => {
  //     return new Promise((resolve) => {
  //       const subcategories = Object.values(itemsBySubcategory);
  //       let currentIndex = 0;

  //       const printNextSubcategory = () => {
  //         if (currentIndex >= subcategories.length) {
  //           resolve(); // All subcategories printed
  //           return;
  //         }

  //         const subcategoryData = subcategories[currentIndex];
  //         const iframe = createHiddenIframe();

  //         const content = `
  //         <html>
  //           <head>
  //             <title>${subcategoryData.subcategoryName} Summary</title>
  //             <style>
  //               @page {
  //                 size: 80mm auto;
  //                 margin: 0;
  //               }
  //               body {
  //                 font-family: Arial, sans-serif;
  //                 width: 76mm;
  //                 margin: 0 auto;
  //                 padding: 5px;
  //                 font-size: 11px;
  //                 -webkit-print-color-adjust: exact;
  //               }
  //               .subcategory-header {
  //                 font-weight: bold;
  //                 text-transform: uppercase;
  //                 margin: 8px 0 4px 0;
  //                 background-color: #f5f5f5;
  //                 padding: 2px;
  //                 text-align: center;
  //               }
  //               .store-name {
  //                 text-align: center;
  //                 font-weight: bold;
  //                 margin-bottom: 4px;
  //               }
  //             </style>
  //           </head>
  //           <body>
  //             <table style="width: 100%; font-size: 14px; margin-bottom: 4px;">
  //               <tbody>
  //                 <tr>
  //                   <td style="padding: 1px 0;">
  //                     <strong>Customer:</strong> ${customerName || "Walk in"}
  //                   </td>
  //                 </tr>
  //                 <tr>
  //                   <td style="padding: 1px 0;">
  //                     <strong>Order #:</strong> ${
  //                       apiResponse?.orderNumber || "OPD.354905023"
  //                     }
  //                   </td>
  //                 </tr>
  //                 <tr>
  //                   <td style="padding: 1px 0;">
  //                     <strong>Date:</strong> ${new Date().toLocaleDateString(
  //                       "en-US",
  //                       {
  //                         month: "2-digit",
  //                         day: "2-digit",
  //                         year: "numeric",
  //                       }
  //                     )}
  //                   </td>
  //                 </tr>
  //               </tbody>
  //             </table>

  //             <hr>

  //             <div class="subcategory-header">${
  //               subcategoryData.subcategoryName
  //             }</div>

  //             <table style="width: 100%; font-size: 14px; margin-bottom: 4px;">
  //               <thead>
  //                 <tr>
  //                   <th style="text-align: left; padding: 2px 0; border-bottom: 1px dashed #000;">ITEM</th>
  //                   <th style="text-align: right; padding: 2px 0; border-bottom: 1px dashed #000;">QTY</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  // ${subcategoryData.items
  //   .map(
  //     (item) => `
  //     <tr>
  //       <td style="padding: 2px 0;">${resolveItemName(item)}</td>
  //       <td style="text-align: right; padding: 2px 0;">${
  //         item.quantity || "1"
  //       }</td>
  //     </tr>
  //   `
  //   )
  //   .join("")}
  //               </tbody>
  //             </table>

  //             <hr>

  //             <div style="text-align: center; font-size: 14px; margin-top: 10px;">
  //               <div>${subcategoryData.subcategoryName} ITEMS: ${
  //           subcategoryData.items.length
  //         }</div>
  //               <div style="font-weight: bold;">${
  //                 storeName || "DOMN/DOWN PIZZA STORE"
  //               }</div>
  //             </div>

  //             <script>
  //               // Automatically trigger printing without user interaction
  //               setTimeout(() => {
  //                 window.print();
  //                 setTimeout(() => {
  //                   // Signal that this subcategory is done printing
  //                   window.parent.postMessage('subcategoryPrinted', '*');
  //                 }, 500);
  //               }, 200);
  //             </script>
  //           </body>
  //         </html>
  //       `;

  //         document.body.appendChild(iframe);
  //         const iframeDoc = iframe.contentDocument;
  //         iframeDoc.open();
  //         iframeDoc.write(content);
  //         iframeDoc.close();

  //         const messageHandler = (e) => {
  //           if (e.data === "subcategoryPrinted") {
  //             window.removeEventListener("message", messageHandler);
  //             document.body.removeChild(iframe);
  //             currentIndex++;
  //             // Immediately print the next subcategory
  //             printNextSubcategory();
  //           }
  //         };

  //         window.addEventListener("message", messageHandler);
  //       };

  //       // Start the printing process
  //       printNextSubcategory();
  //     });
  //   };
  //   // Helper function to create hidden iframe
  //   const createHiddenIframe = () => {
  //     const iframe = document.createElement("iframe");
  //     iframe.style.position = "absolute";
  //     iframe.style.left = "-9999px";
  //     iframe.style.top = "0";
  //     iframe.style.width = "80mm";
  //     iframe.style.height = "100%";
  //     iframe.style.border = "none";
  //     return iframe;
  //   };

  // In your success modal button, update to call handlePrintReceipt directly:

  const options = {
    taxType: [
      { value: "exclusive", label: "Exclusive" },
      { value: "inclusive", label: "Inclusive" },
    ],
    discountType: [
      { value: "percentage", label: "Percentage" },
      { value: "early_payment", label: "Early payment discounts" },
    ],
    weightUnits: [
      { value: "kg", label: "Kilogram" },
      { value: "g", label: "Grams" },
    ],
    taxRates: [
      { value: "select", label: "Select" },
      { value: "no_tax", label: "No Tax" },
      { value: "10", label: "@10" },
      { value: "15", label: "@15" },
      { value: "vat", label: "VAT" },
      { value: "sltax", label: "SLTAX" },
    ],
    couponCodes: [
      { value: "select", label: "Select" },
      { value: "newyear30", label: "NEWYEAR30" },
      { value: "christmas100", label: "CHRISTMAS100" },
      { value: "halloween20", label: "HALLOWEEN20" },
      { value: "blackfriday50", label: "BLACKFRIDAY50" },
    ],
    discountMode: [
      { value: "select", label: "Select" },
      { value: "flat", label: "Flat" },
      { value: "percentage", label: "Percentage" },
    ],
    paymentMethods: [
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
    ],
    paymentTypes: [
      { value: "credit", label: "Credit Card" },
      { value: "cash", label: "Cash" },
      { value: "cheque", label: "Cheque" },
      { value: "deposit", label: "Deposit" },
      { value: "points", label: "Points" },
    ],
  };
  const calculateSubtotal = () => {
    const ticketTotal =
      ticketData.ticketItems?.reduce(
        (total, item) => total + (item.serviceCharge || 0),
        0
      ) || 0;

    const servicesTotal = selectedServices.reduce(
      (total, item) => total + (item.price || 0),
      0
    );

    const orderTotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const partsTotal = partItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return ticketTotal + servicesTotal + orderTotal + partsTotal;
  };

  // Calculate tax (3%)
  // const calculateTax = () => {
  //   return calculateSubtotal();
  // };

  // Calculate total payable
  const calculateTotalPayable = () => {
    return calculateSubtotal();
  };

  return (
    <>
      {/* Payment Completed */}
      <div
        className="modal fade modal-default"
        id="print-receipt"
        aria-labelledby="print-receipt"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-4">
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3 bg-transparent"
                style={{ filter: "none", color: "black" }}
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>

              {/* Header Section */}
              <div className="text-center mb-4 border-bottom pb-3">
                <ImageWithBasePath
                  src="assets/img/logo.png"
                  width={80}
                  height={80}
                  alt="Receipt Logo"
                  className="img-fluid mb-2"
                />
                <h6 className="fw-bold mb-1">{storeName || "Store Name"}</h6>
                <p className="mb-1 text-muted small">
                  Phone: {userPhone || "+1 0000000000"}
                </p>
                <p className="mb-1 text-muted small">
                  Email:{" "}
                  <Link to={`mailto:${userEmail}`} className="text-primary">
                    {userEmail}
                  </Link>
                </p>
                <p className="mb-0 text-muted small">
                  Address: {userAddress || "N/A"}
                </p>
              </div>

              {/* Invoice Title */}
              <div className="receipt-header mb-4">
                <h5 className="text-center text-uppercase fw-bold mb-3">
                  Invoice
                </h5>
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <div>
                    <span className="text-muted">Name: </span>
                    <span className="fw-semibold">
                      {customerName || "Walk-in Customer"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted">Date: </span>
                    <span className="fw-semibold">
                      {new Date().toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="receipt-items mb-4 scrollable-section">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr className="border-bottom">
                      <th className="small text-muted">#</th>
                      <th className="small text-muted">Item</th>
                      <th className="small text-muted text-end">Price</th>
                      <th className="small text-muted text-center">Qty</th>
                      <th className="small text-muted text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Repair Items */}
                    {/* {repairData.repairItems?.map((item, index) => (
                      <tr
                        key={`repair-${item.repairOrderId}`}
                        className="border-bottom"
                      >
                        <td className="small">{index + 1}.</td>
                        <td className="small">{item.taskTypeName}</td>
                        <td className="small text-end">
                          ${item.serviceCharge}
                        </td>
                        <td className="small text-center">1</td>
                        <td className="small text-end">
                          ${item.serviceCharge}
                        </td>
                      </tr>
                    ))} */}

                    {/* Ticket Items */}
                    {/* Ticket Items */}
                    {ticketData.ticketItems?.map((item, index) => (
                      <tr
                        key={`ticket-${item.ticketId}`}
                        className="border-bottom"
                      >
                        <td className="small">{index + 1}.</td>
                        <td className="small">{resolveItemName(item)}</td>{" "}
                        {/* Changed here */}
                        <td className="small text-end">
                          ₹{item.serviceCharge}
                        </td>
                        <td className="small text-center">1</td>
                        <td className="small text-end">
                          ₹{item.serviceCharge}
                        </td>
                      </tr>
                    ))}

                    {/* Services */}
                    {selectedServices.map((item, index) => (
                      <tr key={`service-${item.id}`} className="border-bottom">
                        <td className="small">
                          {(ticketData.ticketItems?.length || 0) + index + 1}.
                        </td>
                        <td className="small">{resolveItemName(item)}</td>{" "}
                        {/* Changed here */}
                        <td className="small text-end">₹{item.price}</td>
                        <td className="small text-center">1</td>
                        <td className="small text-end">₹{item.price}</td>
                      </tr>
                    ))}

                    {/* Order Items */}
                    {orderItems.map((item, index) => (
                      <tr
                        key={`order-item-${item.id}`}
                        className="border-bottom"
                      >
                        <td className="small">
                          {(ticketData.ticketItems?.length || 0) +
                            selectedServices.length +
                            index +
                            1}
                          .
                        </td>
                        <td className="small">{resolveItemName(item)}</td>{" "}
                        {/* Changed here */}
                        <td className="small text-end">₹{item.price}</td>
                        <td className="small text-center">{item.quantity}</td>
                        <td className="small text-end">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}

                    {/* Part Items */}
                    {partItems.map((item, index) => (
                      <tr
                        key={`part-item-${item.id}`}
                        className="border-bottom"
                      >
                        <td className="small">
                          {(ticketData.ticketItems?.length || 0) +
                            selectedServices.length +
                            orderItems.length +
                            index +
                            1}
                          .
                        </td>
                        <td className="small">{resolveItemName(item)}</td>{" "}
                        {/* Changed here */}
                        <td className="small text-end">₹{item.price}</td>
                        <td className="small text-center">{item.quantity}</td>
                        <td className="small text-end">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="receipt-totals mb-4">
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <td className="small text-muted">Sub Total:</td>
                      <td className="small text-end fw-semibold">
                        ₹{calculateSubtotal().toFixed(2)}
                      </td>
                    </tr>
                    {/* <tr>
                      <td className="small text-muted">Discount:</td>
                      <td className="small text-end">-₹0.00</td>
                    </tr>
                    <tr>
                      <td className="small text-muted">Shipping:</td>
                      <td className="small text-end">₹0.00</td>
                    </tr>
                    <tr>
                      <td className="small text-muted">Tax (3%):</td>
                      <td className="small text-end fw-semibold">
                        ₹{(calculateSubtotal() * 0.03).toFixed(2)}
                      </td>
                    </tr> */}
                    <tr className="border-top">
                      <td className="small fw-bold">Total Payable:</td>
                      <td className="small text-end fw-bold">
                        ₹{calculateTotalPayable().toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Section */}
              <div className="text-center">
                <p className="small text-muted mb-3">
                  Thank you for shopping with us. Please come again!
                </p>
                <div className="d-flex justify-content-center gap-2">
                  {/* <button className="btn btn-sm btn-outline-primary">
                    Print Receipt
                  </button> */}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handlePaymentSelection("Cash")}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Print Receipt */}

      {/* /Print Receipt */}

      {/* order successfull modal  */}
      {/* Order Success Modal */}
      {/* Order Success Modal */}
      {/* Order Success Modal */}
      {/* Order Success Modal */}
      {/* Order Success Modal */}
      <div
        className="modal fade"
        id="order-success-modal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="text-center p-4">
                <div
                  className={`icon-circle ${
                    apiResponse?.error ? "bg-danger" : "bg-success"
                  } text-white mb-3`}
                >
                  <i
                    className={apiResponse?.error ? "ti ti-x" : "ti ti-check"}
                  />
                </div>
                <h3
                  className={`mb-3 ${
                    apiResponse?.error ? "text-danger" : "text-success"
                  }`}
                >
                  {apiResponse?.error ? "Failed" : "Success"}
                </h3>
                <p className="mb-3">{apiResponse?.message}</p>
                {apiResponse?.orderNumber && (
                  <div className="alert alert-light mb-3">
                    Order Number: <strong>{apiResponse.orderNumber}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-center gap-3">
                  {/* {!apiResponse?.error && (
                    <button
                      className="btn btn-success"
                      onClick={handlePrintReceipt}
                      disabled={isProcessing}
                    >
                      <i className="ti ti-printer me-1"></i>
                      Print Receipt
                    </button>
                  )} */}
                  <button
                    type="button"
                    className={`btn ${
                      apiResponse?.error ? "btn-outline-danger" : "btn-primary"
                    }`}
                    onClick={() => {
                      const modalEl = document.getElementById(
                        "order-success-modal"
                      );
                      const modal = window.bootstrap.Modal.getInstance(modalEl);

                      if (modal) {
                        modal.hide();
                      }

                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Close"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade modal-default pos-modal"
        id="products"
        aria-labelledby="products"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h5 className="me-4">Products</h5>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                    <span className="badge bg-dark fs-12">
                      Order ID : #45698
                    </span>
                    <p className="fs-16">Number of Products : 02</p>
                  </div>
                  <div className="product-wrap h-auto">
                    <div className="product-list bg-white align-items-center justify-content-between">
                      <div
                        className="d-flex align-items-center product-info"
                        data-bs-toggle="modal"
                        data-bs-target="#products"
                      >
                        <Link to="#" className="pro-img">
                          <ImageWithBasePath
                            src="assets/img/products/pos-product-16.png"
                            alt="Products"
                          />
                        </Link>
                        <div className="info">
                          <h6>
                            <Link to="#">Red Nike Laser</Link>
                          </h6>
                          <p>Quantity : 04</p>
                        </div>
                      </div>
                      <p className="text-teal fw-bold">$2000</p>
                    </div>
                    <div className="product-list bg-white align-items-center justify-content-between">
                      <div
                        className="d-flex align-items-center product-info"
                        data-bs-toggle="modal"
                        data-bs-target="#products"
                      >
                        <Link to="#" className="pro-img">
                          <ImageWithBasePath
                            src="assets/img/products/pos-product-17.png"
                            alt="Products"
                          />
                        </Link>
                        <div className="info">
                          <h6>
                            <Link to="#">Iphone 11S</Link>
                          </h6>
                          <p>Quantity : 04</p>
                        </div>
                      </div>
                      <p className="text-teal fw-bold">$3000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Create customer */}
      <div
        className="modal fade"
        id="create"
        tabIndex={-1}
        aria-labelledby="create"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Customer</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body pb-1">
                {submitError && (
                  <div className="alert alert-danger mx-3 my-2">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="alert alert-success mx-3 my-2">
                    Customer created successfully!
                  </div>
                )}
                <div className="row">
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Customer Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">Zipcode</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-md btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Hold */}
      <div
        className="modal fade modal-default pos-modal"
        id="hold-order"
        aria-labelledby="hold-order"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Hold order</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="bg-light br-10 p-4 text-center mb-3">
                  <h2 className="display-1">4500.00</h2>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Order Reference <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    defaultValue=""
                    placeholder=""
                  />
                </div>
                <p>
                  The current order will be set on hold. You can retreive this
                  order from the pending order button. Providing a reference to
                  it might help you to identify the order more quickly.
                </p>
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Hold */}
      {/* Edit Product */}
      <div
        className="modal fade modal-default pos-modal"
        id="edit-product"
        aria-labelledby="edit-product"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Product</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Red Nike Laser Show"
                        disabled=""
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Product Price <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={1800}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Tax Type <span className="text-danger">*</span>
                      </label>

                      <Select
                        options={options.taxType}
                        classNamePrefix="react-select select"
                        placeholder="Select"
                        defaultValue={options.taxType[0]}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Tax <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-percentage" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={15}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Discount Type <span className="text-danger">*</span>
                      </label>

                      <Select
                        options={options.discountType}
                        classNamePrefix="react-select select"
                        placeholder="Select"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Discount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={15}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Sale Unit <span className="text-danger">*</span>
                      </label>
                      <Select
                        options={options.weightUnits}
                        classNamePrefix="react-select select"
                        placeholder="Select"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Product */}
      {/* Delete Product */}
      <div
        className="modal fade modal-default"
        id="delete"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap text-center">
                <form>
                  <div className="icon-success bg-danger-transparent text-danger mb-2">
                    <i className="ti ti-trash" />
                  </div>
                  <h3 className="mb-2">Are you Sure!</h3>
                  <p className="fs-16 mb-3">
                    The current order will be deleted as no payment has been
                    made so far.
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      No, Cancel
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Product */}
      {/* Reset */}
      <div
        className="modal fade modal-default"
        id="reset"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap text-center">
                <form>
                  <div className="icon-success bg-purple-transparent text-purple mb-2">
                    <i className="ti ti-transition-top" />
                  </div>
                  <h3 className="mb-2">Confirm Your Action</h3>
                  <p className="fs-16 mb-3">
                    The current order will be cleared. But not deleted if
                    it&apos;s persistent. Would you like to proceed ?
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      No, Cancel
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Yes, Proceed
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Reset */}
      {/* Recent Transactions */}
      <div
        className="modal fade pos-modal"
        id="recents"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Recent Transactions</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="tabs-sets">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="purchase-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#purchase"
                      type="button"
                      aria-controls="purchase"
                      aria-selected="true"
                      role="tab"
                    >
                      Purchase
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="payment-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#payment"
                      type="button"
                      aria-controls="payment"
                      aria-selected="false"
                      role="tab"
                    >
                      Payment
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="return-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#return"
                      type="button"
                      aria-controls="return"
                      aria-selected="false"
                      role="tab"
                    >
                      Return
                    </button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="purchase"
                    role="tabpanel"
                    aria-labelledby="purchase-tab"
                  >
                    <div className="card table-list-card mb-0">
                      <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="search-set">
                          <div className="search-input">
                            <Link to="#" className="btn btn-searchset">
                              <i className="ti ti-search fs-14 feather-search" />
                            </Link>
                            <div
                              id="DataTables_Table_0_filter"
                              className="dataTables_filter"
                            >
                              <label>
                                {" "}
                                <input
                                  type="search"
                                  className="form-control form-control-sm"
                                  placeholder="Search"
                                  aria-controls="DataTables_Table_0"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <ul className="table-top-head">
                          <TooltipIcons />
                          <li>
                            <Tooltip title="Print">
                              <Link
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Print"
                              >
                                <i className="ti ti-printer" />
                              </Link>
                            </Tooltip>
                          </li>
                        </ul>
                      </div>
                      <div className="card-body">
                        <div className="custom-datatable-filter table-responsive">
                          <table className="table datatable">
                            <thead>
                              <tr>
                                <th className="no-sort">
                                  <label className="checkboxs">
                                    <input
                                      type="checkbox"
                                      className="select-all"
                                    />
                                    <span className="checkmarks" />
                                  </label>
                                </th>
                                <th>Customer</th>
                                <th>Reference</th>
                                <th>Date</th>
                                <th>Amount </th>
                                <th className="no-sort">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-27.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Carl Evans</Link>
                                  </div>
                                </td>
                                <td>INV/SL0101</td>
                                <td>24 Dec 2024</td>
                                <td>$1000</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-02.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Minerva Rameriz</Link>
                                  </div>
                                </td>
                                <td>INV/SL0102</td>
                                <td>10 Dec 2024</td>
                                <td>$1500</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-05.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Robert Lamon</Link>
                                  </div>
                                </td>
                                <td>INV/SL0103</td>
                                <td>27 Nov 2024</td>
                                <td>$1500</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-22.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Patricia Lewis</Link>
                                  </div>
                                </td>
                                <td>INV/SL0104</td>
                                <td>18 Nov 2024</td>
                                <td>$2000</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-03.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Mark Joslyn</Link>
                                  </div>
                                </td>
                                <td>INV/SL0105</td>
                                <td>06 Nov 2024</td>
                                <td>$800</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-12.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Marsha Betts</Link>
                                  </div>
                                </td>
                                <td>INV/SL0106</td>
                                <td>25 Oct 2024</td>
                                <td>$750</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-06.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Daniel Jude</Link>
                                  </div>
                                </td>
                                <td>INV/SL0107</td>
                                <td>14 Oct 2024</td>
                                <td>$1300</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="payment" role="tabpanel">
                    <div className="card table-list-card mb-0">
                      <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="search-set">
                          <div className="search-input">
                            <Link to="#" className="btn btn-searchset">
                              <i className="ti ti-search fs-14 feather-search" />
                            </Link>
                            <div
                              id="DataTables_Table_0_filter"
                              className="dataTables_filter"
                            >
                              <label>
                                {" "}
                                <input
                                  type="search"
                                  className="form-control form-control-sm"
                                  placeholder="Search"
                                  aria-controls="DataTables_Table_0"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <ul className="table-top-head">
                          <TooltipIcons />
                          <li>
                            <Tooltip title="Print">
                              <Link
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Print"
                              >
                                <i className="ti ti-printer" />
                              </Link>
                            </Tooltip>
                          </li>
                        </ul>
                      </div>
                      <div className="card-body">
                        <div className="custom-datatable-filter table-responsive">
                          <table className="table datatable">
                            <thead>
                              <tr>
                                <th className="no-sort">
                                  <label className="checkboxs">
                                    <input
                                      type="checkbox"
                                      className="select-all"
                                    />
                                    <span className="checkmarks" />
                                  </label>
                                </th>
                                <th>Customer</th>
                                <th>Reference</th>
                                <th>Date</th>
                                <th>Amount </th>
                                <th className="no-sort">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-27.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Carl Evans</Link>
                                  </div>
                                </td>
                                <td>INV/SL0101</td>
                                <td>24 Dec 2024</td>
                                <td>$1000</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-02.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Minerva Rameriz</Link>
                                  </div>
                                </td>
                                <td>INV/SL0102</td>
                                <td>10 Dec 2024</td>
                                <td>$1500</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-05.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Robert Lamon</Link>
                                  </div>
                                </td>
                                <td>INV/SL0103</td>
                                <td>27 Nov 2024</td>
                                <td>$1500</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-22.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Patricia Lewis</Link>
                                  </div>
                                </td>
                                <td>INV/SL0104</td>
                                <td>18 Nov 2024</td>
                                <td>$2000</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-03.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Mark Joslyn</Link>
                                  </div>
                                </td>
                                <td>INV/SL0105</td>
                                <td>06 Nov 2024</td>
                                <td>$800</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-12.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Marsha Betts</Link>
                                  </div>
                                </td>
                                <td>INV/SL0106</td>
                                <td>25 Oct 2024</td>
                                <td>$750</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-06.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Daniel Jude</Link>
                                  </div>
                                </td>
                                <td>INV/SL0107</td>
                                <td>14 Oct 2024</td>
                                <td>$1300</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="return" role="tabpanel">
                    <div className="card table-list-card mb-0">
                      <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="search-set">
                          <div className="search-input">
                            <Link to="#" className="btn btn-searchset">
                              <i className="ti ti-search fs-14 feather-search" />
                            </Link>
                            <div
                              id="DataTables_Table_0_filter"
                              className="dataTables_filter"
                            >
                              <label>
                                {" "}
                                <input
                                  type="search"
                                  className="form-control form-control-sm"
                                  placeholder="Search"
                                  aria-controls="DataTables_Table_0"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <ul className="table-top-head">
                          <TooltipIcons />
                          <li>
                            <Tooltip title="Print">
                              <Link
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Print"
                              >
                                <i className="ti ti-printer" />
                              </Link>
                            </Tooltip>
                          </li>
                        </ul>
                      </div>
                      <div className="card-body">
                        <div className="custom-datatable-filter table-responsive">
                          <table className="table datatable">
                            <thead>
                              <tr>
                                <th className="no-sort">
                                  <label className="checkboxs">
                                    <input
                                      type="checkbox"
                                      className="select-all"
                                    />
                                    <span className="checkmarks" />
                                  </label>
                                </th>
                                <th>Customer</th>
                                <th>Reference</th>
                                <th>Date</th>
                                <th>Amount </th>
                                <th className="no-sort">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-27.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Carl Evans</Link>
                                  </div>
                                </td>
                                <td>INV/SL0101</td>
                                <td>24 Dec 2024</td>
                                <td>$1000</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-02.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Minerva Rameriz</Link>
                                  </div>
                                </td>
                                <td>INV/SL0102</td>
                                <td>10 Dec 2024</td>
                                <td>$1500</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-05.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Robert Lamon</Link>
                                  </div>
                                </td>
                                <td>INV/SL0103</td>
                                <td>27 Nov 2024</td>
                                <td>$1500</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-22.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Patricia Lewis</Link>
                                  </div>
                                </td>
                                <td>INV/SL0104</td>
                                <td>18 Nov 2024</td>
                                <td>$2000</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-03.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Mark Joslyn</Link>
                                  </div>
                                </td>
                                <td>INV/SL0105</td>
                                <td>06 Nov 2024</td>
                                <td>$800</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-12.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Marsha Betts</Link>
                                  </div>
                                </td>
                                <td>INV/SL0106</td>
                                <td>25 Oct 2024</td>
                                <td>$750</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label className="checkboxs">
                                    <input type="checkbox" />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-md me-2"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/users/user-06.jpg"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Daniel Jude</Link>
                                  </div>
                                </td>
                                <td>INV/SL0107</td>
                                <td>14 Oct 2024</td>
                                <td>$1300</td>
                                <td className="action-table-data">
                                  <div className="edit-delete-action">
                                    <Link className="me-2 edit-icon p-2" to="#">
                                      <Eye className="feather-eye" />
                                    </Link>
                                    <Link className="me-2 p-2" to="#">
                                      <Edit className="feather-edit" />
                                    </Link>
                                    <Link className="p-2" to="#">
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Recent Transactions */}
      {/* Orders */}

      {/* /Orders */}
      {/* Scan */}

      {/* /Scan */}
      {/* Order Tax */}

      {/* /Order Tax */}
      {/* Shipping Cost */}

      {/* /Shipping Cost */}
      {/* Coupon Code */}

      {/* /Coupon Code */}
      {/* Discount */}

      {/* /Discount */}

      {/* Payment Methods Modal */}

      {/* Cash Payment */}

      {/* /Cash Payment */}
      {/* Card Payment */}

      {/* /Card Payment */}
      {/* Active Gift Card */}

      {/* /Active Gift Card */}
      {/* Redeem Value */}

      {/* /Redeem Value */}
      {/* Redeem Value */}

      {/* /Redeem Value */}
      {/* Barcode */}

      {/* /Barcode */}
      {/* Split Payment */}

      {/* /Split Payment */}
      {/* Payment Cash */}

      {/* /Payment Cash  */}
      {/* Payment Card  */}

      {/* /Payment Card  */}
      {/* Payment Cheque */}

      {/* /Payment Cheque */}
      {/*  Payment Deposit */}

      {/* /Payment Deposit */}
      {/* Payment Point */}

      {/* /Payment Point */}
      {/* Calculator */}

      {/* /Calculator */}
      {/* Cash Register Details */}

      {/* /Today&apos;s Sale */}
      {/* Today&apos;s Profit */}

      {/* /Today&apos;s Profit */}
    </>
  );
};
PosModals.propTypes = {
  onCustomerCreated: PropTypes.func.isRequired,
};

export default PosModals;

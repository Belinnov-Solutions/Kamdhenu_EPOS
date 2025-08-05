import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { clearTickets } from "../../core/redux/ticketSlice";
import { resetCart } from "../../core/redux/partSlice";
import { selectPreRepairInspections } from "../../core/redux/checklistSlice";

import PreRepairInspectionModal from "./PreRepairInspection";
const BrandFormTicket = ({ brand, onClose, ticketData }) => {
  const BASE_URL = process.env.REACT_APP_BASEURL;

  const preRepairInspections = useSelector(selectPreRepairInspections);

  const handleClose = () => {
    dispatch(clearTickets()); // Clear repair items
    dispatch(resetCart()); // Clear accessories cart
    onClose(); // Call the original onClose function
  };
  const { userId, storeId } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [partsData, setPartsData] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [checklistData, setChecklistData] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [showReportedIssuesModal, setShowReportedIssuesModal] = useState(false);

  const [newPart, setNewPart] = useState({
    partName: "",
    partNumber: "",
    serialNumber: "",
    description: "",
    price: "",
    stock: "",
    location: "",
  });

  const handleAddPartChange = (e) => {
    const { name, value } = e.target;
    setNewPart((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" ? parseFloat(value) || 0 : value,
    }));
  };

  // const handleAddPartModalOpen = () => {
  //   fetchParts();
  //   setShowAddPartModal(true);
  // };

  // const handleSavePart = async () => {
  //   try {
  //     const storeId = "67aa7f75-0ed9-4378-9b3d-50e1e34903ce";

  //     const payload = {
  //       ...newPart,
  //       storeId: storeId,
  //     };

  //     const response = await axios.post(
  //       `${BASE_URL}api/v1/Order/SavePart`,
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.data) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         parts: [
  //           ...prev.parts,
  //           {
  //             id: "00000000-0000-0000-0000-000000000000",
  //             partId: payload.partId,
  //             partName: payload.partName,
  //             partNo: payload.partNumber,
  //             serialNo: payload.serialNumber,
  //             quantity: 1,
  //             price: payload.price,
  //             total: payload.price,
  //             partDescription: payload.description,
  //           },
  //         ],
  //       }));
  //       setShowAddPartModal(false);
  //       setNewPart({
  //         partName: "",
  //         partNumber: "",
  //         serialNumber: "",
  //         description: "",
  //         price: 0,
  //         stock: 0,
  //         location: "",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error saving part:", error);
  //     setSubmitError("Failed to save part. Please try again.");
  //   }
  // };

  const fetchParts = async () => {
    setPartsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/v1/Order/GetParts`);
      if (response.data && response.data.data) {
        setPartsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
      setSubmitError("Failed to load parts. Please try again.");
    } finally {
      setPartsLoading(false);
    }
  };

  useEffect(() => {
    const fetchChecklistData = async () => {
      if (ticketData?.ticketid && ticketData?.repairOrderId) {
        setChecklistLoading(true);
        try {
          const response = await axios.get(
            `${BASE_URL}api/v1/Order/RepairOrderCheckList`,
            {
              params: {
                ticketId: ticketData.ticketid,
                orderId: ticketData.repairOrderId,
                deviceType: ticketData.deviceType,
              },
            }
          );
          setChecklistData(response.data || []);
        } catch (error) {
          console.error("Error fetching checklist data:", error);
        } finally {
          setChecklistLoading(false);
        }
      }
    };

    fetchChecklistData();
  }, [ticketData?.ticketid, ticketData?.repairOrderId, BASE_URL]);

  const [formData, setFormData] = useState({
    deviceType: ticketData?.deviceType || "",
    brandId: brand?.brandId || "",
    brandName: brand?.name || ticketData?.brand || "",
    imeiNumber: ticketData?.imeiNumber || "",
    serialNumber: ticketData?.serialNumber || "",
    modelId: "",
    modelName: ticketData?.model || "",
    passcode: ticketData?.passcode || "",
    dateCreated: ticketData?.createdAt
      ? new Date(ticketData.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueDate: ticketData?.dueDate
      ? new Date(ticketData.dueDate).toISOString().split("T")[0]
      : "",
    statusId: "",
    taskTypeId: ticketData?.taskTypeId || "",
    technicianId: ticketData?.technicianId || "",

    serviceCharge: ticketData?.serviceCharge || 0,
    repairCost: ticketData?.repairCost || 0,
    repairOrderId: ticketData?.repairOrderId || "",
    orderNumber: ticketData?.orderNumber || "",
    customerId: ticketData?.customerId || "",
    notes: ticketData?.notes || [
      {
        id: "00000000-0000-0000-0000-000000000001",
        notes: "",
        type: "Customer notes",
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        notes: "",
        type: "Internal notes",
      },
      {
        id: "00000000-0000-0000-0000-000000000000",
        notes: "",
        type: "Diagnostic notes",
      },
    ],
    parts:
      ticketData?.orderParts?.length > 0
        ? ticketData.orderParts.map((part) => ({
            id: part.id,
            partId: part.productId,
            partName: part.productName,
            partNo: "",
            serialNo: part.serialNumber,
            quantity: part.quantity,
            price: part.price,
            total: part.total,
            partDescription: part.partDescription || "",
          }))
        : [
            {
              id: "00000000-0000-0000-0000-000000000000",
              partId: "",
              partName: "",
              partNo: "",
              serialNo: "",
              quantity: 1,
              price: 0,
              total: 0,
              partDescription: "",
            },
          ],
  });

  const handleNoteChange = (index, e) => {
    const { name, value } = e.target;
    const updatedNotes = [...formData.notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      [name]: value,
    };
    setFormData((prev) => ({
      ...prev,
      notes: updatedNotes,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceData, setReferenceData] = useState({
    brands: [],
    status: [],
    taskType: [],
    models: [],
    technicians: [],
    parts: [],
  });
  const [loading, setLoading] = useState(true);

  // Get unique device types from models
  // const deviceTypes = useMemo(() => {
  //   const types = new Set();
  //   referenceData.models.forEach((model) => {
  //     types.add(model.deviceType);
  //   });
  //   return Array.from(types);
  // }, [referenceData.models]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tickets data to get notes
        await axios.get(`${BASE_URL}api/v1/Order/GetTickets`, {
          params: {
            storeId: storeId,
          },
        });

        // Fetch reference data for status and technicians
        const referenceResponse = await axios.get(
          `${BASE_URL}api/v1/Product/GetReferenceData`,
          {
            params: {
              storeId: storeId,
            },
          }
        );

        const refData = referenceResponse.data?.data || {};

        // Extract notes from ticket data if we have ticketData
        // let customerNotes = "";
        // let internalNotes = "";
        // if (ticketData && ticketData.notes) {
        //   customerNotes =
        //     ticketData.notes.find((n) => n.type === "Customer notes")?.notes ||
        //     "";
        //   internalNotes =
        //     ticketData.notes.find((n) => n.type === "Internal notes")?.notes ||
        //     "";
        // }

        setReferenceData({
          brands: refData.brands || [],
          status: refData.status || [],
          taskType:
            refData.serviceType?.map((st) => ({
              taskTypeId: st.id,
              taskTypeName: st.name,
            })) || [],
          models: refData.models || [],
          technicians: refData.technicians || [],
          parts: [],
        });

        if (ticketData) {
          // Set brand if we have ticketData.brand
          const matchedBrand = refData.brands?.find(
            (b) => b.brandName.toLowerCase() === ticketData.brand?.toLowerCase()
          );

          // Set status if we have ticketData.status
          const matchedStatus = refData.status?.find(
            (s) =>
              s.statusName.toLowerCase() === ticketData.status?.toLowerCase()
          );

          // Set task type if available
          const matchedTaskType = refData.serviceType?.find(
            (t) => t.id === ticketData.taskTypeId
          );

          // Set model if we can find it
          const matchedModel = refData.models?.find(
            (m) => m.name.toLowerCase() === ticketData.model?.toLowerCase()
          );
          const apiNotes = ticketData?.notes || [];
          const initialNotes = [
            // Keep existing Customer notes if they exist in API, otherwise create new
            apiNotes.find((n) => n.type === "Customer notes") || {
              id: "00000000-0000-0000-0000-000000000001",
              notes: "",
              type: "Customer notes",
            },
            // Keep existing Internal notes if they exist in API, otherwise create new
            apiNotes.find((n) => n.type === "Internal notes") || {
              id: "00000000-0000-0000-0000-000000000002",
              notes: "",
              type: "Internal notes",
            },
            // Keep existing Diagnostic notes if they exist in API, otherwise create new
            apiNotes.find((n) => n.type === "Diagnostic notes") || {
              id: "00000000-0000-0000-0000-000000000000",
              notes: "",
              type: "Diagnostic notes",
            },
            // Include any additional notes from API that aren't the standard types
            ...apiNotes.filter(
              (n) =>
                ![
                  "Customer notes",
                  "Internal notes",
                  "Diagnostic notes",
                ].includes(n.type)
            ),
          ];

          setFormData((prev) => ({
            ...prev,
            notes: initialNotes,
            customerNotes:
              initialNotes.find((n) => n.type === "Customer notes")?.notes ||
              "",
            internalNotes:
              initialNotes.find((n) => n.type === "Internal notes")?.notes ||
              "",
          }));
          setFormData((prev) => ({
            ...prev,
            brandId: matchedBrand?.brandId || "",
            brandName: matchedBrand?.brandName || ticketData.brand,
            statusId: matchedStatus?.statusId || "",
            taskTypeId: matchedTaskType?.id || ticketData.taskTypeId || "",
            modelId: matchedModel?.modelId || "",
            modelName: matchedModel?.name || ticketData.model || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchParts();
  }, [ticketData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deviceType") {
      setFormData((prev) => ({
        ...prev,
        deviceType: value,
        modelId: "",
        modelName: "",
      }));
    } else if (name === "brandId") {
      const selectedBrand = referenceData.brands.find(
        (b) => b.brandId === value
      );
      setFormData((prev) => ({
        ...prev,
        brandId: value,
        brandName: selectedBrand?.brandName || "",
        modelId: "",
        modelName: "",
      }));
    } else if (name === "modelId") {
      const selectedModel = referenceData.models.find(
        (m) => m.modelId === value
      );
      setFormData((prev) => ({
        ...prev,
        modelId: value,
        modelName: selectedModel?.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePartsChange = (index, e) => {
    // Prevent changes to pre-filled parts
    if (ticketData?.orderParts?.[index]) return;

    const { name, value } = e.target;
    const updatedParts = [...formData.parts];

    if (name === "partId") {
      const selectedPart = partsData.find((part) => part.partId === value);
      if (selectedPart) {
        updatedParts[index] = {
          ...updatedParts[index],
          partId: selectedPart.partId,
          partName: selectedPart.partName,
          partNo: selectedPart.partNumber,
          serialNo: selectedPart.serialNumber,
          price: selectedPart.price,
          partDescription: selectedPart.description,
        };
      }
    } else {
      updatedParts[index] = {
        ...updatedParts[index],
        [name]: name === "chargeable" ? e.target.checked : value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      parts: updatedParts,
    }));
  };

  const addPartRow = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          id: "00000000-0000-0000-0000-000000000000",
          partId: "",
          partName: "",
          partNo: "",
          serialNo: "",
          quantity: 1,
          price: 0,
          total: 0,
          partDescription: "",
        },
      ],
    }));
  };

  const removePartRow = (index) => {
    if (formData.parts.length === 1 || ticketData?.orderParts?.[index]) return;
    const updatedParts = formData.parts.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      parts: updatedParts,
    }));
  };

  const filteredModels = useMemo(() => {
    if (!formData.brandId || !formData.deviceType) return [];
    return referenceData.models.filter(
      (model) =>
        model.brandId === formData.brandId &&
        model.deviceType === formData.deviceType
    );
  }, [formData.brandId, formData.deviceType, referenceData.models]);
  const inspectionChecklist = useSelector(
    (state) => state.checklist.preRepairChecklist
  );

  const handleSubmit = async (e, isFinalSubmit = true) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!formData.modelId || !formData.statusId || !formData.taskTypeId) {
        throw new Error("Please fill all required fields");
      }

      // const storeId = storeId;

      const selectedStatus = referenceData.status.find(
        (s) => s.statusId.toString() === formData.statusId.toString()
      );

      if (!selectedStatus) {
        throw new Error("Invalid status selected");
      }

      // Filter out empty parts (where partId is empty)
      const filledParts = formData.parts.filter(
        (part) => part.partId && part.partId.trim() !== ""
      );

      // Map only filled parts to the new structure
      const parts =
        filledParts.length > 0
          ? filledParts.map((part) => ({
              productId: part.partId,
              productName: part.partName,
              brandName: formData.brandName,
              partDescription: part.partDescription || "No description",
              deviceType: formData.deviceType,
              deviceModel: formData.modelName,
              serialNumber: part.serialNo || "",
              quantity: parseInt(part.quantity) || 1,
              price: part.price || 0,
              productType: "Part",
            }))
          : []; // Send empty array if no parts are filled
      const notesPayload = formData.notes
        .filter((note) => note.notes && note.notes.trim() !== "")
        .map((note) => ({
          id:
            note.type === "Diagnostic notes" &&
            note.id === "00000000-0000-0000-0000-000000000000"
              ? "00000000-0000-0000-0000-000000000000" // Keep empty GUID for new diagnostic notes
              : note.id || uuidv4(), // Use existing ID for API-sourced notes or generate new UUID
          notes: note.notes,
          type: note.type,
        }));

      const prepareChecklistResponses = () => {
        const responses = [];

        if (preRepairInspections.length > 0) {
          const latestInspection =
            preRepairInspections[preRepairInspections.length - 1];

          // Debugging logs

          if (!inspectionChecklist) {
            console.error("No inspection checklist data available");
            return responses;
          }

          const inspectionCategory = inspectionChecklist.find(
            (category) => category.categoryName === "Pre-Repair Inspection"
          );

          if (!inspectionCategory) {
            console.error("Pre-Repair Inspection category not found");
            return responses;
          }

          console.log(
            "Found inspection category items:",
            inspectionCategory.checklist
          );

          // Helper function to find checklist ID by text
          const findChecklistId = (text) => {
            const item = inspectionCategory.checklist.find((item) =>
              item.checkText.toLowerCase().includes(text.toLowerCase())
            );
            if (!item) {
              console.warn(`Checklist item not found for text: ${text}`);
            }
            return item?.id;
          };

          // 1. Liquid Damage Status
          if (latestInspection.liquidDamage) {
            const liquidDamageId = findChecklistId("Liquid damage indicator");
            if (liquidDamageId) {
              responses.push({
                checklistId: liquidDamageId,
                value: latestInspection.liquidDamage === "triggered",
                repairInspection: "PreRepairInspection",
              });
            }
          }

          // 2. Power Status - ADDED HERE
          if (latestInspection.powerStatus) {
            const powerStatusId = findChecklistId(latestInspection.powerStatus);
            if (powerStatusId) {
              responses.push({
                checklistId: powerStatusId,
                value: true,
                repairInspection: "PreRepairInspection",
              });
            }
          }

          // 3. Data Status - ADDED HERE
          if (latestInspection.dataStatus) {
            const dataStatusId = findChecklistId(latestInspection.dataStatus);
            if (dataStatusId) {
              responses.push({
                checklistId: dataStatusId,
                value: true,
                repairInspection: "PreRepairInspection",
              });
            }
          }

          // 4. Visible Damage Notes
          if (latestInspection.visibleDamage) {
            const visibleDamageId = findChecklistId("Visible damage");
            if (visibleDamageId) {
              responses.push({
                checklistId: visibleDamageId,
                value: true,
                repairInspection: latestInspection.visibleDamage,
              });
            }
          }

          // 5. Device Condition Notes
          if (latestInspection.deviceCondition) {
            const deviceConditionId = findChecklistId("Condition of phone");
            if (deviceConditionId) {
              responses.push({
                checklistId: deviceConditionId,
                value: true,
                repairInspection: latestInspection.deviceCondition,
              });
            }
          }

          // 6. General Notes
          if (latestInspection.notes) {
            const notesId = findChecklistId("Notes");
            if (notesId) {
              responses.push({
                checklistId: notesId,
                value: true,
                repairInspection: latestInspection.notes,
              });
            }
          }
        }

        console.log("Generated responses:", responses);
        return responses;
      };
      const payload = {
        repairOrderId: ticketData?.repairOrderId,
        orderNumber: formData.orderNumber || "",
        storeId: storeId,
        customerId:
          formData.customerId || "00000000-0000-0000-0000-000000000000",
        userId: userId,
        repairStatus: selectedStatus.statusName,
        paymentMethod: "Cash",
        receivedDate: formData.dateCreated
          ? new Date(formData.dateCreated).toISOString()
          : new Date().toISOString(),
        expectedDeliveryDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isFinalSubmit: isFinalSubmit,
        productType: parts.length > 0 ? "Service" : "Repair",
        tickets: {
          ticketNo: ticketData.ticketNo,
          deviceType: formData.deviceType,
          ipAddress: "",
          brand: formData.brandName,
          model: formData.modelName,
          imeiNumber: formData.imeiNumber,
          serialNumber: formData.serialNumber,
          passcode: formData.passcode,
          serviceCharge: parseFloat(formData.serviceCharge) || 0,
          repairCost: parseFloat(formData.repairCost) || 0,
          technicianId:
            formData.technicianId || "b1aaf8f8-ec4f-4950-9aa5-51d74b61f4de",
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: selectedStatus.statusName,
          taskTypeId: formData.taskTypeId || uuidv4(),
          notes: notesPayload, // Use the properly formatted notes payload
        },
        parts: parts,
        checklistResponses: {
          ticketId: ticketData.ticketid,
          orderId: ticketData?.repairOrderId,
          responses: prepareChecklistResponses(),
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/order/ConfirmOrder`,
        // "https://31eb9d00cb7f.ngrok-free.app/api/v1/order/ConfirmOrder",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.message) {
        setSubmitSuccess({ isFinal: isFinalSubmit });
        if (isFinalSubmit) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (submitSuccess) {
    return (
      <div className="alert alert-success mb-4">
        Repair ticket {submitSuccess.isFinal ? "submitted" : "saved"}{" "}
        successfully!
        <button
          type="button"
          className="btn btn-primary btn-sm ms-3"
          onClick={handleClose} // Changed from onClose
        >
          Close
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Repair Form for {brand.name}</h5>

          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
          ></button>
        </div>

        {submitError && (
          <div className="alert alert-danger mb-3">{submitError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Device Type</label>
              <input
                type="text"
                className="form-control"
                value={formData.deviceType}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                disabled
              >
                <option value="">Select Brand</option>
                {referenceData.brands?.map((brandItem) => (
                  <option key={brandItem.brandId} value={brandItem.brandId}>
                    {brandItem.brandName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">IMEI Number</label>
              <input
                type="text"
                className="form-control"
                name="imeiNumber"
                value={formData.imeiNumber}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-control"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Model *</label>
              <select
                className="form-select"
                name="modelId"
                value={formData.modelId}
                onChange={handleChange}
                required
                disabled={!formData.brandId || !formData.deviceType}
                style={
                  !formData.brandId || !formData.deviceType
                    ? {}
                    : { pointerEvents: "none", backgroundColor: "#F9FAFB" }
                }
              >
                <option value="">Select Model</option>
                {filteredModels.length > 0 ? (
                  filteredModels?.map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                      {model.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {formData.brandId && formData.deviceType
                      ? "No models available for selected brand and device type"
                      : "Please select brand and device type first"}
                  </option>
                )}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Passcode</label>
              <input
                type="text"
                className="form-control"
                name="passcode"
                value={formData.passcode}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Date Created</label>
              <input
                type="date"
                className="form-control"
                name="dateCreated"
                value={formData.dateCreated}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Service Type *</label>
              <select
                className="form-select"
                name="taskTypeId"
                value={formData.taskTypeId}
                onChange={handleChange}
                required
                disabled
              >
                <option value="">Select Task Type</option>
                {referenceData.taskType?.map((taskTypeItem) => (
                  <option
                    key={taskTypeItem.taskTypeId}
                    value={taskTypeItem.taskTypeId}
                  >
                    {taskTypeItem.taskTypeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Technician</label>
              <select
                className="form-select"
                name="technicianId"
                value={formData.technicianId}
                onChange={handleChange}
                readOnly
                disabled
              >
                <option value="">Select Technician</option>
                {referenceData.technicians?.map((tech) => (
                  <option key={tech.userId} value={tech.userId}>
                    {tech.userName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checklist Data Display */}
          {/* Checklist Data Display */}
          {/* Checklist Data Display */}
          <div className="row mb-3">
            <div className="col-12">
              {checklistData.some((category) =>
                category.responses.some((response) => response.value === true)
              ) && <h5 className="mb-3">Checklist Information</h5>}

              {checklistLoading ? (
                <div className="text-center">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                checklistData.map((category) => {
                  const validResponses = category.responses.filter(
                    (response) => response.value === true
                  );

                  if (validResponses.length === 0) return null;

                  return (
                    <div key={category.categoryName} className="mb-4">
                      <h6>{category.categoryName}</h6>
                      <div className="card">
                        <div className="card-body">
                          <ul className="list-group list-group-flush">
                            {validResponses.map((response, idx) => (
                              <li key={idx} className="list-group-item">
                                <div className="d-flex justify-content-between">
                                  <span>{response.label}</span>
                                  {response.repairInspection && (
                                    <span className="text-muted">
                                      {response.repairInspection}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* <div className="row mb-3">
            <div className="col-12">
              <label className="form-label">Customer Notes</label>
              <textarea
                className="form-control"
                rows="3"
                name="customerNotes"
                value={formData.customerNotes}
                onChange={handleChange}
                readOnly
              ></textarea>
            </div>
          </div> */}
          {/* 
          <div className="row mb-3">
            <div className="col-12">
              <label className="form-label">Internal Notes</label>
              <textarea
                className="form-control"
                rows="3"
                name="internalNotes"
                value={formData.internalNotes}
                onChange={handleChange}
                readOnly
              ></textarea>
            </div>
          </div> */}

          {formData.notes.map((note, index) => (
            <div className="row mb-3" key={note.id}>
              <div className="col-12">
                <label className="form-label">{note.type}</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="notes"
                  value={note.notes}
                  onChange={(e) => handleNoteChange(index, e)}
                  readOnly={
                    note.type === "Customer notes" ||
                    note.type === "Internal notes"
                  }
                ></textarea>
              </div>
            </div>
          ))}

          <div className="row mb-3">
            <div className="col-12">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                name="statusId"
                value={formData.statusId}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                {referenceData.status?.map((statusItem) => (
                  <option key={statusItem.statusId} value={statusItem.statusId}>
                    {statusItem.statusName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Parts</h6>
              <div>
                {/* <button
                  type="button"
                  className="btn btn-sm btn-primary me-2"
                  onClick={handleAddPartModalOpen}
                >
                  Add Part
                </button> */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addPartRow}
                >
                  Add Row
                </button>
              </div>
            </div>

            {formData.parts.map((part, index) => (
              <div key={index} className="row mb-3 border-bottom pb-3">
                <div className="col-md-3">
                  <label className="form-label">Part Name *</label>
                  {ticketData?.orderParts?.[index] ? (
                    <input
                      type="text"
                      className="form-control"
                      name="partName"
                      value={part.partName}
                      readOnly
                    />
                  ) : (
                    <select
                      className="form-select"
                      name="partId"
                      value={part.partId}
                      onChange={(e) => handlePartsChange(index, e)}
                    >
                      <option value="">Select Part Name</option>
                      {partsLoading ? (
                        <option value="" disabled>
                          Loading parts...
                        </option>
                      ) : (
                        partsData?.map((partItem) => (
                          <option key={partItem.partId} value={partItem.partId}>
                            {partItem.partName}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>
                <div className="col-md-2">
                  <label className="form-label">Part No</label>
                  <input
                    type="text"
                    className="form-control"
                    name="partNo"
                    value={part.partNo}
                    onChange={(e) => handlePartsChange(index, e)}
                    readOnly={!!ticketData?.orderParts?.[index]}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Serial No</label>
                  <input
                    type="text"
                    className="form-control"
                    name="serialNo"
                    value={part.serialNo}
                    onChange={(e) => handlePartsChange(index, e)}
                    readOnly={!!ticketData?.orderParts?.[index]}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={part.quantity}
                    onChange={(e) => handlePartsChange(index, e)}
                    readOnly={!!ticketData?.orderParts?.[index]}
                  />
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removePartRow(index)}
                    disabled={
                      formData.parts.length === 1 ||
                      !!ticketData?.orderParts?.[index]
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowReportedIssuesModal(true)}
              >
                🔧 Pre-Repair Inspection
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose} // Changed from onClose to handleClose
              disabled={isSubmitting}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </button>
            <button
              type="submit"
              className="btn btn-success"
              onClick={(e) => handleSubmit(e, true)}
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
          <PreRepairInspectionModal
            show={showReportedIssuesModal}
            onClose={() => setShowReportedIssuesModal(false)}
            deviceType={ticketData?.deviceType || ""}
            repairOrderId={ticketData?.repairOrderId} // Add this
            ticketId={ticketData?.ticketid}
            onSave={() => {
              // Handle save logic here
              setShowReportedIssuesModal(false);
            }}
          />
        </form>

        {/* Add Part Modal */}
        {showAddPartModal && (
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Part</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddPartModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Part Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="partName"
                        value={newPart.partName}
                        onChange={handleAddPartChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Part Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="partNumber"
                        value={newPart.partNumber}
                        onChange={handleAddPartChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Serial Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="serialNumber"
                        value={newPart.serialNumber}
                        onChange={handleAddPartChange}
                      />
                    </div>
                    {/* <div className="col-md-6">
                      <label className="form-label">Price *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={newPart.price}
                        onChange={handleAddPartChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div> */}
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="stock"
                        value={newPart.stock}
                        onChange={handleAddPartChange}
                        required
                        min="0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={newPart.location}
                        onChange={handleAddPartChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="description"
                        value={newPart.description}
                        onChange={handleAddPartChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary "
                    onClick={() => setShowAddPartModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClose} // Changed from setShowAddPartModal(false)
                  >
                    Save Part
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

BrandFormTicket.propTypes = {
  brand: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    brandId: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  ticketData: PropTypes.object,
};

export default BrandFormTicket;

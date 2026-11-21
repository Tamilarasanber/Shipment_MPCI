import { initialHBLPartiesValue } from "./initialHBLPartiesValue";
import { initialHBLContainerValue } from "./initialHBLContainerValue";
import { initialHBLItemValue } from "./initialHBLItemValue";

export const initialHBLValue = () => ({
  clientId: crypto.randomUUID(),
  id: crypto.randomUUID(),
  generalInfo: 
    {
      hblNo: "",
      parentBlNumber: "",
      parentBlIssuerPartyName: "",
      parentBlIssuerPartyMpciId: "",
      filingPartyMpciID: "",
      liablePartyMpciId: "",
      futureChildBl: "No",
      movementType: "IMPORT",
      blType: "Negotiable",
      cargoType: "9",
      portOfAcceptance: "",
      portOfAcceptanceId: "",
      endDestination: "",
      endDestinationId: "",
      portOfTranshipment: "",
      portOfTranshipmentId: "",
      efsAgentCode: "",
      efsAgentName: "",
      blDate: null,
      emirate: "",
      placeOfBillIssueName: "",
      placeOfBillIssueId: "",
      placeOfFreightPaymentName: "",
      placeOfFreightPaymentId: "",
      freightPaymentType: "",
      invoiceAmount: "",
      currencyName: "",
      currencyId: "",
      serviceRequirement: "",
      filingRemarks: "",
      amendmentType: "",
      splitBl: "No",
      originalNo:"",
      actionCode: "",
      remarks: "",
      filingAttachments: [],
      shipmentId: "",
      hblShipmentUid: "",
      
    },
  

  // parties: [initialHBLPartiesValue()],
  parties: [
  initialHBLPartiesValue("Shipper"),
  initialHBLPartiesValue("Consignee"),
  initialHBLPartiesValue("Forwarding Agent"),
],

  containers: [initialHBLContainerValue()],
  items: [initialHBLItemValue()],
});

const initialState = {
  loginUserData: {
    customerRole: "AGENT",
    userName: "Shipment BL",
    enableCreateMpci: true,
    enableActionCTA: true,
    enablePdfExtraction: true,
    enableLinkHBL: false,
    enableAddHBL: true,
    enableUploadFile: false,
    filingFor: "Self - Local UAE Freight Forwarder",
    efsAgentCodes: [],
    shipmentSource: [],
  },
};

export default function loginReducer(state = initialState) {
  return state;
}

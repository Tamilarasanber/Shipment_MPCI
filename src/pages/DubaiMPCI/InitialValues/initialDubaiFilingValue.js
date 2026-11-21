import { initialContainerHeaderValue } from "./initialContainerHeaderValue";
import { getLoginMpciOverrides } from "../utils/loginUserDataUtils";


export const initialDubaiFilingValue = {
  // masterId: "",
  actionCode: "N",
  // amendmentType: "",
  filingfor: "",
  filingType: "FF",
  // noOfHBLs: 0,
  // mpciCode: "",
  efsAgentCodeField: "",
  efsAgentNameField: "",
  carrierName: "",
  mblNo: "",
  eta: null,
  etd: null,
  firstPortLoadingName: "",
  firstPortLoadingId: "",
  lastForeignPortName: "",
  lastForeignPortId: "",
  portOfDischargeName: "",
  portOfDischargeId: "",
  cargoType: "9",
  vesselName: "",
  voyageNo: "",
  vesselCountryName: "",
  vesselCountryId: "",
  filingPartyMpciID: "",
  liablePartyMpciId: "",
  vesselId: "",
  carrierId: "",
  carrierCode: "",
  carrierMpciCode: "",
  
  vesselCountryCode: "",
  
  hblList: [],
  containerHeaders: [initialContainerHeaderValue()],

};
export const buildInitialDubaiFilingValue = (loginUserData = {}) => ({
  ...initialDubaiFilingValue,
  ...getLoginMpciOverrides(loginUserData),
});

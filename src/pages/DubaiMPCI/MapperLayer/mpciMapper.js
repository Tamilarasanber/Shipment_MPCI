import { initialDubaiFilingValue } from "../InitialValues/initialDubaiFilingValue";
import { initialContainerHeaderValue } from "../InitialValues/initialContainerHeaderValue";
import { initialHBLValue } from "../InitialValues/initialHBLValue";
import {
  mapContainerToHeaderValue,
  normalizeContainerNumberList,
} from "../utils/containerHeaderUtils";
import {
  dedupePartiesByType,
  normalizeLinkedPartyType,
} from "../MapperLayer/partyAutofill";

const CONTAINER_STATUS_MAP = {
  0: "FCL",
  1: "LCL",
  2: "EMPTY",
  FCL: "FCL",
  LCL: "LCL",
  EMPTY: "EMPTY",
};

const toUiContainerStatus = (value) => {
  const key = String(value ?? "")
    .trim()
    .toUpperCase();
  const suffix = key.includes("-") ? key.split("-").pop().trim() : key;
  return CONTAINER_STATUS_MAP[key] || CONTAINER_STATUS_MAP[suffix] || "";
};

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  // API can return placeholder epoch for empty date
  // if (date.getUTCFullYear() <= 1970) return null;
  if (date.getFullYear() <= 1970) return value;
  return date;
};

const splitHsCodeText = (value) =>
  String(value ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

const normalizeHsCodeArray = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap(splitHsCodeText);
  }

  if (value === null || value === undefined) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.flatMap(splitHsCodeText);
      }
    } catch {
      // fallback to plain string
    }

    return splitHsCodeText(trimmed);
  }

  return splitHsCodeText(value);
};

const normalizeHsCodeString = (value) => {
  return normalizeHsCodeArray(value).join(",");
};

const normalizeIdArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((id) => String(id ?? "").trim()).filter(Boolean);
  }

  if (value === null || value === undefined) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id ?? "").trim()).filter(Boolean);
      }
    } catch {
      // fallback to plain string
    }

    return [trimmed];
  }

  return [String(value).trim()].filter(Boolean);
};

const ensureLinkedArray = (value) => (Array.isArray(value) ? value : []);

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};

// Auto fill Party API data
const mapParty = (party = {}) => ({
  id: party.id ?? crypto.randomUUID(),
  partyType: party.partyType ?? "",
  partyName: party.partyName ?? "",
  taxID: party.taxId ?? "",
  address: party.address ?? "",
  cityName: party.cityName ?? "",
  cityId: party.cityId ?? "",
  stateName: party.stateName ?? "",
  stateId: party.stateId ?? "",
  countryName: party.countryName ?? "",
  countryId: party.countryId ?? "",
  poBox: party.poBox ?? "",
  qualifier: party.qualifier ?? "",
  identifierNo: party.identifierNo ?? "",
  contactPartyType: party.contactPartyType ?? "",
  contactDetail: party.contactDetail ?? "",
  mobile: party.mobile ?? party.phone ?? "",
  email: party.email ?? "",
});

// Auto fill Container API data
const mapContainerItem = (c = {}) => ({
  id: c.id || crypto.randomUUID(),
  containerCode: c.containerCode || "",
  containerId: c.containerId ?? "",
  // containerNo: normalizeContainerNumberList(c.containerNo),
  containerNo: normalizeContainerNumberList(c.containerNo),
  containerStatus: toUiContainerStatus(c.containerStatus),
  packageTypeName: c.packageTypeName || "",
  packageTypeId: c.packageTypeId ?? "",
  weight: c.weight ?? "",
  shipperSeal: c.shipperSeal || "",
  carrierSeal: c.carrierSeal || "",
  customsSeal: c.customsSeal || "",
  sealingPartyName: c.sealingPartyName || "",
  carrierSealType: c.carrierSealType || "",
  customsSealType: c.customsSealType || "",
  shipperSealType: c.shipperSealType || "",
  handlingInstructionName: c.handlingInstructionName || "",
  handlingInstructionId: c.handlingInstructionId ?? "",
  removeContainerSplit: c.removeContainerSplit || "",
  reeferCargo: Boolean(c.reeferCargo),
  dangerousGoods: Boolean(c.dangerousGoods),
  temperature: c.temperature || "",
  unitCode: c.unitCode || "",
});

// const mapLinkedContainerDetails = (containerDetails = []) =>
//   ensureLinkedArray(containerDetails).map((container) => ({
//     ...mapContainerItem(container),
//     id: null,
//   }));

const mapApiContainerToHeader = (container = {}) =>
  mapContainerToHeaderValue({
    ...container,
    containerStatus: toUiContainerStatus(container?.containerStatus),
  });

const buildContainerHeadersFromContainers = (
  containerDetails = [],
  fallbackToInitial = true,
) => {
  const containerHeaders = ensureLinkedArray(containerDetails).map(
    mapApiContainerToHeader,
  );

  return containerHeaders.length > 0
    ? containerHeaders
    : fallbackToInitial
      ? [initialContainerHeaderValue()]
      : [];
};

export const mapMasterContainerHeaders = (apiData = {}) => {
  const masterContainerDetails = ensureLinkedArray(
    apiData?.masterContainerDetails,
  );

  if (!masterContainerDetails.length) {
    return [initialContainerHeaderValue()];
  }

  return buildContainerHeadersFromContainers(masterContainerDetails);
};

// Auto fill Item API data
const mapItem = (item = {}) => ({
  id: item.id || crypto.randomUUID(),
  blId: item.blId ?? "",
  hsId: normalizeIdArray(item.hsId),
  hsCode: normalizeHsCodeString(item.hsCode),
  containerNo: Array.isArray(item.containerNo)
    ? item.containerNo.filter(Boolean)
    : item.containerNo
      ? [String(item.containerNo).trim()].filter(Boolean)
      : [],
  numberOfPackages: item.numberOfPackages ?? "",
  packageTypeName: item.packageTypeName || "",
  packageTypeId: item.packageTypeId ?? "",
  cargoGrossWeight: item.cargoGrossWeight ?? "",
  itemDescription: item.itemDescription || "",
  marksAndNumbers: item.marksAndNumbers || "",
  packingRelatedDescCode: item.packingDescriptionName || "",
  packingDescriptionId: item.packingDescriptionId ?? "",
  cargoNetWeight: item.cargoNetWeight || "",
  volumeMtq: item.volumeMtq || "",
  imoClass: item.imoClass || "",
  unCode: item.unCode || "",
  markingInstructionName: item.markingInstructionName || "",
  markingInstructionId: item.markingInstructionId ?? "",
  countryOfOriginName: item.countryOfOriginName || "",
  countryOfOriginId: item.countryOfOriginId ?? "",
});

const mapLinkedItemList = (itemList = []) =>
  ensureLinkedArray(itemList).map((item) => ({
    ...mapItem(item),
    id: null,
  }));

// Auto fill General Info tab API data
const mapSingleBl = (bl = {}) => {
  const baseHbl = initialHBLValue();
  const normalizedPartyDetails = dedupePartiesByType(bl.partyDetails || []);
  const parentBlIssuerPartyMpciId = pickFirst(bl.parentBlIssuerPartyMpciId);

  return {
    ...baseHbl,
    id: bl.id ?? bl.blId ?? baseHbl.id,
    generalInfo: {
      ...baseHbl.generalInfo,
      efsAgentCode: bl.efsAgentCode ?? "",
      efsAgentName: bl.efsAgentName ?? "",
      hblNo: bl.hblNo ?? "",
      splitBl: bl.splitBl ?? "",
      originalNo: bl.originalNo ?? "",
      movementType: bl.movementType ?? "",
      parentBlNumber: bl.parentBlNumber ?? "",
      parentBlIssuerPartyName: bl.parentBlIssuerPartyName ?? "",
      parentBlIssuerPartyMpciId: parentBlIssuerPartyMpciId ?? "",
      blType: bl.blType ?? "",
      remarks: bl.remarks ?? "",
      blDate: bl.blDate ?? "",
      emirate: bl.emirate ?? "",
      placeOfBillIssueName: bl.placeOfBillIssueName ?? "",
      placeOfBillIssueId: bl.placeOfBillIssueId ?? "",
      placeOfFreightPaymentName: bl.placeOfFreightPaymentName ?? "",
      placeOfFreightPaymentId: bl.placeOfFreightPaymentId ?? "",
      freightPaymentType: bl.freightPaymentType ?? "",
      invoiceAmount: bl.invoiceAmount ?? "",
      currencyName: bl.currencyName ?? "",
      currencyId: bl.currencyId ?? "",
      serviceRequirement: bl.serviceRequirement ?? "",
      filingPartyMpciID: bl.filingPartyMpciId ?? "",
      liablePartyMpciId: bl.liableUAEPartyMPCIId ?? "",
      futureChildBl: bl.futureChildBl ?? "",
      cargoType: bl.cargoType ?? "",
      // portOfAcceptance: bl.polName ?? "",
      // portOfAcceptanceId: bl.polId ?? "",
      // endDestination: bl.podName ?? "",
      // endDestinationId: bl.podId ?? "",
      portOfAcceptance: bl.porName ?? "",
      portOfAcceptanceId: bl.porId ?? "",
      endDestination: bl.fdcName ?? "",
      endDestinationId: bl.fdcId ?? "",
      portOfTranshipment: bl.potName ?? "",
      portOfTranshipmentId: bl.potId ?? "",
      filingRemarks: bl.filingRemarks ?? "",
      actionCode: bl.actionCode ?? baseHbl.generalInfo.actionCode,
      amendmentType: bl.amendmentType ?? "",
      shipmentId: bl.hblShipmentId ?? "",
      hblShipmentUid: bl.hblRndId ?? "",

    },

    parties: normalizedPartyDetails.map(mapParty),
    containers: (bl.containerDetails || []).map(mapContainerItem),
    items: (bl.itemList || []).map(mapItem),
  };
};

// Auto Filing API Main
export const mapMPCIDetailsToFormik = (apiData = {}) => {
  const base = initialDubaiFilingValue;
  const hblList = (apiData.blDetailsList || []).map(mapSingleBl);

  return {
    ...base,
    actionCode: apiData.actionCode ?? base.actionCode,
    filingfor: apiData.filingFor ?? base.filingfor,
    // efsAgentCodeField: apiData.agentCode ?? "",
    // efsAgentNameField: apiData.agentName ?? "",
    efsAgentCodeField: apiData.onbehalfAgentCode ?? "",
    efsAgentNameField: apiData.onbehalfAgentName ?? "",
    filingType: apiData.filingType ?? "",
    carrierName: apiData.carrierName ?? "",
    carrierId: apiData.carrierId ?? "",
    carrierCode: apiData.carrierCode ?? "",
    carrierMpciCode: apiData.carrierMpciCode ?? "",
    mblNo: apiData.mblNo ?? apiData.obl ?? "",
    eta: normalizeDate(apiData.eta),
    etd: normalizeDate(apiData.etd),
    firstPortLoadingName: apiData.firstPortLoadingName ?? "",
    firstPortLoadingId: apiData.firstPortLoadingId ?? "",
    lastForeignPortName: apiData.lastForeignPortName ?? "",
    lastForeignPortId: apiData.lastForeignPortId ?? "",
    portOfDischargeName:
      apiData.portOfDischargeName ?? apiData.destination ?? "",
    portOfDischargeId: apiData.portOfDischargeId ?? "",
    cargoType: apiData.cargoType ?? "",
    vesselName: apiData.vesselName ?? "",
    vesselId: apiData.vesselId ?? "",
    voyageNo: apiData.voyageNo ?? "",
    vesselCountryName:
      apiData.vesselCountryName ?? apiData.vesselCountryCode ?? "",
    vesselCountryId: apiData.vesselCountryId ?? "",
    vesselCountryCode: apiData.vesselCountryCode ?? "",
    filingPartyMpciID: apiData.filingPartyMpciId ?? "",
    liablePartyMpciId: apiData.liablePartyMpciId ?? "",
    containerHeaders: mapMasterContainerHeaders(apiData),
    hblList,
  };
};

/*  Link HBL auto Fill api data  */
export const mapShipmentSummaryToHBL = (shipmentSummary = {}) => {
  const baseHbl = initialHBLValue();
  const partyDetails = Array.isArray(shipmentSummary?.partyDetails)
    ? shipmentSummary.partyDetails
    : [];
  const itemList = ensureLinkedArray(shipmentSummary?.itemList);
  // const containerDetails = ensureLinkedArray(shipmentSummary?.containerDetails);
  const partyDetailsByType = partyDetails.reduce((acc, party) => {
    const normalizedPartyType = normalizeLinkedPartyType(party?.partyType);
    if (!normalizedPartyType || acc[normalizedPartyType]) {
      return acc;
    }

    acc[normalizedPartyType] = party;
    return acc;
  }, {});

  const mapped = {
    ...baseHbl,
    id: shipmentSummary?.id || baseHbl.id,
    generalInfo: {
      ...baseHbl.generalInfo,
      efsAgentCode:
        shipmentSummary?.efsAgentCode ?? shipmentSummary?.agentCode ?? "",
      efsAgentName:
        shipmentSummary?.efsAgentName ?? shipmentSummary?.agentName ?? "",
      hblNo: shipmentSummary?.hblNo || "",
      movementType: shipmentSummary?.movementType || "",
      blType: shipmentSummary?.blType || "",
      // portOfAcceptance: shipmentSummary?.polName || "",
      // portOfAcceptanceId: shipmentSummary?.polId || "",
      // endDestination: shipmentSummary?.podName || "",
      // endDestinationId: shipmentSummary?.podId || "",

      portOfAcceptance: shipmentSummary?.porName || "",
      portOfAcceptanceId: shipmentSummary?.porId || "",
      endDestination: shipmentSummary?.fdcName || "",
      endDestinationId: shipmentSummary?.fdcId || "",
      portOfTranshipment: shipmentSummary?.potName || "",
      portOfTranshipmentId: shipmentSummary?.potId || "",
      shipmentId: shipmentSummary?.shipmentId || "",
      hblShipmentUid:
        shipmentSummary?.shipmentUid ?? "",
    },
    parties:
      partyDetails.length > 0
        ? baseHbl.parties.map((defaultParty) => {
            const matchedParty = partyDetailsByType[defaultParty.partyType];

            if (!matchedParty) {
              return defaultParty;
            }

            return {
              ...defaultParty,
              ...mapParty({
                ...matchedParty,
                partyType: normalizeLinkedPartyType(matchedParty.partyType),
              }),
              id: null,
            };
          })
        : baseHbl.parties,

    // containers:
    //   containerDetails.length > 0
    //     ? mapLinkedContainerDetails(containerDetails)
    //     : [...baseHbl.containers],

    items:
      itemList.length > 0 ? mapLinkedItemList(itemList) : [...baseHbl.items],
  };

  return mapped;
};
/*   Post methods parameter  */

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const isNil = (value) => value === undefined || value === null || value === "";
const toNull = (value) => (isNil(value) ? null : value);
const toNumberOrNull = (value) => {
  if (isNil(value)) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};
const toPersistedIdOrNull = (value, allowExistingIds = false) =>
  allowExistingIds ? toNumberOrNull(value) : null;
const normalizeContainerNo = (containerNo) => {
  return normalizeContainerNumberList(containerNo);
};

const hasText = (value) => Boolean(String(value ?? "").trim());

const pickIdWhenFieldPresent = (fieldValue, ...idCandidates) => {
  if (!hasText(fieldValue)) return null;
  return toNumberOrNull(pickFirst(...idCandidates));
};

const hasMasterContainerHeaderData = (header = {}) =>
  hasText(header?.containerNoHeader) ||
  hasText(header?.containerCodeHeader) ||
  hasText(header?.containerStatusHeader) ||
  hasText(header?.shipperSealHeader) ||
  hasText(header?.carrierSealHeader) ||
  hasText(header?.customsSealHeader) ||
  hasText(header?.sealingPartyNameHeader) ||
  hasText(header?.temperatureHeader) ||
  hasText(header?.unitCodeHeader) ||
  header?.reeferCargoHeader === true ||
  header?.dangerousGoodsHeader === true;

const mapFormikMasterContainerHeaderToApi = (
  header = {},
  allowExistingIds = false,
) => ({
  id: toPersistedIdOrNull(header?.id, allowExistingIds),
  containerId: pickIdWhenFieldPresent(
    pickFirst(header?.containerCodeHeader, header?.containerNoHeader),
    header?.containerIdHeader,
  ),
  containerCode: toNull(header?.containerCodeHeader),
  containerNo: toNull(header?.containerNoHeader),
  containerStatus: toNull(header?.containerStatusHeader),
  shipperSeal: toNull(header?.shipperSealHeader),
  shipperSealType: toNull(header?.shipperSealTypeHeader),
  carrierSeal: toNull(header?.carrierSealHeader),
  carrierSealType: toNull(header?.carrierSealTypeHeader),
  customsSeal: toNull(header?.customsSealHeader),
  customsSealType: toNull(header?.customsSealTypeHeader),
  sealingPartyName: toNull(header?.sealingPartyNameHeader),
  reeferCargo: Boolean(header?.reeferCargoHeader),
  dangerousGoods: Boolean(header?.dangerousGoodsHeader),
  temperatureCode: toNull(header?.temperatureHeader),
  unitCode: toNull(header?.unitCodeHeader),
});

const normalizeExistingBL = (bl = {}, allowExistingIds = false) => ({
  ...bl,
  id: toPersistedIdOrNull(bl?.id, allowExistingIds),
  itemList: ensureArray(bl?.itemList).map((item) => ({
    ...item,
    id: toPersistedIdOrNull(item?.id, allowExistingIds),
    blId: toPersistedIdOrNull(item?.blId, allowExistingIds),
  })),
  partyDetails: ensureArray(bl?.partyDetails).map((party) => ({
    ...party,
    id: toPersistedIdOrNull(party?.id, allowExistingIds),
    blId: toPersistedIdOrNull(party?.blId, allowExistingIds),
  })),
  containerDetails: ensureArray(bl?.containerDetails).map((container) => ({
    ...container,
    id: toPersistedIdOrNull(container?.id, allowExistingIds),
  })),
});

// post party details

const mapFormikPartyToApi = (
  party = {},
  blId = null,
  allowExistingIds = false,
) => {
  return {
    id: toPersistedIdOrNull(party.id, allowExistingIds),
    blId,
    email: toNull(party.email),
    phone: toNull(party.phone || party.mobile),
    poBox: toNull(party.poBox),
    taxId: toNull(party.taxId || party.taxID),
    cityId: pickIdWhenFieldPresent(party.cityName, party.cityId),
    mobile: toNull(party.mobile),
    stateId: pickIdWhenFieldPresent(party.stateName, party.stateId),
    cityName: toNull(party.cityName),
    countryId: pickIdWhenFieldPresent(party.countryName, party.countryId),
    partyName: toNull(party.partyName),
    partyType: toNull(party.partyType),
    qualifier: toNull(party.qualifier),
    stateCode: toNull(party.stateCode),
    stateName: toNull(party.stateName),
    contactName: toNull(party.contactName),
    countryCode: toNull(party.countryCode),
    countryName: toNull(party.countryName),
    address: toNull(party.address),
    identifierNo: toNull(party.identifierNo),
    contactDetail: toNull(party.contactDetail),
    buildingNoName: toNull(party.buildingNoName),
    contactPartyType: toNull(party.contactPartyType),
  };
};

//  post container details
const mapFormikContainerToApi = (container = {}, allowExistingIds = false) => {
  return {
    id: toPersistedIdOrNull(container.id, allowExistingIds),
    piece: toNull(container.piece || container.numberOfPackages),

    weight: toNull(container.weight),
    unitCode: toNull(container.unitCode),

    carrierSeal: toNull(container.carrierSeal),
    containerId: pickIdWhenFieldPresent(
      container.containerCode,
      container.containerId,
    ),

    // containerNo: normalizeContainerNo(container.containerNo),
    containerNo: normalizeContainerNo(container.containerNo).join(","),
    customsSeal: toNull(container.customsSeal),
    reeferCargo: Boolean(container.reeferCargo),
    shipperSeal: toNull(container.shipperSeal),
    temperature: toNull(container.temperature),
    containerCode: toNull(container.containerCode),
    newVesselName: toNull(container.newVesselName),
    dangerousGoods: Boolean(container.dangerousGoods),
    carrierSealType: toNull(container.carrierSealType),
    containerStatus: toNull(container.containerStatus), //
    customsSealType: toNull(container.customsSealType),
    newVoyageNumber: toNull(container.newVoyageNumber),
    packageTypeName: toNull(container.packageTypeName),
    packageTypeId: pickIdWhenFieldPresent(
      container.packageTypeName,
      container.packageTypeId,
    ),
    shipperSealType: toNull(container.shipperSealType),
    temperatureCode: toNull(container.temperatureCode),
    newSplitBlNumber: toNull(container.newSplitBlNumber),
    sealingPartyName: toNull(container.sealingPartyName),
    newParentBlNumber: toNull(container.newParentBlNumber),
    removeContainerSplit: toNull(container.removeContainerSplit),
    handlingInstructionName: toNull(container.handlingInstructionName),
    handlingInstructionId: pickIdWhenFieldPresent(
      container.handlingInstructionName,
      container.handlingInstructionId,
    ),
  };
};

// post item details
const mapFormikItemToApi = (
  item = {},
  blId = null,
  allowExistingIds = false,
) => {
  const normalizedHsCodes = normalizeHsCodeArray(item.hsCode);
  const normalizedHsIds = normalizeIdArray(item.hsId);

  return {
    id: toPersistedIdOrNull(item.id, allowExistingIds),
    blId,
    hsId: normalizedHsIds,
    hsCode: normalizedHsCodes,
    unCode: toNull(item.unCode),
    imoClass: toNull(item.imoClass),
    volumeMtq: toNull(item.volumeMtq),
    containerNo: normalizeContainerNo(item.containerNo),
    packageTypeId: pickIdWhenFieldPresent(
      item.packageTypeName,
      item.packageTypeId,
    ),
    cargoNetWeight: toNull(item.cargoNetWeight),
    itemDescription: toNull(item.itemDescription),
    marksAndNumbers: toNull(item.marksAndNumbers),
    packageTypeName: toNull(item.packageTypeName),
    cargoGrossWeight: toNull(item.cargoGrossWeight),
    numberOfPackages: toNull(item.numberOfPackages),
    countryOfOriginId: pickIdWhenFieldPresent(
      item.countryOfOriginName,
      item.countryOfOriginId,
    ),
    countryOfOriginName: toNull(item.countryOfOriginName),
    packingDescriptionId: pickIdWhenFieldPresent(
      item.packingRelatedDescCode,
      item.packingDescriptionId,
    ),
    markingInstructionId: pickIdWhenFieldPresent(
      item.markingInstructionName,
      item.markingInstructionId,
    ),
    markingInstructionName: toNull(item.markingInstructionName),
    packingDescriptionName: toNull(item.packingRelatedDescCode),
  };
};

// post general info and details
const mapFormikHblToBlDetails = (
  hbl = {},
  routedName = "",
  routedId = null,
  firstPortLoadingName = "",
  firstPortLoadingId = "",
  portOfDischargeName = "",
  portOfDischargeId = "",
  allowExistingIds = false,
) => {
  const generalInfo = hbl?.generalInfo || {};
  const parties = dedupePartiesByType(ensureArray(hbl?.parties));
  const containers = ensureArray(hbl?.containers);
  const items = ensureArray(hbl?.items);
  const filingAttachments = ensureArray(generalInfo?.filingAttachments);
  const blId = toPersistedIdOrNull(hbl?.id, allowExistingIds);

  return {
    // id: blId || null,
    // id: null,
    id: blId,
    pot: null,
    type: "",
    hblNo: toNull(generalInfo.hblNo),
    trade: toNull(generalInfo.trade),
    blDate: toNull(generalInfo.blDate),
    blType: toNull(generalInfo.blType),
    weight: null,
    emirate: toNull(generalInfo.emirate),

    fdcName: toNull(generalInfo.endDestination), //End Destination
    fdcId: pickIdWhenFieldPresent(
      generalInfo.endDestination,
      generalInfo.endDestinationId,
    ), //End Destination

    // podName: null,   // Port of Discharge
    podName: toNull(portOfDischargeName), // Port of Discharge
    podId: pickIdWhenFieldPresent(portOfDischargeName, portOfDischargeId),
    // podId: null,

    polName: toNull(firstPortLoadingName), // First Port Of Loading
    // polName: null,  // First Port Of Loading
    polId: pickIdWhenFieldPresent(firstPortLoadingName, firstPortLoadingId),
    // polId: null,

    porName: toNull(generalInfo.portOfAcceptance), // Port Of Acceptance
    porId: pickIdWhenFieldPresent(
      generalInfo.portOfAcceptance,
      generalInfo.portOfAcceptanceId,
    ),

    potName: toNull(generalInfo.portOfTranshipment), // Port Of Transhipment
    // potName: toNull(pickFirst(portOfTranshipmentMeta?.portName)),
    potId: pickIdWhenFieldPresent(
      generalInfo.portOfTranshipment,
      generalInfo.portOfTranshipmentId,
    ),

    remarks: toNull(generalInfo.remarks),
    currency: toNull(generalInfo.currency),
    currencyId: pickIdWhenFieldPresent(
      generalInfo.currencyName,
      generalInfo.currencyId,
    ),
    itemList: items.map((item) =>
      mapFormikItemToApi(item, blId, allowExistingIds),
    ),
    quantity: toNull(
      items[0]?.numberOfPackages || containers[0]?.numberOfPackages,
    ),
    cargoType: toNull(generalInfo.cargoType),
    // actionCode: normalizeApiActionCode(generalInfo.actionCode),
    actionCode: generalInfo.actionCode,
    delegation: null,
    weightUnit: null,
    filingParty: null,
    liableParty: null,
    // currencyName: pickIdWhenFieldPresent(
    //   generalInfo.currencyName,
    //   generalInfo.currencyCode,
    //   generalInfo.currencyName,
    // ),
    currencyName: toNull(generalInfo.currencyName),
    movementType: toNull(generalInfo.movementType),
    routedId,
    routedName,
    hblShipmentUid: toNull(generalInfo.hblShipmentUid),
    hblShipmentId: toNull(generalInfo.shipmentId),
    efsAgentCode: toNull(generalInfo.efsAgentCode),
    efsAgentName: toNull(generalInfo.efsAgentName),
    information: generalInfo.information || false,
    attachment: filingAttachments.length > 0,
    partyDetails: parties.map((party) =>
      mapFormikPartyToApi(party, blId, allowExistingIds),
    ),
    amendmentType: toNull(generalInfo.amendmentType),
    filingRemarks: toNull(generalInfo.filingRemarks),
    futureChildBl: toNull(generalInfo.futureChildBl),
    invoiceAmount: toNull(generalInfo.invoiceAmount),
    parentBlNumber: toNull(generalInfo.parentBlNumber),
    // packageTypeName: toNull(
    //   items[0]?.packageTypeName || containers[0]?.packageTypeName,
    // ),
    packageTypeName: null,
    containerDetails: containers.map((container) =>
      mapFormikContainerToApi(container, allowExistingIds),
    ),
    freightPaymentType: toNull(generalInfo.freightPaymentType),
    serviceRequirement: toNull(generalInfo.serviceRequirement),
    // liableUAEPartyMPCIId: toNull(generalInfo.liablePartyMpciId),
    liableUaePartyMpciId: toNull(generalInfo.liablePartyMpciId),
    placeOfBillIssueName: toNull(generalInfo.placeOfBillIssueName),
    placeOfBillIssueId: pickIdWhenFieldPresent(
      generalInfo.placeOfBillIssueName,
      generalInfo.placeOfBillIssueId,
    ),
    parentBlIssuerPartyName: toNull(generalInfo.parentBlIssuerPartyName),
    parentBlIssuerPartyMpciId: toNull(generalInfo.parentBlIssuerPartyMpciId),
    placeOfFreightPaymentName: toNull(generalInfo.placeOfFreightPaymentName),
    placeOfFreightPaymentId: pickIdWhenFieldPresent(
      generalInfo.placeOfFreightPaymentName,
      generalInfo.placeOfFreightPaymentId,
    ),
    splitBl: toNull(generalInfo.splitBl),
    originalNo: toNull(generalInfo.originalNo),
    // filingPartyMpciID: toNull(generalInfo.filingPartyMpciID),
  };
};

export const buildPostHeaderPayload = (payload = {}, loginUserData = {}) => {
  const routedName = loginUserData?.customerRole || "";
  const routedId = loginUserData?.customers?.[0]?.customerCode || "";
  const source = payload?.formData || payload;
  const resolvedMasterId = toNumberOrNull(
    payload?.masterId ?? source?.masterId,
  );
  const allowExistingIds = resolvedMasterId !== null;
  const normalizedMasterContainerDetails = ensureArray(source?.containerHeaders)
    .filter(hasMasterContainerHeaderData)
    .map((header) =>
      mapFormikMasterContainerHeaderToApi(header, allowExistingIds),
    );
  const hasBLDetails = ensureArray(source?.blDetailsList).length > 0;
  const normalizedBLDetails = hasBLDetails
    ? ensureArray(source?.blDetailsList).map((bl) =>
        normalizeExistingBL(bl, allowExistingIds),
      )
    : ensureArray(source?.hblList).map((hbl) =>
        mapFormikHblToBlDetails(
          hbl,
          routedName,
          routedId,
          source?.firstPortLoadingName,
          source?.firstPortLoadingId,
          source?.portOfDischargeName,
          source?.portOfDischargeId,
          allowExistingIds,
        ),
      );
  return {
    eta: toNull(source?.eta),
    etd: toNull(source?.etd),
    obl: toNull(source?.obl),
    mblNo: toNull(source?.mblNo),
    onbehalfAgentCode: toNull(source?.efsAgentCodeField),
    onbehalfAgentName: toNull(source?.efsAgentNameField),
    // agentCode: toNull(source?.efsAgentCodeField),
    // agentName: toNull(source?.efsAgentNameField),
    origin: toNull(source?.origin || source?.firstPortLoadingName),
    masterId: resolvedMasterId,
    vesselId: pickIdWhenFieldPresent(source?.vesselName, source?.vesselId),
    voyageNo: toNull(source?.voyageNo),
    cargoType: toNull(source?.cargoType),
    carrierId: pickIdWhenFieldPresent(source?.carrierName, source?.carrierId),
    // carrierCode: pickIdWhenFieldPresent(
    //   source?.carrierName,
    //   source?.carrierCode,
    // ),
    carrierCode: toNull(source?.carrierCode),
    carrierMpciCode: toNull(source?.carrierMpciCode),
    // filingFor: normalizeApiFilingFor(source?.filingFor || source?.filingfor),
    filingFor: source?.filingfor,
    // actionCode: normalizeApiActionCode(source?.actionCode),
    actionCode: source?.actionCode,
    // filingType: normalizeApiFilingType(source?.filingType),
    filingType: source?.filingType,
    vesselName: toNull(source?.vesselName),
    carrierName: toNull(source?.carrierName),
    destination: toNull(source?.destination || source?.portOfDischargeName),
    blDetailsList: normalizedBLDetails,
    individualForm: toNull(source?.individualForm || "Yes"),
    filingPartyMpciId: toNull(
      source?.filingPartyMpciId || source?.filingPartyMpciID,
    ),
    lastForeignPortId: pickIdWhenFieldPresent(
      source?.lastForeignPortName,
      source?.lastForeignPortId,
    ),
    liablePartyMpciId: toNull(source?.liablePartyMpciId),
    portOfDischargeId: pickIdWhenFieldPresent(
      source?.portOfDischargeName,
      source?.portOfDischargeId,
    ),
    vesselCountryCode: toNumberOrNull(pickFirst(source?.vesselCountryCode)),
    vesselCountryName: toNull(source?.vesselCountryName),
    vesselCountryId: pickIdWhenFieldPresent(
      source?.vesselCountryName,
      source?.vesselCountryId,
    ),
    firstPortLoadingId: pickIdWhenFieldPresent(
      source?.firstPortLoadingName,
      source?.firstPortLoadingId,
    ),
    lastForeignPortName: toNull(source?.lastForeignPortName),
    portOfDischargeName: toNull(source?.portOfDischargeName),
    firstPortLoadingName: toNull(source?.firstPortLoadingName),
    masterContainerDetails: normalizedMasterContainerDetails,
  };
};

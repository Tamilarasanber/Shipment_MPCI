import { initialHBLValue } from "../InitialValues/initialHBLValue";
import { initialHBLContainerValue } from "../InitialValues/initialHBLContainerValue";
import { initialHBLItemValue } from "../InitialValues/initialHBLItemValue";
import {
  getPrimaryContainerNumber,
  mapContainerToHeaderValue,
} from "../utils/containerHeaderUtils";

const isPresent = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

const setIfPresent = (target, key, value) => {
  if (isPresent(value)) {
    target[key] = value;
  }
};

const isMasterFieldObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.prototype.hasOwnProperty.call(value, "status");

const flattenMaster = (field) => {
  if (!isMasterFieldObject(field)) {
    return { name: field ?? "", id: "" };
  }
  return {
    name: field.value ?? "",
    id: field.id ?? "",
  };
};

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  return isPresent(value) ? [String(value).trim()] : [];
};

const mapGeneralInfo = (generalInfo = {}) => {
  const mapped = {};

  setIfPresent(mapped, "hblNo", generalInfo.hblNo);
  setIfPresent(mapped, "movementType", generalInfo.movementType);
  setIfPresent(mapped, "blType", generalInfo.blType);
  setIfPresent(mapped, "cargoType", generalInfo.cargoType);
  setIfPresent(mapped, "filingPartyMpciID", generalInfo.filingPartyMpciID);
  setIfPresent(mapped, "splitBl", generalInfo.splitBl);
  setIfPresent(mapped, "originalNo", generalInfo.originalNo);

  const portOfAcceptance = flattenMaster(generalInfo.portOfAcceptance);
  setIfPresent(mapped, "portOfAcceptance", portOfAcceptance.name);
  setIfPresent(mapped, "portOfAcceptanceId", portOfAcceptance.id);

  const endDestination = flattenMaster(generalInfo.endDestination);
  setIfPresent(mapped, "endDestination", endDestination.name);
  setIfPresent(mapped, "endDestinationId", endDestination.id);

  return mapped;
};

const mapPartyFields = (party = {}) => {
  const mapped = {};
  setIfPresent(mapped, "partyName", party.partyName);
  setIfPresent(mapped, "address", party.address);
  setIfPresent(mapped, "cityName", party.cityName);

  const country = flattenMaster(party.countryName);
  setIfPresent(mapped, "countryName", country.name);
  setIfPresent(mapped, "countryId", country.id);

  return mapped;
};

const mapContainerFields = (container = {}) => {
  const base = initialHBLContainerValue();
  const mapped = { ...base, id: base.id };

  const containerCode = flattenMaster(container.containerCode);
  setIfPresent(mapped, "containerCode", containerCode.name);
  setIfPresent(mapped, "containerId", containerCode.id);

  const containerNo = toStringArray(container.containerNo);
  if (containerNo.length) mapped.containerNo = containerNo;

  setIfPresent(mapped, "containerStatus", container.containerStatus);
  setIfPresent(mapped, "carrierSeal", container.carrierSeal);
  setIfPresent(mapped, "temperature", container.temperature);
  if (isPresent(container.temperature)) {
    mapped.temperatureCode = container.temperature;
  }
  setIfPresent(mapped, "unitCode", container.unitCode);

  if (typeof container.reeferCargo === "boolean") {
    mapped.reeferCargo = container.reeferCargo;
  }
  if (typeof container.dangerousGoods === "boolean") {
    mapped.dangerousGoods = container.dangerousGoods;
  }

  return mapped;
};

const mapItemFields = (item = {}) => {
  const base = initialHBLItemValue();
  const mapped = { ...base };

  const containerNo = toStringArray(item.containerNo);
  if (containerNo.length) mapped.containerNo = containerNo;

  const hsCode = toStringArray(item.hsCode);
  if (hsCode.length) mapped.hsCode = hsCode;

  setIfPresent(mapped, "numberOfPackages", item.numberOfPackages);
  setIfPresent(mapped, "cargoGrossWeight", item.cargoGrossWeight);
  setIfPresent(mapped, "itemDescription", item.itemDescription);
  setIfPresent(mapped, "marksAndNumbers", item.marksAndNumbers);
  setIfPresent(mapped, "unCode", item.unCode);
  setIfPresent(mapped, "imoClass", item.imoClass);

  const packageType = flattenMaster(item.packageTypeName);
  setIfPresent(mapped, "packageTypeName", packageType.name);
  setIfPresent(mapped, "packageTypeId", packageType.id);

  return mapped;
};

/**
 * Maps a reviewed PDF editedData model into a Formik hblList entry.
 * Used when the user confirms Validate in the PDF extraction modal.
 */
export const mapReviewedPdfToHBL = (editedData = {}) => {
  const base = initialHBLValue();
  const clientId = crypto.randomUUID();

  const generalInfo = {
    ...base.generalInfo,
    ...mapGeneralInfo(editedData.generalInfo),
  };

  const extractedParties = Array.isArray(editedData.parties) ? editedData.parties : [];
  const partyDetailsByType = extractedParties.reduce((acc, party) => {
    const partyType = String(party?.partyType ?? "").trim();
    if (partyType) acc[partyType] = party;
    return acc;
  }, {});

  const parties = base.parties.map((defaultParty) => {
    const matchedParty = partyDetailsByType[defaultParty.partyType];
    if (!matchedParty) return defaultParty;

    return {
      ...defaultParty,
      ...mapPartyFields(matchedParty),
      partyType: defaultParty.partyType,
      id: defaultParty.id,
    };
  });

  const apiContainers = Array.isArray(editedData.containers)
    ? editedData.containers
    : [];
  const containers = apiContainers.length
    ? apiContainers.map(mapContainerFields)
    : base.containers;

  const apiItems = Array.isArray(editedData.items) ? editedData.items : [];
  const items = apiItems.length ? apiItems.map(mapItemFields) : base.items;

  return {
    ...base,
    clientId,
    id: clientId,
    generalInfo,
    parties,
    containers,
    items,
  };
};

export const mapReviewedPdfsToHblList = (reviewedFiles = []) =>
  (Array.isArray(reviewedFiles) ? reviewedFiles : []).map((file) =>
    mapReviewedPdfToHBL(file?.editedData),
  );

/**
 * Registers PDF container numbers into filing-level containerHeaders so the
 * container/item dropdowns and sync bridges keep the mapped values.
 */
export const buildContainerHeadersFromHbls = (
  hbls = [],
  existingHeaders = [],
) => {
  const seen = new Set();
  const merged = [];

  (Array.isArray(existingHeaders) ? existingHeaders : []).forEach((header) => {
    const containerNo = String(header?.containerNoHeader ?? "").trim();
    if (containerNo) {
      if (seen.has(containerNo)) return;
      seen.add(containerNo);
      merged.push(header);
      return;
    }
    merged.push(header);
  });

  (Array.isArray(hbls) ? hbls : []).forEach((hbl) => {
    const containers = Array.isArray(hbl?.containers) ? hbl.containers : [];
    containers.forEach((container) => {
      const containerNo = getPrimaryContainerNumber(container?.containerNo);
      if (!containerNo || seen.has(containerNo)) return;

      seen.add(containerNo);
      merged.push(mapContainerToHeaderValue(container));
    });
  });

  const hasRealHeaders = merged.some((header) =>
    String(header?.containerNoHeader ?? "").trim(),
  );

  if (hasRealHeaders) {
    return merged.filter((header) =>
      String(header?.containerNoHeader ?? "").trim(),
    );
  }

  return merged.length ? merged : existingHeaders;
};

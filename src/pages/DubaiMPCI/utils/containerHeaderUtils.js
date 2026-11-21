import { initialContainerHeaderValue } from "../InitialValues/initialContainerHeaderValue";

export const CONTAINER_HEADER_FIELD_MAP = {
  containerCode: "containerCodeHeader",
  containerId: "containerIdHeader",
  containerNo: "containerNoHeader",
  containerStatus: "containerStatusHeader",
  shipperSeal: "shipperSealHeader",
  shipperSealType: "shipperSealTypeHeader",
  carrierSeal: "carrierSealHeader",
  carrierSealType: "carrierSealTypeHeader",
  customsSeal: "customsSealHeader",
  customsSealType: "customsSealTypeHeader",
  sealingPartyName: "sealingPartyNameHeader",
  reeferCargo: "reeferCargoHeader",
  temperature: "temperatureHeader",
  unitCode: "unitCodeHeader",
  dangerousGoods: "dangerousGoodsHeader",
};

export const normalizeContainerNumberList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }

  const normalizedValue = String(value ?? "").trim();
  return normalizedValue ? [normalizedValue] : [];
};

export const getPrimaryContainerNumber = (value) =>
  normalizeContainerNumberList(value)[0] || "";

export const formatContainerNumberValue = (value) =>
  normalizeContainerNumberList(value).join(", ");

export const mapContainerToHeaderValue = (container = {}) => ({
  ...initialContainerHeaderValue(),
  id: container.id ?? crypto.randomUUID(),
  containerCodeHeader: container.containerCode ?? "",
  containerIdHeader: container.containerId ?? "",
  containerNoHeader: getPrimaryContainerNumber(container.containerNo),
  containerStatusHeader: container.containerStatus ?? "",
  shipperSealHeader: container.shipperSeal ?? "",
  shipperSealTypeHeader: container.shipperSealType ?? "",
  carrierSealHeader: container.carrierSeal ?? "",
  carrierSealTypeHeader: container.carrierSealType ?? "",
  customsSealHeader: container.customsSeal ?? "",
  customsSealTypeHeader: container.customsSealType ?? "",
  sealingPartyNameHeader: container.sealingPartyName ?? "",
  reeferCargoHeader: Boolean(container.reeferCargo),
  temperatureHeader: container.temperatureCode ?? container.temperature ?? "",
  unitCodeHeader: container.unitCode ?? "",
  dangerousGoodsHeader: Boolean(container.dangerousGoods),
});

export const buildContainerHeaderOptions = (containerHeaders = []) => {
  const seen = new Set();

  return containerHeaders.reduce((options, header) => {
    const containerNo = String(header?.containerNoHeader ?? "").trim();
    if (!containerNo || seen.has(containerNo)) {
      return options;
    }

    seen.add(containerNo);
    options.push({
      label: containerNo,
      value: containerNo,
    });
    return options;
  }, []);
};

export const buildContainerHeaderIndex = (containerHeaders = []) =>
  containerHeaders.reduce((accumulator, header) => {
    const containerNo = String(header?.containerNoHeader ?? "").trim();
    if (!containerNo) {
      return accumulator;
    }

    accumulator[containerNo] = header;
    return accumulator;
  }, {});

export const getContainerAutofillValue = (header = {}, containerNoValue = []) =>
  Object.entries(CONTAINER_HEADER_FIELD_MAP).reduce(
    (accumulator, [containerField, headerField]) => {
      if (containerField === "containerNo") {
        accumulator[containerField] = normalizeContainerNumberList(
          containerNoValue,
        );
        return accumulator;
      }

      accumulator[containerField] = header?.[headerField] ?? "";
      return accumulator;
    },
    {},
  );

export const getEmptyContainerAutofillValue = () =>
  getContainerAutofillValue(undefined, []);

export const getContainerNumberSnapshot = (containers = []) =>
  (Array.isArray(containers) ? containers : []).map((container) =>
    getPrimaryContainerNumber(container?.containerNo),
  );

// One selected container number is always the value every item should show.
// With several containers, only the number the user just changed is applied,
// so a later edit updates item 0 as well as the later items.
export const getLatestContainerNumberForItems = (
  containerNumbers = [],
  previousNumbers,
) => {
  const uniqueNumbers = [];
  const seen = new Set();

  containerNumbers.forEach((containerNumber) => {
    if (!containerNumber || seen.has(containerNumber)) return;
    seen.add(containerNumber);
    uniqueNumbers.push(containerNumber);
  });

  if (uniqueNumbers.length === 1) return uniqueNumbers[0];
  if (!Array.isArray(previousNumbers) || !previousNumbers.some(Boolean)) {
    return "";
  }

  let latestChangedNumber = "";
  const length = Math.max(containerNumbers.length, previousNumbers.length);

  for (let index = 0; index < length; index += 1) {
    const nextNumber = containerNumbers[index] || "";
    const previousNumber = previousNumbers[index] || "";
    if (nextNumber && nextNumber !== previousNumber) {
      latestChangedNumber = nextNumber;
    }
  }

  return latestChangedNumber;
};

export const applyContainerNumberToItems = (items = [], containerNo = "") => {
  if (!containerNo) return items;

  const sourceItems = Array.isArray(items) ? items : [];
  let hasChanges = false;

  const nextItems = sourceItems.map((item) => {
    const currentNumbers = normalizeContainerNumberList(item?.containerNo);
    if (currentNumbers.length === 1 && currentNumbers[0] === containerNo) {
      return item;
    }

    hasChanges = true;
    return {
      ...item,
      containerNo: [containerNo],
    };
  });

  return hasChanges ? nextItems : sourceItems;
};

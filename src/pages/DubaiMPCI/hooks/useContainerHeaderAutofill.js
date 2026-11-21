import { useMemo } from "react";
import {
  CONTAINER_HEADER_FIELD_MAP,
  buildContainerHeaderIndex,
  buildContainerHeaderOptions,
  getContainerAutofillValue,
} from "../utils/containerHeaderUtils";

export const getSingleContainerNo = (containerHeaders = []) => {
  const containerOptions = buildContainerHeaderOptions(containerHeaders);
  if (containerOptions.length !== 1) {
    return "";
  }

  return String(containerOptions[0]?.value ?? "").trim();
};

export const hasContainerAutofillChanges = (currentContainer, nextContainer) => {
  const fieldsToCompare = [
    "containerNo",
    ...Object.keys(CONTAINER_HEADER_FIELD_MAP).filter(
      (field) => field !== "containerNo",
    ),
  ];

  return fieldsToCompare.some((field) => {
    const currentValue = currentContainer?.[field];
    const nextValue = nextContainer?.[field];

    if (Array.isArray(currentValue) || Array.isArray(nextValue)) {
      const normalizedCurrent = Array.isArray(currentValue) ? currentValue : [];
      const normalizedNext = Array.isArray(nextValue) ? nextValue : [];

      return (
        normalizedCurrent.length !== normalizedNext.length ||
        normalizedCurrent.some((value, index) => value !== normalizedNext[index])
      );
    }

    return currentValue !== nextValue;
  });
};

export const hydrateNewHblWithContainerHeader = (hbl = {}, containerHeaders = []) => {
  const containerNo = getSingleContainerNo(containerHeaders);
  if (!containerNo) {
    return hbl;
  }

  const firstHeader = containerHeaders.find(
    (header) => String(header?.containerNoHeader ?? "").trim() === containerNo,
  );

  if (!firstHeader) {
    return hbl;
  }

  const nextContainers = (Array.isArray(hbl?.containers) ? hbl.containers : []).map(
    (container, index) =>
      index === 0
        ? {
            ...container,
            ...getContainerAutofillValue(firstHeader, [containerNo]),
          }
        : container,
  );

  const nextItems = (Array.isArray(hbl?.items) ? hbl.items : []).map((item) => ({
    ...item,
    containerNo: [containerNo],
  }));

  return {
    ...hbl,
    containers: nextContainers,
    items: nextItems,
  };
};

const useContainerHeaderAutofill = (containerHeaders = []) => {
  const containerOptions = useMemo(
    () => buildContainerHeaderOptions(containerHeaders),
    [containerHeaders],
  );
  const containerOptionValues = useMemo(
    () => containerOptions.map((option) => option.value),
    [containerOptions],
  );
  const containerHeaderIndex = useMemo(
    () => buildContainerHeaderIndex(containerHeaders),
    [containerHeaders],
  );
  const containerOptionValuesKey = containerOptionValues.join("|");
  const singleContainerNo = useMemo(
    () => getSingleContainerNo(containerHeaders),
    [containerHeaders],
  );

  return {
    containerHeaderIndex,
    containerOptionValuesKey,
    singleContainerNo,
  };
};

export default useContainerHeaderAutofill;

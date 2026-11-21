import { useEffect, useRef, useState } from "react";
import { useFormikContext } from "formik";
import {
  applyContainerNumberToItems,
  getContainerAutofillValue,
  getContainerNumberSnapshot,
  getEmptyContainerAutofillValue,
  getLatestContainerNumberForItems,
} from "../utils/containerHeaderUtils";
import useContainerHeaderAutofill, {
  hasContainerAutofillChanges,
} from "../hooks/useContainerHeaderAutofill";

const getHblSyncKey = (hbl, hblIndex) =>
  String(hbl?.clientId || hbl?.id || hblIndex);

const ContainerHeaderSyncBridge = () => {
  const { setFieldValue, setValues, validateForm, values } = useFormikContext();
  const [syncValidationVersion, setSyncValidationVersion] = useState(0);
  const previousContainerNumbersRef = useRef({});
  const hblSyncRef = useRef([]);

  const containerHeaders = Array.isArray(values?.containerHeaders)
    ? values.containerHeaders
    : [];
  const { containerHeaderIndex, containerOptionValuesKey, singleContainerNo } =
    useContainerHeaderAutofill(containerHeaders);
  const hblList = Array.isArray(values?.hblList) ? values.hblList : [];
  const containerNumberKey = hblList
    .map((hbl) => getContainerNumberSnapshot(hbl?.containers).join(","))
    .join("||");

  hblSyncRef.current = hblList.map((hbl, hblIndex) => ({
    key: getHblSyncKey(hbl, hblIndex),
    numbers: getContainerNumberSnapshot(hbl?.containers),
    items: Array.isArray(hbl?.items) ? hbl.items : [],
  }));

  useEffect(() => {
    let shouldValidateAfterSync = false;

    setValues((prev) => {
      const prevHblList = Array.isArray(prev?.hblList) ? prev.hblList : [];
      let hasHblChanges = false;

      const nextHblList = prevHblList.map((hbl) => {
        const prevContainers = Array.isArray(hbl?.containers) ? hbl.containers : [];
        let hasContainerChanges = false;

        const nextContainers = prevContainers.map((container, containerIndex) => {
          const currentContainerNos = Array.isArray(container?.containerNo)
            ? container.containerNo
            : [];
          const selectedContainerNo = currentContainerNos[0] || "";
          const fallbackContainerNos =
            !selectedContainerNo && containerIndex === 0 && singleContainerNo
              ? [singleContainerNo]
              : currentContainerNos;
          const headerContainerNo = fallbackContainerNos[0] || "";

          if (!headerContainerNo) {
            return container;
          }

          const selectedHeader = containerHeaderIndex[headerContainerNo];
          const autoFillValues = selectedHeader
            ? getContainerAutofillValue(selectedHeader, fallbackContainerNos)
            : getEmptyContainerAutofillValue();
          const nextContainer = {
            ...container,
            ...autoFillValues,
          };

          if (!hasContainerAutofillChanges(container, nextContainer)) {
            return container;
          }

          hasContainerChanges = true;
          return nextContainer;
        });

        if (!hasContainerChanges) {
          return hbl;
        }

        hasHblChanges = true;
        return {
          ...hbl,
          containers: nextContainers,
        };
      });

      if (!hasHblChanges) {
        return prev;
      }

      shouldValidateAfterSync = true;
      return {
        ...prev,
        hblList: nextHblList,
      };
    }, false);

    if (shouldValidateAfterSync) {
      setSyncValidationVersion((prev) => prev + 1);
    }
  }, [
    containerHeaderIndex,
    containerOptionValuesKey,
    setValues,
    singleContainerNo,
  ]);

  useEffect(() => {
    const nextPreviousContainerNumbers = {};
    let shouldValidateAfterSync = false;

    hblSyncRef.current.forEach((snapshot, hblIndex) => {
      const previousNumbers = Object.prototype.hasOwnProperty.call(
        previousContainerNumbersRef.current,
        snapshot.key,
      )
        ? previousContainerNumbersRef.current[snapshot.key]
        : undefined;
      const latestContainerNo = getLatestContainerNumberForItems(
        snapshot.numbers,
        previousNumbers,
      );

      nextPreviousContainerNumbers[snapshot.key] = snapshot.numbers;
      const nextItems = applyContainerNumberToItems(
        snapshot.items,
        latestContainerNo,
      );

      if (nextItems === snapshot.items) {
        return;
      }

      nextItems.forEach((item, itemIndex) => {
        if (item === snapshot.items[itemIndex]) return;

        shouldValidateAfterSync = true;
        setFieldValue(
          `hblList.${hblIndex}.items.${itemIndex}.containerNo`,
          item.containerNo,
          false,
        );
      });
    });

    previousContainerNumbersRef.current = nextPreviousContainerNumbers;

    if (shouldValidateAfterSync) {
      setSyncValidationVersion((prev) => prev + 1);
    }
  }, [containerNumberKey, setFieldValue]);

  useEffect(() => {
    if (!syncValidationVersion) {
      return;
    }

    void validateForm();
  }, [syncValidationVersion, validateForm]);

  return null;
};

export default ContainerHeaderSyncBridge;

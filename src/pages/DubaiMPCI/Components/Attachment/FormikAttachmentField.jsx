import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Modal,
  Backdrop,
  Fade,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@/components/ui/mui";
import { AttachFileIcon } from "@/components/ui/icons";
import { getIn, useFormikContext } from "formik";
import AttachmentTableManager from "./AttachmentManager";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadMPCIAttachmentRequest,
  deleteMPCIAttachmentRequest,
  updateMPCIAttachmentRequest,
} from "@/redux/actions/dubaiMpciAction";

/*  SAME label renderer used in FormikFields */
// const renderLabel = (label) => <>{label}</>;

const FormikAttachmentField = ({ label, name, formik, required = false }) => {
  const dispatch = useDispatch();
  const formikCtx = useFormikContext();
  const source = formik || formikCtx;
  const { values, setFieldValue } = source;
  const { themeDetails } = useSelector((state) => state.Theme);
  const { loginUserData } = useSelector((state) => state.Login || {});
  const { byBlId = {} } = useSelector(
    (state) => state.DubaiFormFiling?.attachments || {},
  );
  const { data: selectedMPCIDetailsData } = useSelector(
    (state) => state.DubaiFormFiling?.selectedMPCIDetails || {},
  );
  const { lastSavedId } = useSelector(
    (state) => state.DubaiFormFiling?.filing || {},
  );

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);

  const formikValue = getIn(values, name) || [];

  // GET api update in documentType, referenceNo, protectedOrUnprotected, file
  const hblIndex = useMemo(() => {
    const dotMatch = name.match(/hblList\.(\d+)\./);
    if (dotMatch?.[1]) return Number(dotMatch[1]);

    const bracketMatch = name.match(/hblList\[(\d+)\]/);
    if (bracketMatch?.[1]) return Number(bracketMatch[1]);

    return null;
  }, [name]);

  // currentBL id
  const currentBlId = useMemo(() => {
    if (!Number.isFinite(hblIndex)) return null;
    const rawBlId = values?.hblList?.[hblIndex]?.id;
    const normalized = Number(rawBlId);
    return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
  }, [values?.hblList, hblIndex]);

  const fetchedAttachments = useMemo(() => {
    if (!currentBlId) return [];
    const list = byBlId[currentBlId];
    return Array.isArray(list) ? list : [];
  }, [byBlId, currentBlId]);

  const normalizedFetchedRows = useMemo(
    () =>
      fetchedAttachments.map((item, index) => ({
        sno: index + 1,
        id: item?.id ?? null,
        documentType: item?.documentType || "",
        referenceNo: item?.referenceNo || "",
        protectedOrUnprotected: item?.protectedOrUnprotected || "Unprotected",
        file: item?.fileName
          ? {
              name: item.fileName,
              type: item.fileType || "",
              __remote: true,
            }
          : null,
      })),
    [fetchedAttachments],
  );

  const fetchedById = useMemo(() => {
    const map = new Map();
    fetchedAttachments.forEach((item) => {
      const id = Number(item?.id);
      if (Number.isFinite(id) && id > 0) {
        map.set(id, item);
      }
    });
    return map;
  }, [fetchedAttachments]);

  useEffect(() => {
    if (!normalizedFetchedRows.length) return;
    const hasLocalFile = formikValue.some(
      (row) => row?.file instanceof File || row?.file instanceof Blob,
    );
    if (hasLocalFile) return;

    const currentSignature = JSON.stringify(
      formikValue.map((row) => ({
        id: row?.id || null,
        documentType: row?.documentType || "",
        referenceNo: row?.referenceNo || "",
        protectedOrUnprotected: row?.protectedOrUnprotected || "Unprotected",
        fileName: row?.file?.name || "",
      })),
    );
    const fetchedSignature = JSON.stringify(
      normalizedFetchedRows.map((row) => ({
        id: row?.id || null,
        documentType: row?.documentType || "",
        referenceNo: row?.referenceNo || "",
        protectedOrUnprotected: row?.protectedOrUnprotected || "Unprotected",
        fileName: row?.file?.name || "",
      })),
    );

    if (currentSignature !== fetchedSignature) {
      setFieldValue(name, normalizedFetchedRows, false);
    }
  }, [formikValue, name, normalizedFetchedRows, setFieldValue]);

  const handleOpen = () => {
    setDraft(formikValue);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // const handleSave = () => {
  //   setFieldValue(name, draft);
  //   handleClose();
  // };
  const handleSave = () => {
    // check if any row is incomplete
    const hasInvalidRow = draft.some(
      (row) => !row.documentType || !row.referenceNo || !row.file,
    );

    if (hasInvalidRow) {
      alert("Please complete all attachment fields before saving");
      return;
    }

    const actor =
      loginUserData?.userName ||
      loginUserData?.userId ||
      loginUserData?.email ||
      "system";
    const headerId = Number(
      selectedMPCIDetailsData?.masterId ||
        selectedMPCIDetailsData?.id ||
        lastSavedId,
    );
    const hblNo = String(
      values?.hblList?.[hblIndex]?.generalInfo?.hblNo || "",
    ).trim();
    const indexedBlId = Number(values?.hblList?.[hblIndex]?.id);
    const matchedBlId = Array.isArray(selectedMPCIDetailsData?.blDetailsList)
      ? Number(
          selectedMPCIDetailsData.blDetailsList.find(
            (bl) => String(bl?.hblNo || "").trim() === hblNo,
          )?.id,
        )
      : NaN;
    const blId =
      Number.isFinite(indexedBlId) && indexedBlId > 0
        ? indexedBlId
        : Number.isFinite(matchedBlId) && matchedBlId > 0
          ? matchedBlId
          : null;

    if (Number.isFinite(headerId) && headerId > 0 && blId) {
      draft.forEach((row) => {
        const attachmentId = Number(row?.id);
        const hasLocalFile =
          row?.file instanceof File || row?.file instanceof Blob;

        if (Number.isFinite(attachmentId) && attachmentId > 0) {
          const original = fetchedById.get(attachmentId);
          const metadataChanged =
            !original ||
            String(original?.documentType || "") !==
              String(row?.documentType || "") ||
            String(original?.referenceNo || "") !==
              String(row?.referenceNo || "") ||
            String(original?.protectedOrUnprotected || "Unprotected") !==
              String(row?.protectedOrUnprotected || "Unprotected");

          if (!metadataChanged && !hasLocalFile) return;

          dispatch(
            updateMPCIAttachmentRequest({
              attachmentId,
              protectedOrUnprotected:
                row?.protectedOrUnprotected || "Unprotected",
              documentType: row?.documentType || "",
              referenceNo: row?.referenceNo || "",
              blId,
              headerId,
              file: hasLocalFile ? row.file : null,
              createdUser: original?.createdUser || actor,
              updatedUser: actor,
            }),
          );
          return;
        }

        if (hasLocalFile) {
          dispatch(
            uploadMPCIAttachmentRequest({
              protectedOrUnprotected:
                row?.protectedOrUnprotected || "Unprotected",
              documentType: row.documentType,
              referenceNo: row.referenceNo,
              blId,
              headerId,
              file: row.file,
              createdUser: actor,
              updatedUser: actor,
            }),
          );
        }
      });
    }

    setFieldValue(name, draft);
    handleClose();
  };

  const handleDeleteRow = (row) => {
    const attachmentId = Number(row?.id);
    if (!Number.isFinite(attachmentId) || attachmentId <= 0) {
      return true;
    }

    const resolvedBlId =
      Number.isFinite(currentBlId) && currentBlId > 0
        ? currentBlId
        : Number(row?.blId);

    dispatch(
      deleteMPCIAttachmentRequest({
        attachmentId,
        blId:
          Number.isFinite(resolvedBlId) && resolvedBlId > 0
            ? resolvedBlId
            : null,
      }),
    );

    return true;
  };

  const renderLabel = (label, required) => (
    <>
      {label}
      {required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}
    </>
  );

  return (
    <>
      {/*  TextField-style trigger (same height as FormikTextField) */}
      <TextField
        fullWidth
        size="small"
        label={renderLabel(label, required)}
        value={
          formikValue.length ? `${formikValue.length} file(s) attached` : ""
        }
        placeholder="Click to attach files"
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleOpen}>
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onClick={handleOpen}
      />

      {/* MODAL with overlay */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { backgroundColor: "rgba(0,0,0,0.45)" },
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "95%",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 3,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography fontWeight={600} mb={2}>
              Attachments
            </Typography>

            <AttachmentTableManager
              value={draft}
              onChange={setDraft}
              onDeleteRow={handleDeleteRow}
              requiredFields={{
                documentType: true,
                referenceNo: true,
                file: true,
                protectedOrUnprotected: false,
              }}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  textTransform: "none",
                  backgroundColor: themeDetails.buttonColor,
                  "&:hover": { backgroundColor: themeDetails.buttonColor },
                }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default FormikAttachmentField;

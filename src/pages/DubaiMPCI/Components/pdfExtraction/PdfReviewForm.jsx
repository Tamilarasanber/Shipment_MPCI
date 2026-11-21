import { memo, useCallback, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@/components/ui/mui";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePdfReviewField,
  touchPdfReviewField,
} from "@/redux/actions/dubaiMpciAction";
import ReviewMasterField from "./ReviewMasterField";
import {
  isPartyFieldRequired,
  isReviewFieldRequired,
} from "../../pdfExtraction/pdfReviewValidation";
import { stripLineBreaks } from "../../pdfExtraction/reviewModel";
import {
  movementTypeOptions,
  blTypeOptions,
  cargoTypeOptions,
  containerStatusOptions,
  imoClassOptions,
  unitOptions,
} from "../../constants/selectOptions";

// Scoped, filing-relevant subset rendered per section. `master` fields reuse the
// existing master pickers; everything else is a plain text/select input.
const GENERAL_FIELDS = [
  { key: "hblNo", label: "HBL Number", kind: "text", required: true },
  {
    key: "movementType",
    label: "Movement Type",
    kind: "select",
    options: movementTypeOptions,
    required: true,
  },
  {
    key: "blType",
    label: "BL Type",
    kind: "select",
    options: blTypeOptions,
    required: true,
  },
  {
    key: "cargoType",
    label: "Cargo Type",
    kind: "select",
    options: cargoTypeOptions,
    required: true,
  },
  {
    key: "portOfAcceptance",
    label: "Port Of Acceptance",
    kind: "master",
    fieldKey: "generalInfo.portOfAcceptance",
    required: true,
  },
  {
    key: "portOfLoading",
    label: "Port Of Loading",
    kind: "master",
    fieldKey: "generalInfo.portOfLoading",
  },
  {
    key: "portOfDischarge",
    label: "Port Of Discharge",
    kind: "master",
    fieldKey: "generalInfo.portOfDischarge",
  },
  {
    key: "endDestination",
    label: "Port Of End Destination",
    kind: "master",
    fieldKey: "generalInfo.endDestination",
    required: true,
  },
  // { key: "filingPartyMpciID", label: "Filing Party MPCI ID", kind: "text", required: true },
];

const CONTAINER_FIELDS = [
  {
    key: "containerCode",
    label: "Container Code",
    kind: "master",
    fieldKey: "containers.containerCode",
    required: true,
  },
  { key: "containerNo", label: "Container No", kind: "text", required: true },
  {
    key: "containerStatus",
    label: "Container Status",
    kind: "select",
    options: containerStatusOptions,
    required: true,
  },
  { key: "carrierSeal", label: "Carrier Seal", kind: "text" },
];

const ITEM_FIELDS = [
  { key: "hsCode", label: "HS Code", kind: "text", required: true },
  {
    key: "numberOfPackages",
    label: "No. of Packages",
    kind: "text",
    required: true,
  },
  {
    key: "packageTypeName",
    label: "Package Type",
    kind: "master",
    fieldKey: "items.packageTypeName",
    required: true,
  },
  {
    key: "cargoGrossWeight",
    label: "Cargo Gross Weight (KGM)",
    kind: "text",
    required: true,
  },
  {
    key: "itemDescription",
    label: "Item Description",
    kind: "text",
    multiline: true,
    required: true,
  },
  {
    key: "marksAndNumbers",
    label: "Marks & Numbers",
    kind: "text",
    multiline: true,
    required: true,
  },
];

const getByPath = (obj, path) =>
  path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

const pathToKey = (path) => path.join(".");

const accordionSx = {
  disableGutters: true,
  elevation: 0,
  defaultExpanded: true,
  sx: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px !important",
    mb: 1.5,
    "&:before": { display: "none" },
    "&.Mui-expanded": { mb: 1.5 },
  },
};

const ReviewSection = ({ title, children }) => {
  const { themeDetails } = useSelector((state) => state.Theme);

  return (
    <Accordion {...accordionSx}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
        sx={{
          background: themeDetails.AccordionSecondaryBackgroundColor,
          color: "#fff",
          minHeight: 48,
          "&.Mui-expanded": {
            minHeight: 48,
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "inherit",
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
};

const ReviewEntity = ({ label, index, children }) => (
  <Box>
    {index > 0 && <Divider sx={{ my: 2.5 }} />}
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 1.5 }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

const PdfReviewForm = ({
  fileId,
  editedData,
  showErrors = false,
  errorsByPath = {},
  locked = false,
}) => {
  const dispatch = useDispatch();
  // const { themeDetails } = useSelector((state) => state.Theme);

  const getFieldError = useCallback(
    (path) => {
      if (!showErrors) return { error: false, helperText: "" };
      const message = errorsByPath[pathToKey(path)];
      return {
        error: Boolean(message),
        helperText: message || "",
      };
    },
    [errorsByPath, showErrors],
  );

  const handleChange = useCallback(
    (path, value) => {
      if (locked) return;
      const nextValue =
        typeof value === "string" ? stripLineBreaks(value) : value;
      dispatch(updatePdfReviewField({ id: fileId, path, value: nextValue }));
    },
    [dispatch, fileId, locked],
  );

  const handleBlur = useCallback(
    (path) => {
      if (locked) return;
      dispatch(touchPdfReviewField({ id: fileId, path }));
    },
    [dispatch, fileId, locked],
  );

  const handleSplitBlChange = (checked) => {
    handleChange(["generalInfo", "splitBl"], checked ? "Yes" : "No");
    if (!checked) handleChange(["generalInfo", "originalNo"], "");
  };

  const handleReeferCargoChange = useCallback(
    (containerIndex, checked) => {
      handleChange(["containers", containerIndex, "reeferCargo"], checked);
      if (!checked) {
        handleChange(["containers", containerIndex, "temperature"], "");
        handleChange(["containers", containerIndex, "unitCode"], "");
      }
    },
    [handleChange],
  );

  const handleDangerousGoodsChange = useCallback(
    (containerIndex, checked) => {
      handleChange(["containers", containerIndex, "dangerousGoods"], checked);

      if (!checked) {
        const containerNo = String(
          editedData?.containers?.[containerIndex]?.containerNo ?? "",
        ).trim();
        const items = Array.isArray(editedData?.items) ? editedData.items : [];
        items.forEach((item, itemIndex) => {
          const taggedNo = String(item?.containerNo ?? "").trim();
          if (containerNo && taggedNo === containerNo) {
            handleChange(["items", itemIndex, "unCode"], "");
            handleChange(["items", itemIndex, "imoClass"], "");
          }
        });
      }
    },
    [editedData, handleChange],
  );

  // New item rows default to the first container in the extracted document.
  useEffect(() => {
    if (locked) return;

    const defaultContainerNo = String(
      editedData?.containers?.[0]?.containerNo ?? "",
    ).trim();
    if (!defaultContainerNo) return;

    (editedData?.items || []).forEach((item, index) => {
      if (!String(item?.containerNo ?? "").trim()) {
        handleChange(["items", index, "containerNo"], defaultContainerNo);
      }
    });
  }, [editedData?.containers, editedData?.items, handleChange, locked]);

  const handleContainerNoChange = useCallback(
    (containerIndex, value) => {
      const previousValue = String(
        editedData?.containers?.[containerIndex]?.containerNo ?? "",
      ).trim();
      const nextValue = String(value ?? "").trim();

      handleChange(["containers", containerIndex, "containerNo"], value);

      // Keep items that use the first (default) container in sync, without
      // overwriting an item where the user deliberately chose another one.
      if (containerIndex !== 0 || !nextValue) return;

      (editedData?.items || []).forEach((item, itemIndex) => {
        const itemContainerNo = String(item?.containerNo ?? "").trim();
        if (!itemContainerNo || itemContainerNo === previousValue) {
          handleChange(["items", itemIndex, "containerNo"], nextValue);
        }
      });
    },
    [editedData, handleChange],
  );

  const renderField = (field, basePath, options = {}) => {
    const fieldError = getFieldError(basePath);
    const onFieldChange =
      options.onChange || ((value) => handleChange(basePath, value));
    const required =
      options.required ??
      field.required ??
      isReviewFieldRequired(`${basePath[0]}.${field.key}`);

    if (field.kind === "master") {
      const fieldObj = getByPath(editedData, basePath) || {};
      return (
        <ReviewMasterField
          key={`${fileId}-${basePath.join(".")}`}
          fileId={fileId}
          fieldKey={field.fieldKey}
          label={field.label}
          field={fieldObj}
          basePath={basePath}
          required={required}
          error={fieldError.error}
          helperText={fieldError.helperText}
          disabled={locked}
          onBlur={() => handleBlur(basePath)}
        />
      );
    }

    const rawValue = getByPath(editedData, basePath);
    const value =
      rawValue === null || rawValue === undefined ? "" : String(rawValue);

    if (field.kind === "select") {
      return (
        <TextField
          select
          size="small"
          fullWidth
          required={required}
          label={field.label}
          value={value}
          disabled={locked}
          error={fieldError.error}
          helperText={fieldError.helperText}
          onChange={(event) => onFieldChange(event.target.value)}
          onBlur={() => handleBlur(basePath)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {(field.options || []).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        size="small"
        fullWidth
        required={required}
        label={field.label}
        value={value}
        multiline={Boolean(field.multiline)}
        minRows={field.multiline ? (field.minRows ?? 2) : undefined}
        disabled={locked}
        error={fieldError.error}
        helperText={fieldError.helperText}
        onChange={(event) => onFieldChange(event.target.value)}
        onBlur={() => handleBlur(basePath)}
        InputProps={{ readOnly: Boolean(field.readOnly) }}
        sx={
          field.multiline
            ? {
                "& .MuiInputBase-root.MuiInputBase-multiline": {
                  padding: "12px 14px !important",
                },
              }
            : undefined
        }
      />
    );
  };

  if (!editedData) {
    return (
      <Box sx={{ p: 3, color: "text.secondary" }}>
        <Typography variant="body2">
          No extracted data to review for this file yet.
        </Typography>
      </Box>
    );
  }

  const parties = Array.isArray(editedData.parties) ? editedData.parties : [];
  const containers = Array.isArray(editedData.containers)
    ? editedData.containers
    : [];
  const items = Array.isArray(editedData.items) ? editedData.items : [];

  const containerNoOptions = [
    ...new Set(
      containers
        .map((container) => String(container?.containerNo ?? "").trim())
        .filter(Boolean),
    ),
  ];
  const dgContainerNoSet = new Set(
    containers
      .filter((container) => container?.dangerousGoods === true)
      .map((container) => String(container?.containerNo ?? "").trim())
      .filter(Boolean),
  );
  const isItemDg = (item) =>
    dgContainerNoSet.has(String(item?.containerNo ?? "").trim());

  const handleItemContainerChange = (itemIndex, value) => {
    handleChange(["items", itemIndex, "containerNo"], value);
    if (!dgContainerNoSet.has(String(value).trim())) {
      handleChange(["items", itemIndex, "unCode"], "");
      handleChange(["items", itemIndex, "imoClass"], "");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {locked && (
        <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
          Fields are locked. Turn off Mark as reviewed to edit.
        </Alert>
      )}
      <ReviewSection title="General Information">
        <Grid container spacing={2}>
          {GENERAL_FIELDS.map((field) => (
            <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
              {renderField(field, ["generalInfo", field.key])}
            </Grid>
          ))}
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={editedData.generalInfo?.splitBl === "Yes"}
                  disabled={locked}
                  onChange={(event) =>
                    handleSplitBlChange(event.target.checked)
                  }
                />
              }
              label="Split BL"
            />
          </Grid>
          {editedData.generalInfo?.splitBl === "Yes" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              {renderField(
                {
                  key: "originalNo",
                  label: "Original BL Number",
                  kind: "text",
                  required: true,
                },
                ["generalInfo", "originalNo"],
              )}
            </Grid>
          )}
        </Grid>
      </ReviewSection>

      <ReviewSection title="Parties">
        {parties.length ? (
          parties.map((party, index) => (
            <ReviewEntity
              key={index}
              index={index}
              label={`Party ${index + 1}${party?.partyType ? ` — ${party.partyType}` : ""}`}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField(
                    {
                      key: "partyType",
                      label: "Party Type",
                      kind: "text",
                      readOnly: true,
                    },
                    ["parties", index, "partyType"],
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField(
                    {
                      key: "countryName",
                      label: "Country",
                      kind: "master",
                      fieldKey: "parties.countryName",
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "countryName",
                      ),
                    },
                    ["parties", index, "countryName"],
                    {
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "countryName",
                      ),
                    },
                  )}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {renderField(
                    {
                      key: "partyName",
                      label: "Entity Name",
                      kind: "text",
                      multiline: true,
                      minRows: 1,
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "partyName",
                      ),
                    },
                    ["parties", index, "partyName"],
                    {
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "partyName",
                      ),
                    },
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField(
                    {
                      key: "address",
                      label: "Address",
                      kind: "text",
                      multiline: true,
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "address",
                      ),
                    },
                    ["parties", index, "address"],
                    {
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "address",
                      ),
                    },
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField(
                    {
                      key: "cityName",
                      label: "City",
                      kind: "text",
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "cityName",
                      ),
                    },
                    ["parties", index, "cityName"],
                    {
                      required: isPartyFieldRequired(
                        party?.partyType,
                        "cityName",
                      ),
                    },
                  )}
                </Grid>
              </Grid>
            </ReviewEntity>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No parties extracted.
          </Typography>
        )}
      </ReviewSection>

      <ReviewSection title="Containers">
        {containers.length ? (
          containers.map((container, index) => (
            <ReviewEntity
              key={index}
              index={index}
              label={`Container ${index + 1}`}
            >
              <Grid container spacing={2}>
                {CONTAINER_FIELDS.map((field) => (
                  <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
                    {renderField(field, ["containers", index, field.key], {
                      onChange:
                        field.key === "containerNo"
                          ? (value) => handleContainerNoChange(index, value)
                          : undefined,
                    })}
                  </Grid>
                ))}
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(container?.reeferCargo)}
                        disabled={locked}
                        onChange={(event) =>
                          handleReeferCargoChange(index, event.target.checked)
                        }
                      />
                    }
                    label="Reefer Cargo"
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(container?.dangerousGoods)}
                        disabled={locked}
                        onChange={(event) =>
                          handleDangerousGoodsChange(
                            index,
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label="Dangerous Goods (DG)"
                  />
                </Grid>
                {Boolean(container?.reeferCargo) && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {renderField(
                        {
                          key: "temperature",
                          label: "Temperature",
                          kind: "text",
                          required: true,
                        },
                        ["containers", index, "temperature"],
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {renderField(
                        {
                          key: "unitCode",
                          label: "Temperature Unit",
                          kind: "select",
                          options: unitOptions,
                          required: true,
                        },
                        ["containers", index, "unitCode"],
                      )}
                    </Grid>
                  </>
                )}
              </Grid>
            </ReviewEntity>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No containers extracted.
          </Typography>
        )}
      </ReviewSection>

      <ReviewSection title="Items">
        {items.length ? (
          items.map((item, index) => (
            <ReviewEntity key={index} index={index} label={`Item ${index + 1}`}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    required
                    label="Container No"
                    value={item?.containerNo ?? ""}
                    disabled={locked}
                    error={getFieldError(["items", index, "containerNo"]).error}
                    helperText={
                      getFieldError(["items", index, "containerNo"]).helperText
                    }
                    onChange={(event) =>
                      handleItemContainerChange(index, event.target.value)
                    }
                    onBlur={() => handleBlur(["items", index, "containerNo"])}
                  >
                    {containerNoOptions.map((containerNo) => (
                      <MenuItem key={containerNo} value={containerNo}>
                        {containerNo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {ITEM_FIELDS.map((field) => (
                  <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
                    {renderField(field, ["items", index, field.key])}
                  </Grid>
                ))}
                {isItemDg(item) && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {renderField(
                        {
                          key: "unCode",
                          label: "UN Code",
                          kind: "text",
                          required: true,
                        },
                        ["items", index, "unCode"],
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {renderField(
                        {
                          key: "imoClass",
                          label: "IMO Class",
                          kind: "select",
                          options: imoClassOptions,
                          required: true,
                        },
                        ["items", index, "imoClass"],
                      )}
                    </Grid>
                  </>
                )}
              </Grid>
            </ReviewEntity>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No items extracted.
          </Typography>
        )}
      </ReviewSection>

      <Stack sx={{ height: 8 }} />
    </Box>
  );
};

export default memo(PdfReviewForm);

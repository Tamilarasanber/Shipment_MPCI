import { memo, useState } from "react";
import { FastField, getIn, useFormikContext } from "formik";

const labelNode = (label, required) => (
  <>
    {label}
    {required ? <span className="ml-1 text-red-600">*</span> : null}
  </>
);

const propsEqualIgnoringFormik = (prev, next) => {
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  for (const key of keys) {
    if (key === "formik") continue;
    if (prev?.[key] !== next?.[key]) return false;
  }
  return true;
};

const markTouchedOnChange = (form, name) => {
  if (!name || getIn(form?.touched, name)) return;
  form?.setFieldTouched?.(name, true, false);
};

export const collapseExtraSpaces = (value) => String(value ?? "").replace(/\s+/g, "");

const fieldClass = (error, disabled) =>
  `w-full rounded-md border px-3 py-2 text-sm outline-none ${
    error ? "border-red-500" : "border-slate-300 focus:border-sky-600"
  } ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-white text-slate-800"}`;

const FieldShell = ({ label, required, error, helper, children }) => (
  <label className="block w-full">
    {label ? <span className="mb-1 block text-xs font-medium text-slate-600">{labelNode(label, required)}</span> : null}
    {children}
    {helper ? <span className="mt-1 block text-xs text-red-600">{helper}</span> : null}
  </label>
);

const FormikTextFieldBase = ({
  name,
  label,
  formik,
  type = "text",
  required,
  trimSpaces = false,
  onValueChange,
  onFieldBlur,
  disabled,
  placeholder,
  multiline,
  rows = 3,
  ...props
}) => (
  <FastField name={name}>
    {({ field, meta, form }) => {
      const shouldShowError = Boolean((meta?.touched || form?.submitCount > 0) && meta?.error);
      const shared = {
        name: field.name,
        disabled,
        placeholder,
        value: field.value ?? "",
        className: fieldClass(shouldShowError, disabled),
        onChange: (event) => {
          if (trimSpaces) event.target.value = collapseExtraSpaces(event.target.value);
          markTouchedOnChange(form, field.name);
          field.onChange(event);
          if (typeof formik?.handleChange === "function" && formik.handleChange !== field.onChange) {
            formik.handleChange(event);
          }
          onValueChange?.(event, form);
        },
        onBlur: (event) => {
          if (trimSpaces) {
            const trimmedValue = String(event.target.value ?? "").trim();
            if (trimmedValue !== event.target.value) form.setFieldValue(field.name, trimmedValue);
          }
          field.onBlur(event);
          if (typeof formik?.handleBlur === "function" && formik.handleBlur !== field.onBlur) {
            formik.handleBlur(event);
          }
          onFieldBlur?.(event, form);
        },
        ...props,
      };
      return (
        <FieldShell label={label} required={required} helper={shouldShowError ? meta?.error : ""}>
          {multiline ? <textarea rows={rows} {...shared} /> : <input type={type} {...shared} />}
        </FieldShell>
      );
    }}
  </FastField>
);

export const FormikTextField = memo(FormikTextFieldBase, propsEqualIgnoringFormik);

const toDateInput = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const FormikDatePickerBase = ({ name, label, formik, required = false }) => (
  <FastField name={name}>
    {({ field, meta, form }) => {
      const hasError = Boolean((meta?.touched || form?.submitCount > 0) && meta?.error);
      const setDateValue = formik?.setFieldValue || form.setFieldValue;
      const setDateTouched = formik?.setFieldTouched || form.setFieldTouched;
      const validateField = formik?.validateField || form.validateField;
      return (
        <FieldShell label={label} required={required} helper={hasError ? meta?.error : ""}>
          <input
            type="date"
            name={field.name}
            value={toDateInput(field.value)}
            className={fieldClass(hasError)}
            onChange={async (event) => {
              const nextValue = event.target.value ? new Date(`${event.target.value}T00:00:00`) : null;
              await setDateTouched(name, true, false);
              await setDateValue(name, nextValue);
              if (typeof validateField === "function") {
                await validateField(name);
                if (name === "etd") await validateField("eta");
                if (name === "eta") await validateField("etd");
              }
            }}
          />
        </FieldShell>
      );
    }}
  </FastField>
);

export const FormikDatePicker = memo(FormikDatePickerBase, propsEqualIgnoringFormik);

const FormikSelectBase = ({ name, label, options, formik, required, onValueChange, disabled }) => (
  <FastField name={name}>
    {({ field, meta, form }) => {
      const shouldShowError = Boolean((meta?.touched || form?.submitCount > 0) && meta?.error);
      const normalizedOptions = Array.isArray(options) ? options : [];
      return (
        <FieldShell label={label} required={required} helper={shouldShowError ? meta?.error : ""}>
          <select
            name={field.name}
            disabled={disabled}
            value={field.value ?? ""}
            className={fieldClass(shouldShowError, disabled)}
            onChange={(event) => {
              markTouchedOnChange(form, field.name);
              field.onChange(event);
              if (typeof formik?.handleChange === "function" && formik.handleChange !== field.onChange) {
                formik.handleChange(event);
              }
              onValueChange?.(event.target.value, form);
            }}
            onBlur={(event) => {
              field.onBlur(event);
              if (typeof formik?.handleBlur === "function" && formik.handleBlur !== field.onBlur) {
                formik.handleBlur(event);
              }
            }}
          >
            <option value="">Please select</option>
            {normalizedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    }}
  </FastField>
);

export const FormikSelect = memo(FormikSelectBase, propsEqualIgnoringFormik);

export const FormikTextFieldWithPopup = ({ name, label, required = false, popupTitle = "Edit Description" }) => {
  const formik = useFormikContext();
  const value = getIn(formik.values, name) ?? "";
  const error = getIn(formik.errors, name);
  const touched = getIn(formik.touched, name);
  const shouldShowError = Boolean((touched || formik.submitCount > 0) && error);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <FieldShell label={label} required={required} helper={shouldShowError ? error : ""}>
      <div className="flex gap-2">
        <input
          name={name}
          value={value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={fieldClass(shouldShowError)}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 text-xs text-slate-600"
          onClick={() => {
            setDraft(value);
            setOpen(true);
          }}
        >
          Expand
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
            <h3 className="mb-3 text-base font-semibold">{popupTitle}</h3>
            <textarea className={fieldClass(false)} rows={8} value={draft} onChange={(event) => setDraft(event.target.value)} />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white"
                onClick={() => {
                  formik.setFieldValue(name, draft);
                  setOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FieldShell>
  );
};

export const FormikMultiSelect = ({
  name,
  label,
  options = [],
  required,
  maxSelections,
  allowSelectAll = true,
  onValueChange,
  disabled = false,
}) => {
  const formik = useFormikContext();
  const value = getIn(formik.values, name) || [];
  const error = getIn(formik.errors, name);
  const touched = getIn(formik.touched, name);
  const shouldShowError = Boolean((touched || formik.submitCount > 0) && error);
  const selected = Array.isArray(value) ? value : [];
  const allSelected = options.length > 0 && selected.length === options.length;

  const commit = (nextValue) => {
    let resolved = nextValue;
    if (typeof maxSelections === "number" && maxSelections > 0) {
      resolved = resolved.slice(0, maxSelections);
    }
    if (!touched) formik.setFieldTouched(name, true, false);
    formik.setFieldValue(name, resolved);
    onValueChange?.(resolved, formik);
  };

  return (
    <FieldShell label={label} required={required} helper={shouldShowError ? error : ""}>
      <div className={`max-h-36 space-y-1 overflow-auto rounded-md border p-2 ${shouldShowError ? "border-red-500" : "border-slate-300"}`}>
        {allowSelectAll ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={allSelected}
              onChange={() => commit(allSelected ? [] : options.map((option) => option.value))}
            />
            Select All
          </label>
        ) : null}
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={selected.includes(option.value)}
              onChange={() => {
                const next = selected.includes(option.value)
                  ? selected.filter((item) => item !== option.value)
                  : [...selected, option.value];
                commit(next);
              }}
            />
            {option.label}
          </label>
        ))}
      </div>
    </FieldShell>
  );
};

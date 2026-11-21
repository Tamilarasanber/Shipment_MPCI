import { Children, cloneElement, createContext, isValidElement, useContext, useMemo, useState } from "react";
import { cx, sxToStyle } from "./sx";

const AccordionContext = createContext({ open: true, toggle: () => {} });

function styleOf(sx, style) {
  return { ...sxToStyle(sx), ...style };
}

export function CssBaseline() {
  return null;
}

export function Box({
  component: Component = "div",
  className,
  sx,
  style,
  children,
  ...props
}) {
  return (
    <Component className={className} style={styleOf(sx, style)} {...props}>
      {children}
    </Component>
  );
}

export function Stack({
  direction = "column",
  spacing = 1,
  className,
  sx,
  style,
  children,
  ...props
}) {
  return (
    <div
      className={cx("flex", direction === "row" ? "flex-row" : "flex-col", className)}
      style={{ gap: typeof spacing === "number" ? spacing * 8 : spacing, ...styleOf(sx, style) }}
      {...props}
    >
      {children}
    </div>
  );
}

const COL = {
  1: "col-span-12 sm:col-span-1",
  2: "col-span-12 sm:col-span-6 lg:col-span-2",
  3: "col-span-12 sm:col-span-6 lg:col-span-3",
  4: "col-span-12 sm:col-span-6 lg:col-span-4",
  5: "col-span-12 sm:col-span-6 lg:col-span-5",
  6: "col-span-12 sm:col-span-6 lg:col-span-6",
  7: "col-span-12 lg:col-span-7",
  8: "col-span-12 lg:col-span-8",
  9: "col-span-12 lg:col-span-9",
  10: "col-span-12 lg:col-span-10",
  11: "col-span-12 lg:col-span-11",
  12: "col-span-12",
};

const clampSpan = (value) => {
  const span = Math.round(Number(value));
  if (!Number.isFinite(span)) return 12;
  return Math.min(12, Math.max(1, span));
};

export function Grid({
  container,
  spacing = 2,
  size,
  xs,
  sm,
  md,
  className,
  sx,
  style,
  children,
  ...props
}) {
  if (container) {
    return (
      <div
        className={cx("grid grid-cols-12", className)}
        style={{
          columnGap: typeof spacing === "number" ? spacing * 8 : 16,
          rowGap: typeof spacing === "number" ? spacing * 8 : 16,
          ...styleOf(sx, style),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }

  const span = clampSpan(size?.md ?? md ?? size?.sm ?? sm ?? size?.xs ?? xs ?? 12);

  return (
    <div className={cx("min-w-0", COL[span], className)} style={styleOf(sx, style)} {...props}>
      {children}
    </div>
  );
}

export function Paper({ className, sx, style, children, elevation, ...props }) {
  return (
    <div
      className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}
      style={styleOf(sx, style)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Container({ className, sx, style, children, maxWidth, ...props }) {
  return (
    <div className={cx("mx-auto w-full", className)} style={styleOf(sx, style)} {...props}>
      {children}
    </div>
  );
}

const TYPE = {
  h5: "text-2xl",
  h6: "text-lg",
  subtitle1: "text-base font-medium",
  subtitle2: "text-sm font-medium",
  body1: "text-sm",
  body2: "text-sm text-slate-600",
  caption: "text-xs text-slate-500",
};

export function Typography({
  variant = "body1",
  component,
  className,
  sx,
  style,
  children,
  fontWeight,
  align,
  color,
  gutterBottom,
  noWrap,
  ...props
}) {
  const Tag = component || (variant === "h5" || variant === "h6" ? variant : "p");
  return (
    <Tag
      className={cx(TYPE[variant] || "text-sm", noWrap && "truncate", gutterBottom && "mb-2", className)}
      style={{
        fontWeight,
        textAlign: align,
        color: color === "text.secondary" ? "#64748b" : color === "error" ? "#dc2626" : undefined,
        ...styleOf(sx, style),
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Divider({ className, sx, style }) {
  return <hr className={cx("border-slate-200", className)} style={styleOf(sx, style)} />;
}

export function Button({
  children,
  className,
  sx,
  style,
  variant = "text",
  color = "primary",
  disabled,
  startIcon,
  endIcon,
  fullWidth,
  size,
  type = "button",
  ...props
}) {
  const look =
    variant === "contained"
      ? "bg-sky-600 text-white hover:bg-sky-700"
      : variant === "outlined"
        ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        : "text-sky-700 hover:bg-sky-50";
  return (
    <button
      type={type}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
        look,
        fullWidth && "w-full",
        size === "small" && "px-2 py-1 text-xs",
        className,
      )}
      style={styleOf(sx, style)}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}

export function IconButton({ children, className, sx, style, size, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-md p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50",
        className,
      )}
      style={styleOf(sx, style)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Chip({ label, className, sx, style, size, onDelete, color, ...props }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800",
        className,
      )}
      style={styleOf(sx, style)}
      {...props}
    >
      {label}
      {onDelete ? (
        <button type="button" className="text-sky-700" onClick={onDelete}>
          ×
        </button>
      ) : null}
    </span>
  );
}

export function CircularProgress({ size = 18, className }) {
  const px = typeof size === "number" ? size : 18;
  return (
    <span
      className={cx("inline-block animate-spin rounded-full border-2 border-sky-200 border-t-sky-600", className)}
      style={{ width: px, height: px }}
    />
  );
}

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  disabled,
  name,
  placeholder,
  type = "text",
  multiline,
  rows = 3,
  InputProps,
  inputProps,
  select,
  children,
  fullWidth = true,
  required,
  size,
  className,
  sx,
  style,
  ...props
}) {
  const fieldClass = cx(
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600",
    error ? "border-red-500" : "border-slate-300",
    disabled && "cursor-not-allowed bg-slate-100 text-slate-500",
  );
  const controlledValue = inputProps?.value ?? value ?? "";
  return (
    <label className={cx(fullWidth ? "block w-full" : "block", className)} style={styleOf(sx, style)}>
      {label ? <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span> : null}
      <span className="relative flex items-center gap-2">
        {select ? (
          <select
            name={name}
            disabled={disabled}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={fieldClass}
            {...props}
          >
            {children}
          </select>
        ) : multiline ? (
          <textarea
            name={name}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            value={controlledValue}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={fieldClass}
            {...inputProps}
            {...props}
          />
        ) : (
          <input
            name={name}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            value={controlledValue}
            onChange={inputProps?.onChange || onChange}
            onBlur={inputProps?.onBlur || onBlur}
            onFocus={inputProps?.onFocus || onFocus}
            className={fieldClass}
            {...inputProps}
            {...props}
          />
        )}
        {InputProps?.endAdornment}
        {InputProps?.startAdornment}
      </span>
      {helperText ? (
        <span className={cx("mt-1 block text-xs", error ? "text-red-600" : "text-slate-500")}>{helperText}</span>
      ) : null}
    </label>
  );
}

export function FormControl({ children, className, sx, style, fullWidth, error, disabled }) {
  return (
    <div className={cx(fullWidth !== false && "w-full", disabled && "opacity-70", className)} style={styleOf(sx, style)}>
      {children}
    </div>
  );
}

export function InputLabel({ children, className }) {
  return <span className={cx("mb-1 block text-xs font-medium text-slate-600", className)}>{children}</span>;
}

export function FormHelperText({ children, error }) {
  return <span className={cx("mt-1 block text-xs", error ? "text-red-600" : "text-slate-500")}>{children}</span>;
}

export function Select({
  children,
  value,
  onChange,
  onBlur,
  name,
  disabled,
  multiple,
  label,
  renderValue,
  className,
  sx,
  style,
  displayEmpty,
  ...props
}) {
  const shown = multiple && typeof renderValue === "function" ? renderValue(value || []) : undefined;
  return (
    <div className="relative w-full">
      {multiple && shown ? (
        <div className="mb-1 text-xs text-slate-500">{shown}</div>
      ) : null}
      <select
        name={name}
        multiple={multiple}
        disabled={disabled}
        value={value ?? (multiple ? [] : "")}
        onChange={onChange}
        onBlur={onBlur}
        className={cx(
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600",
          className,
        )}
        style={styleOf(sx, style)}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function MenuItem({ children, value, ...props }) {
  return (
    <option value={value} {...props}>
      {typeof children === "string" || typeof children === "number" ? children : value}
    </option>
  );
}

export function Checkbox({ checked, onChange, size, sx, className, ...props }) {
  return (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={onChange}
      className={cx("h-4 w-4 accent-sky-600", className)}
      style={sxToStyle(sx)}
      {...props}
    />
  );
}

export function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      disabled={disabled}
      onClick={(event) => onChange?.({ target: { checked: !checked }, ...event })}
      className={cx(
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-sky-600" : "bg-slate-300",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
          checked ? "left-5" : "left-0.5",
        )}
      />
    </button>
  );
}

export function FormControlLabel({ control, label, className, sx }) {
  return (
    <label className={cx("inline-flex items-center gap-2 text-sm text-slate-700", className)} style={sxToStyle(sx)}>
      {control}
      {label}
    </label>
  );
}

export function InputAdornment({ children, position }) {
  return <span className={cx("text-slate-500", position === "end" ? "ml-1" : "mr-1")}>{children}</span>;
}

export function Tooltip({ title, children }) {
  return <span title={typeof title === "string" ? title : undefined}>{children}</span>;
}

export function Dialog({ open, onClose, children, fullWidth, maxWidth = "sm", fullScreen }) {
  if (!open) return null;
  const width = {
    xs: "max-w-md",
    sm: "max-w-lg",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
  }[maxWidth];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
      <div
        className={cx(
          "max-h-[92vh] w-full overflow-auto rounded-xl bg-white shadow-2xl",
          fullScreen ? "h-full max-w-none" : width,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ children, className, sx, id }) {
  return (
    <div id={id} className={cx("border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-800", className)} style={sxToStyle(sx)}>
      {children}
    </div>
  );
}

export function DialogContent({ children, className, sx, dividers }) {
  return (
    <div className={cx("px-5 py-4", dividers && "border-y border-slate-100", className)} style={sxToStyle(sx)}>
      {children}
    </div>
  );
}

export function DialogContentText({ children, className }) {
  return <p className={cx("text-sm text-slate-600", className)}>{children}</p>;
}

export function DialogActions({ children, className, sx }) {
  return (
    <div className={cx("flex justify-end gap-2 px-5 py-4", className)} style={sxToStyle(sx)}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      {children}
    </Dialog>
  );
}

export function Backdrop({ open }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-40 bg-slate-900/30" />;
}

export function Alert({ severity = "info", children, onClose, className, sx }) {
  const tone = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  }[severity];
  return (
    <div className={cx("flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm", tone, className)} style={sxToStyle(sx)}>
      <div>{children}</div>
      {onClose ? (
        <button type="button" onClick={onClose} className="text-current">
          ×
        </button>
      ) : null}
    </div>
  );
}

export function Snackbar({ open, children, onClose, autoHideDuration }) {
  if (!open) return null;
  if (autoHideDuration && onClose) {
    setTimeout(onClose, autoHideDuration);
  }
  return <div className="fixed bottom-4 right-4 z-[60] w-[min(420px,calc(100%-2rem))]">{children}</div>;
}

export function Accordion({ defaultExpanded = false, expanded, onChange, children, className, sx }) {
  const [localOpen, setLocalOpen] = useState(defaultExpanded);
  const open = expanded === undefined ? localOpen : expanded;
  const value = useMemo(
    () => ({
      open,
      toggle: () => {
        const next = !open;
        if (expanded === undefined) setLocalOpen(next);
        onChange?.(null, next);
      },
    }),
    [expanded, onChange, open],
  );
  return (
    <AccordionContext.Provider value={value}>
      <div className={cx("overflow-hidden rounded-xl border border-slate-200 bg-white", className)} style={sxToStyle(sx)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionSummary({ children, expandIcon, className, sx }) {
  const { open, toggle } = useContext(AccordionContext);
  return (
    <button type="button" onClick={toggle} className={cx("flex w-full items-center justify-between gap-3 px-4 py-3 text-left", className)} style={sxToStyle(sx)}>
      <span className="min-w-0 flex-1">{children}</span>
      <span className={cx("transition", open && "rotate-180")}>{expandIcon}</span>
    </button>
  );
}

export function AccordionDetails({ children, className, sx }) {
  const { open } = useContext(AccordionContext);
  if (!open) return null;
  return (
    <div className={cx("border-t border-slate-100 px-4 py-3", className)} style={sxToStyle(sx)}>
      {children}
    </div>
  );
}

export function Collapse({ in: open, children }) {
  if (!open) return null;
  return <div>{children}</div>;
}

export function TableContainer({ children, className, sx, component: Component = "div" }) {
  return (
    <Component className={cx("w-full overflow-auto", className)} style={sxToStyle(sx)}>
      {children}
    </Component>
  );
}

export function Table({ children, className, size }) {
  return <table className={cx("w-full border-collapse text-left text-sm", className)}>{children}</table>;
}
export function TableHead({ children }) {
  return <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">{children}</thead>;
}
export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children, className, hover, selected, ...props }) {
  return (
    <tr className={cx("border-b border-slate-100", hover && "hover:bg-slate-50", selected && "bg-sky-50", className)} {...props}>
      {children}
    </tr>
  );
}
export function TableCell({ children, className, align, colSpan, sx, style, ...props }) {
  return (
    <td className={cx("px-3 py-2 align-middle", className)} colSpan={colSpan} style={{ textAlign: align, ...styleOf(sx, style) }} {...props}>
      {children}
    </td>
  );
}

export function Tabs({ value, onChange, children, className, sx }) {
  return (
    <div role="tablist" className={cx("flex flex-wrap gap-1 border-b border-slate-200", className)} style={sxToStyle(sx)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const tabValue = child.props.value ?? index;
        return cloneElement(child, {
          selected: value === tabValue,
          onClick: (event) => {
            child.props.onClick?.(event);
            onChange?.(event, tabValue);
          },
        });
      })}
    </div>
  );
}
export function Tab({ label, selected, onClick, className }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={Boolean(selected)}
      onClick={onClick}
      className={cx(
        "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium",
        selected ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-800",
        className,
      )}
    >
      {label}
    </button>
  );
}
export function TabContext({ children }) {
  return <>{children}</>;
}
export function TabPanel({ children }) {
  return <div>{children}</div>;
}

export function Toolbar({ children, className, sx }) {
  return (
    <div className={cx("flex items-center gap-3 px-4 py-2", className)} style={sxToStyle(sx)}>
      {children}
    </div>
  );
}
export function AppBar({ children, className, position }) {
  return <header className={cx("bg-sky-700 text-white", position === "sticky" && "sticky top-0", className)}>{children}</header>;
}
export function Fade({ in: open = true, children }) {
  if (!open) return null;
  return children;
}
export function ToggleButtonGroup({ children, value, onChange, exclusive, className }) {
  return <div className={cx("inline-flex overflow-hidden rounded-md border border-slate-300", className)}>{children}</div>;
}
export function ToggleButton({ children, value, selected, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("px-3 py-1.5 text-sm", selected ? "bg-sky-600 text-white" : "bg-white text-slate-700", className)}
    >
      {children}
    </button>
  );
}

function optionLabel(option, getOptionLabel) {
  if (option == null) return "";
  if (typeof getOptionLabel === "function") return getOptionLabel(option) || "";
  if (typeof option === "string") return option;
  return option.label || option.value || "";
}

export function Autocomplete({
  options = [],
  value,
  inputValue,
  onInputChange,
  onChange,
  getOptionLabel,
  renderInput,
  renderOption,
  renderTags,
  loading,
  disabled,
  multiple,
  noOptionsText = "No options",
  fullWidth,
  onOpen,
  filterOptions,
  disableCloseOnSelect,
  isOptionEqualToValue,
  freeSolo,
}) {
  const [open, setOpen] = useState(false);
  const query = inputValue ?? "";
  const list = typeof filterOptions === "function" ? filterOptions(options, { inputValue: query }) : options;
  const params = {
    fullWidth,
    disabled,
    InputProps: {
      endAdornment: loading ? <CircularProgress size={14} /> : null,
    },
    inputProps: {
      value: query,
      disabled,
      onFocus: () => {
        setOpen(true);
        onOpen?.();
      },
      onChange: (event) => onInputChange?.(event, event.target.value, "input"),
    },
  };

  const choose = (event, option) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const exists = current.some((item) =>
        isOptionEqualToValue ? isOptionEqualToValue(item, option) : item === option,
      );
      const next = exists
        ? current.filter((item) => (isOptionEqualToValue ? !isOptionEqualToValue(item, option) : item !== option))
        : [...current, option];
      onChange?.(event, next);
      if (!disableCloseOnSelect) setOpen(false);
      return;
    }
    onChange?.(event, option);
    setOpen(false);
  };

  return (
    <div className={cx("relative", fullWidth !== false && "w-full")}>
      {multiple && typeof renderTags === "function" && Array.isArray(value) && value.length > 0 ? (
        <div className="mb-1 flex flex-wrap gap-1">
          {renderTags(value, ({ index }) => ({
            key: index,
            onDelete: (event) => {
              const next = value.filter((_, itemIndex) => itemIndex !== index);
              onChange?.(event, next);
            },
          }))}
        </div>
      ) : null}
      {renderInput?.(params)}
      {open && !disabled ? (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {list.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">{noOptionsText}</li>
          ) : (
            list.map((option, index) => {
              const optionProps = {
                key: `${optionLabel(option, getOptionLabel)}-${index}`,
                onMouseDown: (event) => {
                  event.preventDefault();
                  choose(event, option);
                },
              };
              if (renderOption) return renderOption(optionProps, option);
              return (
                <li {...optionProps} className="cursor-pointer px-3 py-2 text-sm hover:bg-sky-50">
                  {optionLabel(option, getOptionLabel)}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

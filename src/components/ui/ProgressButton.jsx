import { useSelector } from "react-redux";

const ProgressButton = ({
  label,
  loadingStatus,
  onClick,
  color = "#ffffff",
  type = "button",
  icon,
  fullWidth,
  autoWidth,
  disabled,
}) => {
  const { themeDetails } = useSelector((state) => state.Theme);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loadingStatus || disabled}
      className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: disabled ? "#94a3b8" : themeDetails.buttonColor,
        color,
        width: autoWidth ? "auto" : fullWidth ? "100%" : undefined,
      }}
    >
      {icon}
      {label}
      {loadingStatus ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
    </button>
  );
};

export default ProgressButton;

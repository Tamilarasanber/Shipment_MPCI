import { sxToStyle } from "./sx";

function Icon({ children, sx, style, fontSize = "medium", className }) {
  const size = fontSize === "small" ? 16 : fontSize === "large" ? 28 : 20;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...sxToStyle(sx), ...style }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const wrap = (draw) =>
  function NamedIcon(props) {
    return <Icon {...props}>{draw}</Icon>;
  };

export const AddIcon = wrap(
  <>
    <path d="M12 5v14M5 12h14" />
  </>,
);
export const CloseIcon = wrap(
  <>
    <path d="M6 6l12 12M18 6L6 18" />
  </>,
);
export const ExpandMoreIcon = wrap(<path d="M6 9l6 6 6-6" />);
export const ExpandLessIcon = wrap(<path d="M6 15l6-6 6 6" />);
export const SaveIcon = wrap(
  <>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M8 4v5h7" />
    <path d="M8 20v-6h8v6" />
  </>,
);
export const SendIcon = wrap(
  <>
    <path d="M4 12l16-8-6 16-2-6z" />
  </>,
);
export const InfoOutlinedIcon = wrap(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 11v5M12 8h.01" />
  </>,
);
export const SailingIcon = wrap(
  <>
    <path d="M3 18h18" />
    <path d="M5 18l2-8h6l2 8" />
    <path d="M12 4v6" />
  </>,
);
export const AssignmentTurnedInIcon = wrap(
  <>
    <path d="M8 4h8v16H8z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);
export const HistoryIcon = wrap(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </>,
);
export const PictureAsPdfIcon = wrap(
  <>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v5h5" />
    <path d="M8 15h8M8 18h5" />
  </>,
);
export const CloudUploadIcon = wrap(
  <>
    <path d="M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5-1.5A3.5 3.5 0 0 0 7 18z" />
    <path d="M12 12v6M9.5 14.5L12 12l2.5 2.5" />
  </>,
);
export const LinkIcon = wrap(
  <>
    <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
  </>,
);
export const CheckCircleIcon = wrap(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M8.5 12.5l2.2 2.2 4.8-5" />
  </>,
);
export const CheckCircleOutlineIcon = CheckCircleIcon;
export const WarningAmberOutlinedIcon = wrap(
  <>
    <path d="M12 4l8 14H4z" />
    <path d="M12 10v4M12 16h.01" />
  </>,
);
export const DeleteOutlineIcon = wrap(
  <>
    <path d="M5 7h14" />
    <path d="M9 7V5h6v2" />
    <path d="M8 7l1 13h6l1-13" />
  </>,
);
export const InsertDriveFileIcon = wrap(
  <>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5" />
  </>,
);
export const ErrorOutlineIcon = wrap(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5M12 16h.01" />
  </>,
);
export const DescriptionOutlinedIcon = wrap(
  <>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M9 13h6M9 17h4" />
  </>,
);
export const DescriptionIcon = DescriptionOutlinedIcon;
export const HourglassEmptyIcon = wrap(<path d="M7 4h10M7 20h10M8 4c0 5 8 6 8 8s-8 3-8 8M16 4c0 5-8 6-8 8s8 3 8 8" />);
export const ReplayIcon = wrap(
  <>
    <path d="M4 12a8 8 0 1 0 2-5" />
    <path d="M4 4v5h5" />
  </>,
);
export const RefreshRoundedIcon = ReplayIcon;
export const DownloadIcon = wrap(
  <>
    <path d="M12 4v11" />
    <path d="M8 11l4 4 4-4" />
    <path d="M5 20h14" />
  </>,
);
export const VisibilityOutlinedIcon = wrap(
  <>
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.5" />
  </>,
);
export const AttachFileIcon = wrap(<path d="M8 13l6-6a3 3 0 0 1 4 4l-7 7a4 4 0 0 1-6-6l7-7" />);
export const ZoomInIcon = wrap(
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="M11 8v6M8 11h6M16 16l4 4" />
  </>,
);
export const ZoomOutIcon = wrap(
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="M8 11h6M16 16l4 4" />
  </>,
);
export const CropFreeIcon = wrap(<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />);
export const RotateRightIcon = wrap(
  <>
    <path d="M20 12a8 8 0 1 1-2-5" />
    <path d="M20 4v5h-5" />
  </>,
);
export const NavigateBeforeIcon = wrap(<path d="M14 6l-6 6 6 6" />);
export const NavigateNextIcon = wrap(<path d="M10 6l6 6-6 6" />);
export const OpenInFullIcon = wrap(<path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5" />);
export const LocalShippingIcon = wrap(
  <>
    <path d="M3 7h11v8H3z" />
    <path d="M14 10h4l3 3v2h-7" />
    <circle cx="7" cy="17" r="1.5" />
    <circle cx="17" cy="17" r="1.5" />
  </>,
);
export const LocalShippingOutlinedIcon = LocalShippingIcon;
export const AssignmentOutlinedIcon = wrap(
  <>
    <path d="M8 4h8v16H8z" />
    <path d="M10 9h4M10 13h4" />
  </>,
);
export const TaskAltOutlinedIcon = CheckCircleIcon;
export const PendingActionsOutlinedIcon = wrap(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </>,
);
export const AnchorIcon = wrap(
  <>
    <circle cx="12" cy="6" r="2" />
    <path d="M12 8v12M6 14a6 6 0 0 0 12 0" />
    <path d="M4 14h4M16 14h4" />
  </>,
);
export const SlAnchor = AnchorIcon;

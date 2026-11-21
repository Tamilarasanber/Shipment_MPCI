import { useState } from "react";

const ConfirmDeletePopover = ({
  onConfirm,
  title = "Delete",
  message = "Are you sure you want to delete?",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="rounded-md p-1 text-red-600 hover:bg-red-50"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        aria-label={title}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13" />
        </svg>
      </button>
      {open ? (
        <span className="absolute right-0 top-8 z-20 w-56 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg">
          <span className="block text-sm font-semibold text-slate-800">{title}</span>
          <span className="mt-1 block text-xs text-slate-500">{message}</span>
          <span className="mt-3 flex justify-end gap-2">
            <button type="button" className="rounded-md px-2 py-1 text-xs" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-2 py-1 text-xs text-white"
              onClick={() => {
                onConfirm?.();
                setOpen(false);
              }}
            >
              Delete
            </button>
          </span>
        </span>
      ) : null}
    </span>
  );
};

export default ConfirmDeletePopover;

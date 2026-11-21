import { useState } from "react";
import { useSelector } from "react-redux";

const AccordionCard = ({ title, defaultExpanded = false, completed = false, icon, children }) => {
  const [open, setOpen] = useState(defaultExpanded);
  const { themeDetails } = useSelector((state) => state.Theme);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-white"
        style={{ background: themeDetails.AccordionBackgroundColor }}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-3 text-base font-semibold">
          {icon}
          {title}
        </span>
        <span className="flex items-center gap-3">
          {completed ? <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">Complete</span> : null}
          <span className={open ? "rotate-180" : ""}>▾</span>
        </span>
      </button>
      {open ? <div className="p-4">{children}</div> : null}
    </section>
  );
};

export default AccordionCard;

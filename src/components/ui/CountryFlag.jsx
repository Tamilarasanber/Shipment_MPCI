const CountryFlag = ({ countryCode }) => {
  const code = String(countryCode || "").trim().toUpperCase();
  if (!code) return null;
  return (
    <span className="inline-flex min-w-7 items-center justify-center rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-600">
      {code.slice(0, 2)}
    </span>
  );
};

export default CountryFlag;

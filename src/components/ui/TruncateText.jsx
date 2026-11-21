const TruncateText = ({ text, length = 40 }) => {
  const value = String(text ?? "");
  if (value.length <= length) return value;
  return <span title={value}>{`${value.slice(0, length)}...`}</span>;
};

export default TruncateText;

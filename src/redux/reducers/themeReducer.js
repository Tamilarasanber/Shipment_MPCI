const initialState = {
  themeDetails: {
    AccordionBackgroundColor: "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
    AccordionSecondaryBackgroundColor: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
    buttonColor: "#0284c7",
    primaryColor: "#0284c7",
    CheckCircleOutlineColor: "#ffffff",
    CheckCircleOutlineColorSecondary: "#16a34a",
    CheckCircleOutlineFilter: "none",
  },
};

export default function themeReducer(state = initialState) {
  return state;
}

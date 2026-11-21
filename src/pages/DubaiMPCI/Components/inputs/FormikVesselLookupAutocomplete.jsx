import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMpciMasterRequest } from "@/redux/actions/dubaiMpciAction";
import FormikRemoteFreeSoloAutocomplete from "./FormikRemoteFreeSoloAutocomplete";
import {
  clearVesselLookupRelatedFormValues,
  getVesselLookupOptionKey,
  mapVesselLookupResponseToFormValues,
} from "../../MapperLayer/vesselLookupMapper";

const FormikVesselLookupAutocomplete = ({
  name = "vesselName",
  label = "Vessel Name",
  required = false,
  disabled = false,
  size = "small",
}) => {
  const dispatch = useDispatch();
  const { vesselList = [], loading = false } = useSelector(
    (state) => state.DubaiFormFiling?.jobDetails || {},
  );

  const handleSearch = useCallback(
    (vesselName) =>
      dispatch(
        fetchMpciMasterRequest({
          type: "VESSEL",
          searchText: vesselName,
          section: "jobDetails",
          targetField: "vesselList",
        }),
      ),
    [dispatch],
  );

  return (
    <FormikRemoteFreeSoloAutocomplete
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      size={size}
      options={vesselList}
      loading={loading}
      getOptionLabel={(option) => option?.vesselName || ""}
      getOptionKey={getVesselLookupOptionKey}
      onSearch={handleSearch}
      mapOptionToFieldValues={mapVesselLookupResponseToFormValues}
      clearRelatedFieldValues={clearVesselLookupRelatedFormValues}
      noOptionsText="No matching vessels"
    />
  );
};

export default memo(FormikVesselLookupAutocomplete);

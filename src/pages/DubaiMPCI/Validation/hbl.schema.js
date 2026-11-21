import * as Yup from "yup";
import { generalInfoDetails } from "./generalInfoDetails.schema";
import { buildContainerDetailsSchema } from "./containerDetails.schema";
import { buildPartyDetailsSchema } from "./partiesDetails.schema";
import { buildItemDetailsSchema } from "./itemDetails.schema";

export const hblSchema = Yup.object({
  // generalInfo: Yup.array()
  //   .of(generalInfoDetails)
  //   .min(1, "At least one General Info required"),
 generalInfo: generalInfoDetails
    .required("General Info is required"), 

  containers: Yup.array()
    .when("generalInfo.futureChildBl", {
      is: "Yes",
      then: (schema) => schema.of(
        buildContainerDetailsSchema({
          isContainerCodeRequired: false,
          containerNoMode: "array",
        }),
      ),
      otherwise: (schema) => schema.of(
        buildContainerDetailsSchema({
          isContainerCodeRequired: true,
          containerNoMode: "array",
        }),
      ),
    })
    .min(1, "At least one Container required")
    .required("Container is required"),

  items: Yup.array()
    .when(["containers", "generalInfo.futureChildBl"], (values, schema) => {
      const [containers, futureChildBl] = Array.isArray(values)
        ? values
        : [undefined, undefined];
      const normalizedContainers = Array.isArray(containers?.[0])
        ? containers[0]
        : containers;
      const dangerousContainerNos = new Set(
        (Array.isArray(normalizedContainers) ? normalizedContainers : [])
          .filter((container) => container?.dangerousGoods === true)
          .flatMap((container) =>
            Array.isArray(container?.containerNo)
              ? container.containerNo
              : [container?.containerNo],
          )
          .map((containerNo) => String(containerNo ?? "").trim())
          .filter(Boolean),
      );
      const hsCodeRequired = futureChildBl !== "Yes";

      return schema.of(
        Yup.lazy((item) => {
          const dangerousGoods = (Array.isArray(item?.containerNo)
            ? item.containerNo
            : [item?.containerNo]
          ).some((containerNo) =>
            dangerousContainerNos.has(String(containerNo ?? "").trim()),
          );

          return buildItemDetailsSchema({ dangerousGoods, hsCodeRequired });
        }),
      );
    })
    .min(1, "At least one Item required")
    .required("Item is required"),

   parties: Yup.array()
    .when("generalInfo.blType", (blType, schema) => {
      const normalizedBlType = Array.isArray(blType) ? blType[0] : blType;
      const isConsigneeRequired = normalizedBlType !== "Negotiable";

      return schema.of(buildPartyDetailsSchema({ isConsigneeRequired }));
    })
    .min(1, "At least one party is required"), 
});

import { normalizeContainerNumberList } from "./containerHeaderUtils";

export const getContainerOptionsFromFormik = (containers = []) => {
  const seen = new Set();

  return containers.flatMap((container) =>
    normalizeContainerNumberList(container?.containerNo).reduce(
      (options, containerNo) => {
        if (seen.has(containerNo)) {
          return options;
        }

        seen.add(containerNo);
        options.push({
          label: containerNo,
          value: containerNo,
        });
        return options;
      },
      [],
    ),
  );
};

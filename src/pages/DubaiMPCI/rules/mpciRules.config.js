// rules/mpciRules.config.js
export const MPCI_RULES = [
  // 1
  {
    when: {
      filingfor: "Self - Local UAE Freight Forwarder",
      filingType: "FF",
    },

    actions: {
      JobDetailsSection: {
        show: ["filingPartyMpciID"],
        hide: ["liablePartyMpciId"],
      },

      GeneralInfoTab: {
        defaults: {
          futureChildBl: "No",
        },
        disabled: ["futureChildBl"],
        show: ["parentBlIssuerPartyMpciId"],
        hide: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "filingPartyMpciID",
          "liablePartyMpciId",
        ],
      },
    },
  },
  //   2
  {
    when: {
      filingfor: "Self - Local UAE Freight Forwarder",
      filingType: "MCL",
    },

    actions: {
      JobDetailsSection: {
        show: ["filingPartyMpciID"],
        hide: ["liablePartyMpciId"],
      },
    },
  },

  //   3
  {
    when: {
      filingfor: "Self - Local UAE Freight Forwarder",
      filingType: "SCL",
    },

    actions: {
      JobDetailsSection: {
        show: ["filingPartyMpciID"],
        hide: ["liablePartyMpciId"],
      },

      GeneralInfoTab: {
        defaults: {
          futureChildBl: "No",
        },
        disabled: ["futureChildBl"],
        show: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "parentBlIssuerPartyMpciId",
        ],
        hide: ["filingPartyMpciID", "liablePartyMpciId"],
      },
    },
  },

  //   4
  {
    when: {
      filingfor: "On behalf of Partner UAE Freight Forwarder",
      filingType: "FF",
    },

    actions: {
      JobDetailsSection: {
        show: ["filingPartyMpciID", "liablePartyMpciId"],
        // hide: [],
      },

      GeneralInfoTab: {
        defaults: {
          futureChildBl: "No",
        },
        disabled: ["futureChildBl"],
        show: ["parentBlIssuerPartyMpciId"],
        hide: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "filingPartyMpciID",
          "liablePartyMpciId",
        ],
      },
    },
  },

  //   5
  {
    when: {
      filingfor: "On behalf of Partner UAE Freight Forwarder",
      filingType: "MCL",
    },

    actions: {
      JobDetailsSection: {
        show: ["filingPartyMpciID", "liablePartyMpciId"],
        // hide: [],
      },
    },
  },

  //   6
  {
    when: {
      filingfor: "On behalf of Partner UAE Freight Forwarder",
      filingType: "SCL",
    },

    actions: {
      JobDetailsSection: {
        show: ["filingPartyMpciID", "liablePartyMpciId"],
        // hide: [],
      },

      GeneralInfoTab: {
        defaults: {
          futureChildBl: "No",
        },
        disabled: ["futureChildBl"],
        show: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "parentBlIssuerPartyMpciId",
        ],
        hide: ["filingPartyMpciID", "liablePartyMpciId"],
      },
    },
  },

  // if futureChildBl is No
  {
    when: {
      filingfor: "Self - Local UAE Freight Forwarder",
      filingType: "MCL",
      futureChildBl: "No",
    },
    scope: "GeneralInfoTab",
    actions: {
      GeneralInfoTab: {
        show: ["parentBlIssuerPartyMpciId"],
        hide: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "filingPartyMpciID",
          "liablePartyMpciId",
        ],
      },
    },
  },

  {
    when: {
      filingfor: "On behalf of Partner UAE Freight Forwarder",
      filingType: "MCL",
      futureChildBl: "No",
    },
    scope: "GeneralInfoTab",
    actions: {
      GeneralInfoTab: {
        show: ["parentBlIssuerPartyMpciId"],
        hide: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "filingPartyMpciID",
          "liablePartyMpciId",
        ],
      },
    },
  },
  // if futureChildBl is Yes
  {
    when: {
      filingfor: "Self - Local UAE Freight Forwarder",
      filingType: "MCL",
      futureChildBl: "Yes",
    },
    actions: {
      GeneralInfoTab: {
        show: ["parentBlIssuerPartyMpciId", "liablePartyMpciId"],
        hide: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "filingPartyMpciID",
        ],
      },
    },
  },

  {
    when: {
      filingfor: "On behalf of Partner UAE Freight Forwarder",
      filingType: "MCL",
      futureChildBl: "Yes",
    },
    actions: {
      GeneralInfoTab: {
        show: ["parentBlIssuerPartyMpciId", "liablePartyMpciId"],
        hide: [
          "parentBlNumber",
          "parentBlIssuerPartyName",
          "filingPartyMpciID",
        ],
      },
    },
  },

  // 🔥 future Excel rows go here
];

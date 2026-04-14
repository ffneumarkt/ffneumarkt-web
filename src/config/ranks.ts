export const RANK_CONFIG = [
    // officer within own fire department
    { value: 'HBI', sortOrder: 10 },
    { value: 'OBI', sortOrder: 20 },
    { value: 'BI', sortOrder: 30 },
    { value: 'BI d.F.', sortOrder: 35 },

    // Rank based on duties
    { value: 'HBI d.F.', sortOrder: 100 },
    { value: 'OBI d.F.', sortOrder: 110 },

    { value: 'HBM', sortOrder: 200 },
    { value: 'HBM d.F.', sortOrder: 230 },
    { value: 'OBM d.F.', sortOrder: 240 },

    // honorary ranks
    { value: 'E-HBI', sortOrder: 15 },
    { value: 'E-OBI', sortOrder: 1020 },
    { value: 'E-BI', sortOrder: 1030 },

    { value: 'E-HAW', sortOrder: 1040},
    { value: 'E-AW', sortOrder: 1060 },
    { value: 'E-BI d.F.', sortOrder: 1065 },

    { value: 'E-HBM d.F.', sortOrder: 1100 },
    { value: 'E-OBM', sortOrder: 1110 },

    // Rank based on promotions
    { value: 'OBM', sortOrder: 3000 },
    { value: 'BM', sortOrder: 3001 },
    { value: 'HLM', sortOrder: 3002 },
    { value: 'OLM', sortOrder: 3003 },
    { value: 'LM', sortOrder: 3004 },
    { value: 'HFM', sortOrder: 3005 },
    { value: 'OFM', sortOrder: 3006 },
    { value: 'FM', sortOrder: 3007 },
    { value: 'PFM', sortOrder: 3008 },
] as const;

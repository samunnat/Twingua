import {css} from "emotion";

export function stylesListToClassNames(styles) {
    return Object.keys(styles).reduce((classNames, styleKey) => {
        classNames[styleKey] = css(styles[styleKey]);
        return classNames;
    }, {});
}

export function getCountryName(countryCode) {
    const countries = {
        AL: {
            name: "Albania",
        },
        AD: {
            name: "Andorra",
        },
        AT: {
            name: "Austria",
        },
        BY: {
            name: "Belarus",
        },
        BE: {
            name: "Belgium",
        },
        BA: {
            name: "Bosnia and Herzegovina",
        },
        BG: {
            name: "Bulgaria",
        },
        HR: {
            name: "Croatia",
        },
        CZ: {
            name: "Czech Republic",
        },
        DK: {
            name: "Denmark",
        },
        EE: {
            name: "Estonia",
        },
        FI: {
            name: "Finland",
        },
        FR: {
            name: "France",
        },
        DE: {
            name: "Germany",
        },
        GR: {
            name: "Greece",
        },
        VA: {
            name: "Holy See",
        },
        HU: {
            name: "Hungary",
        },
        IS: {
            name: "Iceland",
        },
        IE: {
            name: "Ireland",
        },
        IT: {
            name: "Italy",
        },
        LV: {
            name: "Latvia",
        },
        LI: {
            name: "Liechtenstein",
        },
        LT: {
            name: "Lithuania",
        },
        LU: {
            name: "Luxembourg",
        },
        MK: {
            name: "Macedonia",
        },
        MT: {
            name: "Malta",
        },
        MD: {
            name: "Moldova",
        },
        MC: {
            name: "Monaco",
        },
        ME: {
            name: "Montenegro",
        },
        NL: {
            name: "Netherlands",
        },
        NO: {
            name: "Norway",
        },
        PL: {
            name: "Poland",
        },
        PT: {
            name: "Portugal",
        },
        SM: {
            name: "San Marino",
        },
        RS: {
            name: "Serbia",
        },
        SK: {
            name: "Slovakia",
        },
        SI: {
            name: "Slovenia",
        },
        ES: {
            name: "Spain",
        },
        SE: {
            name: "Sweden",
        },
        CH: {
            name: "Switzerland",
        },
        UA: {
            name: "Ukraine",
        },
        GB: {
            name: "United Kingdom of Great Britain and Northern Ireland",
        },
    };

    if (countryCode in countries) {
        return countries[countryCode].name;
    } else {
        return null;
    }
}

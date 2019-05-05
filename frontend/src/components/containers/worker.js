onmessage = (e) => {
    const data = e.data.data;
    const colors = e.data.colors;
    console.log(colors);

    var retData = data
        .map((bboxData) => {
            const key = Object.keys(bboxData)[0];
            const coords = key.split(",").map((ele) => parseFloat(ele));
            const languages = Object.keys(bboxData[key]);
            var maxLang = [-1, -1];
            languages.forEach((langKey) => {
                if (bboxData[key][langKey] > maxLang[1] && langKey !== `"en"`) {
                    // console.log(langKey);
                    maxLang = [langKey, bboxData[key][langKey]];
                }
            });

            if (maxLang[1] !== -1 && colors[maxLang[0].replace(/"/g, "")] !== undefined) {
                return {coords: coords, maxLang: maxLang};
            } else {
                return null;
            }
        })
        .filter((ele) => {
            return ele !== null;
        });

    if (retData.length === 0) {
        postMessage({type: "done"});
    } else {
        postMessage({type: "data", data: retData});
    }
};

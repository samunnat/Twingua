onmessage = (e) => {
    const data = e.data.data;
    const colors = e.data.colors;
    const filter = e.data.filter;
    const batch = e.data.batch;
    const zoom = e.data.zoom;

    var retData = data
        .map((bboxData) => {
            const key = Object.keys(bboxData)[0];
            const coords = key.split(",").map((ele) => parseFloat(ele));
            const languages = Object.keys(bboxData[key]);
            var maxLang = [-1, 0];

            languages.forEach((langKey) => {
                if (bboxData[key][langKey] > maxLang[1] && !filter.includes(langKey)) {
                    // console.log(langKey);
                    maxLang = [langKey, bboxData[key][langKey]];
                }
            });

            if (maxLang[0] !== -1 && colors[maxLang[0].replace(/"/g, "")] !== undefined) {
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
        postMessage({type: "data", data: retData, batch: batch, zoom: zoom});
    }
};

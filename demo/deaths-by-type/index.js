document.addEventListener('DOMContentLoaded', async function() {
    const colorScale = d3.scaleOrdinal();

    // Instantiate vis and its parameters
    const stackedBar = pv.vis.stackedBarLineChart()
        .margin({ top: 10, right: 10, bottom: 30, left: 50 })
        .colorScale(colorScale);
    const stackedBarContainer = d3.select('.stacked-bar');

    const legend = pv.vis.legend()
        .margin({ top: 3, right: 3, bottom: 3, left: 50 })
        .colorScale(colorScale);
    const legendContainer = d3.select('.legend');

    // Make the vis responsive to window resize
    window.onresize = _.throttle(update, 100);

    // Data
    const data = processData(await d3.csv('../../data/deaths-by-type.csv'));

    // Build the vis
    const columns = data.barColumns.concat(data.lineColumns);
    colorScale.domain(columns).range(d3.schemeSet2);
    update();

    /**
     * Updates vis when window changed.
     */
    function update() {
        updateVis(stackedBar, stackedBarContainer, data);
        legendContainer.datum(getLegends(columns)).call(legend);
    }

    function getLegends(columns) {
        return columns.map(c => {
            if (c === 'others') return { name: c, label: 'other reasons' };
            if (c === 'average') return { name: c, label: 'average of corresponding week over the past 5 years' };
            return { name: c, label: c };
        });
    }

    function updateVis(vis, container, data) {
        const [w, h] = pv.getContentRect(container.node());
        vis.width(w).height(h);
        container.datum(data).call(vis);
    }

    function processData(data) {
        const columns = data.columns.splice(1);
        data.forEach(d => {
            columns.forEach(c => {
                d[c] = preprocessValue(d[c])
            });

            // Add others = all - covid
            d['others'] = d['all'] - d['covid']
        });

        // Exclude weeks with all 0
        data = data.filter(d => data.columns.some(att => d[att]));

        data.forEach(d => {
            d.time = new Date(d.Week);
            d.label = d3.timeFormat('%b %d')(d.time);
        });

        // Seperate between bars and lines
        data.barColumns = ['others', 'covid'];
        data.lineColumns = ['average'];
        return data;
    }

    function preprocessValue(s) {
        return typeof(s) === 'number' ? s : parseInt(s.replace(',', '').trim());
    }
});
document.addEventListener('DOMContentLoaded', async function() {
    const colorScale = d3.scaleOrdinal();

    // Instantiate vis and its parameters
    const stackedBar = pv.vis.stackedBarChart()
        .margin({ top: 10, right: 10, bottom: 30, left: 50 })
        .colorScale(colorScale);
    const stackedBarContainer = d3.select('.stacked-bar');

    const stackedArea = pv.vis.stackedAreaChart()
        .margin({ top: 10, right: 10, bottom: 30, left: 50 })
        .colorScale(colorScale);
    const stackedAreaContainer = d3.select('.stacked-area');

    const legend = pv.vis.legend()
        .margin({ top: 3, right: 3, bottom: 3, left: 50 })
        .colorScale(colorScale);
    const legendContainer = d3.select('.legend');

    // Make the vis responsive to window resize
    window.onresize = _.throttle(update, 100);

    // Data
    const data = processData(await d3.csv('../../data/deaths-by-location.csv'));

    // Build the vis
    colorScale.domain(data.columns.slice(1)).range(d3.schemeSet2);
    update();

    /**
     * Updates vis when window changed.
     */
    function update() {
        updateVis(stackedBar, stackedBarContainer, data);
        updateVis(stackedArea, stackedAreaContainer, data);
        legendContainer.datum(data.columns.slice(1)).call(legend);
    }

    function updateVis(vis, container, data) {
        const [w, h] = pv.getContentRect(container.node());
        vis.width(w).height(h);
        container.datum(data).call(vis);
    }

    function processData(data) {
        // Exclude weeks with all 0
        const columns = data.columns;
        data = data.filter(d => data.columns.slice(1).some(att => parseInt(d[att])));
        
        data.forEach(d => {
            d.time = new Date(d.Week);
            d.label = d3.timeFormat('%b %d')(d.time);
        });

        data.columns = columns;
        return data;
    }
});
document.addEventListener('DOMContentLoaded', async function() {
    const colorScale = d3.scaleOrdinal();

    // Instantiate vis and its parameters
    const stackedBar = pv.vis.mirroredStackedBarChart()
        .margin({ top: 10, right: 10, bottom: 30, left: 50 })
        .colorScale(colorScale)
        .splitAttribute('Gender');
    const stackedBarContainer = d3.select('.stacked-bar');

    const stackedArea = pv.vis.mirroredStackedAreaChart()
        .margin({ top: 10, right: 10, bottom: 30, left: 50 })
        .colorScale(colorScale)
        .splitAttribute('Gender');
    const stackedAreaContainer = d3.select('.stacked-area');

    const legend = pv.vis.legend()
        .margin({ top: 3, right: 3, bottom: 3, left: 50 })
        .colorScale(colorScale);
    const legendContainer = d3.select('.legend');

    // Make the vis responsive to window resize
    window.onresize = _.throttle(update, 100);

    // Data
    const data = processData(await d3.csv('../../data/deaths-by-gender-age.csv'));

    // Build the vis
    colorScale.domain(data.columns).range(['gray', 'gray', 'gray'].concat(d3.schemeBlues[5].slice(0, 4)));
    update();

    /**
     * Updates vis when window changed.
     */
    function update() {
        updateVis(stackedBar, stackedBarContainer, data);
        updateVis(stackedArea, stackedAreaContainer, data);
        legendContainer.datum(data.columns).call(legend);
    }

    function updateVis(vis, container, data) {
        const [w, h] = pv.getContentRect(container.node());
        vis.width(w).height(h);
        container.datum(data).call(vis);
    }

    function processData(data) {
        // The first two columns are for time and gender
        data.columns.splice(0, 2);

        const columns = data.columns;
        data.forEach(d => {
            columns.forEach(c => {
                d[c] = preprocessValue(d[c])
            });
        });

        // Exclude weeks with all 0
        data = data.filter(d => data.columns.some(att => d[att]));

        data.forEach(d => {
            d.time = new Date(d.Week);
            d.label = d3.timeFormat('%b %d')(d.time);
        });

        const newData = { 
            columns: columns, 
            top: data.filter(d => d.Gender.includes('Female')),
            bottom: data.filter(d => d.Gender.includes('Male')) 
        };
        
        return newData;
    }

    function preprocessValue(s) {
        return typeof(s) === 'number' ? s : parseInt(s.replace(',', '').trim());
    }
});
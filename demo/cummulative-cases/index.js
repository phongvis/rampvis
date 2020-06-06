document.addEventListener('DOMContentLoaded', async function() {
    // Instantiate vis and its parameters
    const vis = pv.vis.timeseries()
        .margin({ top: 10, right: 10, bottom: 30, left: 50 });

    // Make the vis responsive to window resize
    window.onresize = _.throttle(update, 100);

    // Data
    const data = await d3.csv('../../data/table1.csv');
    const boards = Object.keys(data[0]).slice(1);
    const boardData = boards.map(b => {
        return data.map(d => ({
            time: new Date(d.Date),
            value: parseInt(d[b].replace(',', '')) || 0
        }));
    });
    
    // Build the vis
    update();

    /**
     * Updates vis when window changed.
     */
    function update() {
        d3.selectAll('.board').each(function(d, i) {
            const rect = pv.getContentRect(this);
            vis.width(rect[0]).height(rect[1]);
            d3.select(this).datum(boardData[i]).call(vis);
        });
    }
});
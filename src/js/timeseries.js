/**
 * A template for a visualization.
 */
pv.vis.timeseries = function() {
    /**
     * Visual configs.
     */
    let margin = { top: 10, right: 10, bottom: 10, left: 10 };

    let visWidth = 960, visHeight = 600, // Size of the visualization, including margins
        width, height; // Size of the main content, excluding margins

    /**
     * Accessors.
     */
    let time = d => d.time,
        value = d => d.value;

    /**
     * Data binding to DOM elements.
     */
    let data,
        dataChanged = true; // True to redo all data-related computations

    /**
     * DOM.
     */
    let visContainer, // Containing the entire visualization
        itemContainer,
        xAxisContainer,
        yAxisContainer;

    /**
     * D3.
     */
    const xScale = d3.scaleTime(),
        yScale = d3.scaleLinear(),
        xAxis = d3.axisBottom().scale(xScale).ticks(5),
        yAxis = d3.axisLeft().scale(yScale),
        line = d3.line()
            .x(d => xScale(time(d)))
            .y(d => yScale(value(d))),
        listeners = d3.dispatch('click');

    /**
     * Main entry of the module.
     */
    function module(selection) {
        selection.each(function(_data) {
            // Initialize
            if (!this.visInitialized) {
                visContainer = d3.select(this).append('g').attr('class', 'pv-template');
                xAxisContainer = visContainer.append('g').attr('class', 'x-axis');
                yAxisContainer = visContainer.append('g').attr('class', 'y-axis');
                itemContainer = visContainer.append('g').attr('class', 'items');

                this.visInitialized = true;
            }

            data = _data;
            update();
        });

        dataChanged = false;
    }

    /**
     * Updates the visualization when data or display attributes changes.
     */
    function update() {
        // Canvas update
        width = visWidth - margin.left - margin.right;
        height = visHeight - margin.top - margin.bottom;

        visContainer.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        xAxisContainer.attr('transform', 'translate(0,' + height + ')');

        xScale.range([0, width]);
        yScale.range([height, 0]);

        /**
         * Computation.
         */
        // Updates that depend only on data change
        if (dataChanged) {
            xScale.domain(d3.extent(data, time));
            yScale.domain([0, d3.max(data, value)]);
        }

        /**
         * Draw.
         */
        pv.enterUpdate([data], itemContainer, enterItems, updateItems, null, 'path');
        xAxisContainer.call(xAxis);
        yAxisContainer.call(yAxis);
    }

    /**
     * Called when new items added.
     */
    function enterItems(selection) {
        const container = selection
            // .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
            .attr('opacity', 0)
            .on('click', function(d) {
                listeners.call('click', this, d);
            });

        container.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue');
    }

    /**
     * Called when items updated.
     */
    function updateItems(selection) {
        selection.each(function(d) {
            const container = d3.select(this);

            // Transition location & opacity
            container.transition()
                // .attr('transform', 'translate(' + d.x + ',' + d.y + ')')
                .attr('opacity', 1);
            container.select('path')
                .attr('d', line);
        });
    }

    /**
     * Sets/gets the margin of the visualization.
     */
    module.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return this;
    };

    /**
     * Sets/gets the width of the visualization.
     */
    module.width = function(value) {
        if (!arguments.length) return visWidth;
        visWidth = value;
        return this;
    };

    /**
     * Sets/gets the height of the visualization.
     */
    module.height = function(value) {
        if (!arguments.length) return visHeight;
        visHeight = value;
        return this;
    };

    /**
     * Sets the flag indicating data input has been changed.
     */
    module.invalidate = function() {
        dataChanged = true;
    };

    /**
     * Binds custom events.
     */
    module.on = function() {
        const value = listeners.on.apply(listeners, arguments);
        return value === listeners ? module : value;
    };

    return module;
};
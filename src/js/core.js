/**
 * The global object for the project.
 */
const pv = function() {
    const pv = {
        vis: {}
    };

    /**
     * Execute enter-update-exit pipeline to bind data to a container.
     */
    pv.enterUpdate = function(data, container, enter, update, key, classname) {
        const items = container.selectAll('.' + classname).data(data, key);
        items.enter().append('g').attr('class', classname).call(enter)
            .merge(items).call(update);
        items.exit().transition().attr('opacity', 0).remove();
    };

    /**
     * Return [width, height] of the bounding rectangle, excluding padding and border.
     */
    pv.getContentRect = function(element) {
        const cs = getComputedStyle(element),
            pad = (parseInt(cs.paddingTop) + parseInt(cs.borderTopWidth)) * 2,
            rect = element.getBoundingClientRect();
        return [rect.width - pad, rect.height - pad];
    };

    /**
     * Return the correlation coefficent between two arrays.
     * https://en.wikipedia.org/wiki/Pearson_correlation_coefficient
     * Test: 
     *   x = [17,13,12,15,16,14,16,16,18,19]
     *   y = [94,73,59,80,93,85,66,79,77,91]
     *   coeff = 0.596
     */
    pv.computeCorrelationCoefficient = function(x, y) {
        if (x.length !== y.length) throw 'two arrays should have the same length'
        if (!x.length) throw 'length should be greater than 0'
        
        const mean = x => x.reduce((a, b) => a + b, 0) / x.length;
        const x_ = mean(x);
        const y_ = mean(y);
        let cov = stdX = stdY = 0

        for (let i = 0; i < x.length; i++) {
            const dx = x[i] - x_;
            const dy = y[i] - y_;
            cov += dx * dy;
            stdX += dx * dx;
            stdY += dy * dy;
        }

        std = Math.sqrt(stdX * stdY)

        if (!std) throw 'standard deviation is 0'

        return cov / std;
    };

    return pv;
}();
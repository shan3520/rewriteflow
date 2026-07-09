function initSSE(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (event, data) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        if (!res.write(payload)) {
            // Handle backpressure
        }
    };

    return { sendEvent, end: () => res.end() };
}

module.exports = { initSSE };

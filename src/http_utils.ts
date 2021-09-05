import express = require("express");

export function errorToStr(exc): string {
    return exc.message || `${exc}`;
}

// JSON-API handler
export function apiWrapper<T>(handler: (req: express.Request) => Promise<T>) {
    return (req: express.Request, res: express.Response) => {
        Promise.resolve(handler(req))
            .then(handlerRes => res.json(handlerRes))
            .catch(handlerErr => {
                const status = Number.isInteger(handlerErr['status']) ? handlerErr['status'] : 403;
                console.error('Unhandled error:', status, handlerErr);
                res.status(status).json({error: errorToStr(handlerErr)});
            }); 
    };
}

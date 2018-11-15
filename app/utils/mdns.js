import * as bonjour from 'bonjour';

var mdns = bonjour();

const FIND_SERVICE_TIMEOUT = 3000;

function FindService(options)
{
    return new Promise((resolve, reject) => {
        var rejected = false;

        var timer = setTimeout(() => {
            rejected = true;
            reject("FindService timeout");
        }, FIND_SERVICE_TIMEOUT);

        mdns.findOne(options, (service) => {
            if (!rejected) {
                clearTimeout(timer);
                resolve(service);
            }
        })
    });
}

export {
    FindService
}

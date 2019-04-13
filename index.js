const ids = ['a', 'b', 'c'];
const spamLimit = 1000; // ms

let cache = {};
let timeOfLastRequest = 0; // epoch

function getRandInRange(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function clearCache() {
    console.log('clearing cache');
    cache = {};
}

async function doAThing(id) {
    if (typeof cache[id] === 'undefined') {
        console.log('fetching from server', id);
        const value = await getDataFromRemote(id);
        cache[id] = value;
    } else {
        console.log('present', id);
    }
}

async function getDataFromRemote(id) {
    const now = Date.now();
    if (timeOfLastRequest + spamLimit > now) {
        throw new Error('we are spamming the remote server');
    } else {
        timeOfLastRequest = now;
        await new Promise(resolve =>
            setTimeout(resolve, getRandInRange(200, 800))
        );
        console.log('fetched', id);
        return 'some value';
    }
}

const cacheTimer = setInterval(clearCache, 2000);

const workTimer = setInterval(async () => {
    try {
        await doAThing(ids[getRandInRange(0, ids.length)]);
    } catch (e) {
        errHandler(e);
    }
}, 300);

const errHandler = error => {
    clearInterval(cacheTimer);
    clearInterval(workTimer);
    console.error(error.message);
};

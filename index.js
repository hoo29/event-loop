const ids = ['a', 'b', 'c'];
const spamLimit = 1000; // ms
let fetching = false;

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
        console.log('need to fetch', id);
        const hadToWait = fetching;
        while (fetching) {
            console.log('somebody else is fetching, waiting', id);
            await new Promise(resolve => setTimeout(resolve, spamLimit));
        }
        if (hadToWait) {
            console.log('had to wait', id);
            await new Promise(resolve => setTimeout(resolve, spamLimit));
        }
        const value = await getDataFromRemote(id);
        cache[id] = value;
    } else {
        console.log('present', id);
    }
}

async function getDataFromRemote(id) {
    const now = Date.now();
    if (timeOfLastRequest + spamLimit > now) {
        throw new Error(`we are spamming the remote server ${id}`);
    } else {
        console.log('about to fetch', id);
        timeOfLastRequest = now;
        fetching = true;
        await new Promise(resolve =>
            setTimeout(resolve, getRandInRange(200, 800))
        );
        fetching = false;
        console.log('fetched', id);
        return 'some value';
    }
}

const errHandler = error => {
    clearInterval(cacheTimer);
    clearInterval(workTimer);
    console.error(error.message);
};

const cacheTimer = setInterval(clearCache, 2000);

const workTimer = setInterval(async () => {
    try {
        const id = ids[getRandInRange(0, ids.length)];
        console.log('do a thing', id);
        await doAThing(id);
        console.log('did a thing', id);
    } catch (e) {
        errHandler(e);
    }
}, 300);

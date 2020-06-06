const ids = ['a', 'b', 'c'];
const spamLimit = 50; // ms
let cache = {};
let timeOfLastRequest = 0; // epoch
let mutex = Promise.resolve();

const getRandInRange = (min, max) => Math.floor(Math.random() * max) + min;

const clearCache = () => {
    console.log('clearing cache');
    cache = {};
};

const cacheTimer = setInterval(clearCache, 2000);

const doAThing = async (id) => {
    mutex = mutex.then(async () => {
        if (typeof cache[id] === 'undefined') {
            console.log('need to fetch', id);
            const now = Date.now();
            if (timeOfLastRequest + spamLimit > now) {
                console.log('need to wait', id);
                await new Promise((resolve) =>
                    setTimeout(resolve, timeOfLastRequest + spamLimit - now)
                );
            }
            const value = await getDataFromRemote(id);
            cache[id] = value;
        } else {
            console.log('present', id);
        }
    });

    return mutex;
};

const getDataFromRemote = async (id) => {
    const now = Date.now();
    if (timeOfLastRequest + spamLimit > now) {
        throw new Error(`we are spamming the remote server ${id}`);
    } else {
        console.log('about to fetch', id);
        timeOfLastRequest = now;
        await new Promise((resolve) =>
            setTimeout(resolve, getRandInRange(200, 800))
        );
        console.log('fetched', id);
        return 'some value';
    }
};

const errHandler = (error) => {
    clearInterval(cacheTimer);
    clearInterval(workTimer);
    console.error(error.message);
};

const workTimer = setInterval(async () => {
    try {
        const id = ids[getRandInRange(0, ids.length)];
        console.log('do a thing', id);
        await doAThing(id);
        console.log('did a thing', id);
    } catch (e) {
        errHandler(e);
    }
}, 40);

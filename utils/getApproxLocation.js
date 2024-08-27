const geoip = require('geoip-lite');

function getGeolocation(ipAddress) {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
        // console.log(`Country: ${geo.country}, Region: ${geo.region}, City: ${geo.city}, Coordinates: ${geo.ll}`);
        return {
            country: geo.country,
            region: geo.region,
            city: geo.city,
            coordinates: geo.ll // [latitude, longitude]
        };
    } else {
        // console.log('Location not found for IP:', ipAddress);
        return null;
    }
}

module.exports = getGeolocation
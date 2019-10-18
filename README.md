# Optimizely Feature Flag Microservice

### What?

Optimizely has released a feature flag manager for **free**. So I created an api that handles all of the logic with getting the datafile, caching it, installing the sdk, etc...

### Pre reqs?

So, in order to use this api there are a few requirements. 
- You must send the Content-Type header as `application/vnd.api+json`, because this api follows the [JSON API spec](https://jsonapi.org/)
- For every request you must also send an additional header called `x-optimizely-sdk-key` which is the sdk key for the environment you are using.. [More here...](https://docs.developers.optimizely.com/rollouts/docs/manage-environments)
- You must have a web hook, set up, or something set up to programmatically `POST` to the `/dataFile` endpoint which downloads and caches the latest version of your datafile for each environment.  [More here...](https://docs.developers.optimizely.com/rollouts/docs/manage-the-datafile)

### How do I use it?

There are only 5 endpoints
- `GET /featureFlags` returns a list of feature flags associated with the environment sdk key sent in the header
**Status:** `200`
```
{
    "data": {
        "featureFlags": [
            "FEATURE_FLAG_1",
            "FEATURE_FLAG_2"
        ]
    }
}
```
- `GET /featureFlags/:userId?attribute1=&attribute2=...` returns a map of featured flags and their value associated with that user with those attributes. Attributes are dynamically gathered from the query string and whitelisted against the attributes in the datafile.
**Status:** `200`
```
{
    "data": {
        "enabled": {
            "FEATURE_FLAG_1": true,
            "FEATURE_FLAG_2": false
        }
    }
}
```
- `GET /featureFlags/:userId/:featureFlag?attribute1=&attribute2=...` returns whether or not a specific feature flag with the given attributes is enabled.
**Status:** `200`
```
{
    "data": {
        "enabled": true
    }
}
```
- `POST /dataFile` downloads and caches the datafile for the environment matching the sdk key. Returns the downloaded datafile
**Status:** `201`
```
{
    "data": {
        "dataFile": {...}
    }
}
```
- `GET /dataFile` returns the currently cached dataFile
**Status:** `200`
```
{
    "data": {
        "dataFile": {...}
    }
}
```
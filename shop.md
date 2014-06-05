---
layout: content
title: Shop5
---

Embed the Shop
===

Embed the Shop with the following code snipped. In the callback you get an application
instance to control the application from your script context or an error instance if any
error occurred.

```html
<script type="text/javascript" src="//spreadshirt.github.io/apps/spreadshirt.min.js"></script>
<script type="text/javascript">
    spreadshirt.create("shop", {
        shopId: 123456, // your shop id
        platform: "EU"  // or NA
        // ... additional parameter (see below)
    }, function(err, app) {

        if (err) {
            // something went wrong
            console.log(err);
        } else {
            // cool I can control the application (see below)
            app.doSomething();
        }
    });
</script>
```

Parameters
===

The parameter shopId and platform should be present. You'll find your shopId in the user
area of spreadshirt. The platform decided if you like to speak with the European (EU) or the
North American (NA) platform.

```js
var requiredParameter = {
    // required parameter
    shopId: 123456,         // your own shopId
    platform: "EU",         // the spreadshirt platform: "EU", "NA"
};
```

To change the look and feel of the application you can use the following parameter. By
default the iframe will use 100% of the width and 700px in height and attaches to the
`document.body`.

```js
var layoutParameter = {
    // iframe size
    width: "100%",    // width in px or %
    height: "700px",   // height in px or %

    // render target
    target: document.getElementById("someDiv")
};
```
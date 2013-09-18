sprdApp
=======

**This solution is currently not official mentained by Spreadshirt**

with [Spreadshirt](http://spreadshirt.net)  you bring your T-Shirt ideas to live. You can open you own shop or publish your custom T-Shirt creations on the marketplace. But, what if you want more, like embedding the HTML5 T-Shirt designer in your own webpage?

Here comes the one-line embed solution.

```html
<body>

<script type="text/javascript" src="sprdapps.min.js"></script>
<script type="text/javascript">
    spreadshirt.create("tablomat", {
        shopId: 123456, // your shop id
        platform: "EU"  // or NA
        // ... additional parameter
    }, function(err, app) {

        if (err) {
            // something went wrong
            console.log(err);
        } else {
            // cool I can control the application
            app.setProductTypeId(6);
        }
    });
</script>

</body>
```

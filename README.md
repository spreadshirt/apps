sprdApp
=======

**This solution is currently not official mentained by Spreadshirt**

with [Spreadshirt](http://spreadshirt.net)  you bring your T-Shirt ideas to live. You can open you own shop or publish your custom T-Shirt creations on the marketplace. But, what if you want more, like embedding the HTML5 T-Shirt designer in your own webpage?

Here comes the one-line embed solution.

```html
<body>
<!-- CDN will follow, when project is offically supported by Spreadshirt -->
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

Parameter
---

```js
var possibleParameter = {
    // required parameter
    shopId: 123456,         // your own shopId
    platform: "EU",         // the spreadshirt platform: "EU", "NA"
    
    // optional design deeplinks

    designUrl: null,        /* an URL to an image, it will be uploaded. 
                             * **You agree that you will have the rights to use this image** 
                             */
    designId: null,         // the id of an exisitng design
    designColor1: null,     // the printColor Id for layer 1
    designColor2: null,     //                       layer 2    
    designColor3: null,     //                       layer 3
    designColorRgb1: null,  // or if you like RGB codes for the following layers
    designColorRgb2: null,
    designColorRgb3: null,

    // product relevant deeplinks
    productId: null,        // id of an existing product
    appearanceId: null,     // load the appearance (color) for the product type
    sizeId: null,           // preselect the product type size
    viewId: null,           // show this view of the product 
    
    // product type 
    productTypeId: null,    // start with the product type - cannot be used in combination with productId
    
    // text deeplinks 
    tx1: null,              // first line of text      
    tx2: null,              // second line of text ...
    tx3: null,              // ... and guess, the third line
    
    textColorRgb: null,     // you can specify colors either as rgb value
    textColor: null,        // or as id of an print type

    // independent
    departmentId: null,     // load this product type department
    productTypeCategoryId: null,    // or this product type category
    
    // also independent, but for designs
    designCategoryId: null, // open this designCategory
    designSearch: null,     // or perform a search for designs with the term

    panel: null             // show the following panel first - "productTypes", "designs", "upload", "imageNetwork"
}
```

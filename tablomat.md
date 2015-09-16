---
layout: content
title: Tablomat
---

Embed the Tablomat
===

Embed the Tablomat with the following code snipped. The best position for this script block is just before the end body, but it's also fine to put in into the head section or load it lazy with a dynamic script loaded when needed. The render position is controlled by the `target` parameter (see below). 


In the callback you get an application instance to control the application from your script context or an 
error instance if any error occurred.

```html
<script type="text/javascript" src="//spreadshirt.github.io/apps/spreadshirt.min.js"></script>
<script type="text/javascript">
    spreadshirt.create("tablomat", {
        shopId: 123456, // your shop id
        platform: "EU"  // or NA
        // ... additional parameter (see below)
    }, function(err, app) {

        if (err) {
            // something went wrong
            console.log(err);
        } else {
            // cool I can control the application (see below)
            app.setProductTypeId(6);
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

Deeplinks
---

All other parameters are optional and change the initialization of the application. E.g. you
could deeplink a specific productType (iPhone: 776) or add an image to the product. The
list of product types id, available appearances and designs you get from the
[API](https://developer.spreadshirt.net/display/API).

```js
var possibleParameter = {

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

    // text deeplinks, the won't work without deeplinking a productType || product || basketItem
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

    panel: null,             // show the following panel first - "productTypes", "designs", "upload", "imageNetwork"
    
    apiBasketId: null       // the id of the api basket to use
}
```

Custom basket implementation
---

If you want to use the Tablomat in your own shop system just as creation tool for custom
T-Shirts, but want to use your custom checkout you can pass an `addToBasket` function as
parameter.

The function will be invoked for every size the user selected in size dialog after he
clicked on add to basket.

```js
var ownBasketParameter = {
    addToBasket: function(item, callback) {

         // implement how to get the item to your basket
         // e.g. do some AJAX request

         // invoke callback function when you're done
         
         var err = null; // set to a js truly type for showing an error in tabloat,
         // see http://www.sitepoint.com/javascript-truthy-falsy/
         
         callback && callback(err);
    
}
```

The item has the following structure:

```js
var item = {
   quantity: 1,
   price: {
       vatExcluded: 20.0,
       vatIncluded: 23.8,
       currency: {
           id: "1",
           href: "http://www.spreadshirt.net/api/v1/currencies/1"
       }
   },
   product: {
       id: "111222",
       href: "http://www.spreadshirt.net/api/v1/shops/123456/products/111222"
   },
   appearance: {
       id: "1",
       name: "white"
   },
   view: {
       id: "1",
       name: "front"
   },
   productType: {
       id: "6",
       name: "Men's T-Shirt"
   },
   size: {
       id: "2",
       name: "S"
   }
}
```

The callback function has the standard js callback signature.

```js
callback = function(errorParameter) {
    // pass false, null or undefined if no error
    // or call it without an parameter
}
```

Controlling the application
===

Beside the deeplinking feature, the Tablomat can be controlled during runtime by the
following methods. Each method has its own signature and is executed
*(due the limitations of the cross-domain boundary)* asynchronously. The return value
of the method can be get in a callback method, passed as the last parameter.

The signature of the callback looks always like `function(error, returnValue)`.

### Product type

```js
setProductType: function(productTypeId, callback) {
    // loads the product type by id & converts all configurations to the new product type
}

getProductType: function(callback) {
    // returns the id of the current product type
}

setAppearanceId: function(appearanceId, callback) {
    // switches to the appearance of the current product type

    // the returnValue will be true, if the appearnce is contained in the current product type, otherwise it will be false
}

getAppearanceId: function(callback) {
    // returns the id of the current product type appearance
}

getAppearanceColor: function(callback) {
    // returns the main color of the current appearance as hexadecimal rgb value
}
```

### Configurations

```js
deselectConfiguration: function() {
    // deselects the configuration, what else ?
}

addImage: function(url, callback) {
    // url to the image
    // AGAIN: you confirm that you have the rights to use this image
}

```

### Product

```js
saveProduct: function(productId) {
    // identifier for getting the product from the api
}

loadProduct: function(productId, callback) {
    // loads an product by id
    // callback is invoked when completed: function(err) {}
}

getProductModel: function(productModel) {
    // a product model, representing the state of the currently designed product

    productModel = {
        price: 23.8,                    // including vat
        appearanceId: "1",              // color of the shirt
        sizeId: "2",                    // size id of the product type
        viewId: "1",                    // view id of the product type
        productTypeId: "6",             // product type id
        id: "111222",                   // product id, if deeplinked or saved
        configurations: [
            // list of configurations
            {
                type: "design" || "text",
                printAreaId: "1346",    // id of the print area of the product type
                viewId: "2",            // on which view of the product type
                perspective: "back",    // mapping of the view to an perspective
                printTypeId: "14",      // the print technology
                colors: [],
                price: 6.0,             // the price including vat
                designId: "123321",     // the id of the design, if type === "design"
                text: "foo bar"         // text, if type === "text"
            },
            // ...
        ]
    }
}
```

### Other

```js

openPanel: function(panel) {
    // opens a specific panel in the tablomat
    var possibleValues = ["productTypes", "designs", "upload", "imageNetwork"]
}

searchDesigns: function(searchTerm, openDesignPanel) {
    // search for a design and opens
    // the design panel if parameter is true
}

/***
 * sets a text on a text configuration
 * 
 * @since 8.27.0
 *
 * @param {Number} options.configurationIndex - the index of the configuration to modify
 * @param {String} options.text - the text to set
 * @returns {boolean} - true if setting text was possible
 */
setText: function(options) {
    // sets a text on a text configuration
}

```

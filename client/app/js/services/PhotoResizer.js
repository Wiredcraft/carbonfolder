/* global angular, jQuery */
function Base64Encoder()
{
  // do nothing
}
{
  // constants

  Base64Encoder.Base64DigitsAsString = 
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" 
    + "abcdefghijklmnopqrstuvwxyz"
    + "0123456789"
    + "+/";

  // static methods

  Base64Encoder.convertBase64StringToBytes = function(base64StringToConvert)
  {
    // Convert each four sets of six bits (sextets, or Base 64 digits)
    // into three sets of eight bits (octets, or bytes)

    var returnBytes = [];

    var bytesPerSet = 3;
    var base64DigitsPerSet = 4;
    var base64DigitsAll = Base64Encoder.Base64DigitsAsString;

    var indexOfEqualsSign = base64StringToConvert.indexOf("=");

    if (indexOfEqualsSign >= 0)
    {
      base64StringToConvert = base64StringToConvert.substring
      (
        0, 
        indexOfEqualsSign
      );
    }

    var numberOfBase64DigitsToConvert = base64StringToConvert.length;

    var numberOfFullSets = Math.floor
    (
      numberOfBase64DigitsToConvert / base64DigitsPerSet
    );

    var numberOfBase64DigitsInFullSets = 
      numberOfFullSets * base64DigitsPerSet;

    var numberOfBase64DigitsLeftAtEnd = 
      numberOfBase64DigitsToConvert - numberOfBase64DigitsInFullSets;

    for (var s = 0; s < numberOfFullSets; s++)
    {
      var d = s * base64DigitsPerSet;

      var valueToEncode = 
        (base64DigitsAll.indexOf(base64StringToConvert[d]) << 18)
        | (base64DigitsAll.indexOf(base64StringToConvert[d + 1]) << 12)
        | (base64DigitsAll.indexOf(base64StringToConvert[d + 2]) << 6)
        | (base64DigitsAll.indexOf(base64StringToConvert[d + 3]));

      returnBytes.push((valueToEncode >> 16) & 0xFF);
      returnBytes.push((valueToEncode >> 8) & 0xFF);
      returnBytes.push((valueToEncode) & 0xFF);
    } 

    var d = numberOfFullSets * base64DigitsPerSet;

    if (numberOfBase64DigitsLeftAtEnd > 0)
    {
      var valueToEncode = 0;

      for (var i = 0; i < numberOfBase64DigitsLeftAtEnd; i++)
      {
        var digit = base64StringToConvert[d + i];
        var digitValue = base64DigitsAll.indexOf(digit);
        var bitsToShift = (18 - 6 * i);
        var digitValueShifted = digitValue << bitsToShift;

        valueToEncode = 
          valueToEncode
          | digitValueShifted;
      }


      for (var b = 0; b < numberOfBase64DigitsLeftAtEnd; b++)
      {
        var byteValue = (valueToEncode >> (16 - 8 * b)) & 0xFF;
        if (byteValue > 0)
        {
          returnBytes.push(byteValue);
        }
      }
    }

    return returnBytes;
  }

  Base64Encoder.convertBytesToBase64String = function(bytesToEncode)
  {
    // Encode each three sets of eight bits (octets, or bytes)
    // as four sets of six bits (sextets, or Base 64 digits)

    var returnString = "";

    var bytesPerSet = 3;
    var base64DigitsPerSet = 4;
    var base64DigitsAsString = Base64Encoder.Base64DigitsAsString;

    var numberOfBytesToEncode = bytesToEncode.length;
    var numberOfFullSets = Math.floor(numberOfBytesToEncode / bytesPerSet);
    var numberOfBytesInFullSets = numberOfFullSets * bytesPerSet;
    var numberOfBytesLeftAtEnd = numberOfBytesToEncode - numberOfBytesInFullSets;

    for (var s = 0; s < numberOfFullSets; s++)
    {
      var b = s * bytesPerSet;

      var valueToEncode = 
        (bytesToEncode[b] << 16)
        | (bytesToEncode[b + 1] << 8)
        | (bytesToEncode[b + 2]);

      returnString += base64DigitsAsString[((valueToEncode & 0xFC0000) >>> 18)];
      returnString += base64DigitsAsString[((valueToEncode & 0x03F000) >>> 12)];
      returnString += base64DigitsAsString[((valueToEncode & 0x000FC0) >>> 6)];
      returnString += base64DigitsAsString[((valueToEncode & 0x00003F))];
    } 

    var b = numberOfFullSets * bytesPerSet;

    if (numberOfBytesLeftAtEnd == 1)
    {
      var valueToEncode = (bytesToEncode[b] << 16);

      returnString += base64DigitsAsString[((valueToEncode & 0xFC0000) >>> 18)];
      returnString += base64DigitsAsString[((valueToEncode & 0x03F000) >>> 12)];
      returnString += "==";
    }   
    else if (numberOfBytesLeftAtEnd == 2)
    {
      var valueToEncode = 
        (bytesToEncode[b] << 16)
        | (bytesToEncode[b + 1] << 8);

      returnString += base64DigitsAsString[((valueToEncode & 0xFC0000) >>> 18)];
      returnString += base64DigitsAsString[((valueToEncode & 0x03F000) >>> 12)];
      returnString += base64DigitsAsString[((valueToEncode & 0x000FC0) >>> 6)];
      returnString += "=";
    }

    return returnString;
  }
}
/**
 * @doc module
 * @id PhotoResizeModule
 * @description PhotoResizeModule
 *
 * @author Alexandre Strzelewicz <as@unitech.io>
 */

;(function($, angular, global, undefined) {
  
  var PhotoshopModule = angular.module('PhotoshopModule', []);

  PhotoshopModule.constant('version', '0.1');

  
  var Context = {
    current_image : null,
    canvas_el     : null,
    ctx           : null,
    cropping      : false,
    resizing      : false,
    img_phases    : [],
    img_curr_index: 0,
    push_image    : function(image) {
      Context.current_image = image;            
      Context.img_phases.push(image);
      Context.img_phases.slice(0, Context.img_curr_index);
      Context.img_curr_index += 1;
    },
    undo          : function() {
      if (Context.img_curr_index > 1)
        Context.img_curr_index -= 1;        
      Context.current_image = Context.img_phases[Context.img_curr_index - 1];
      return Context.current_image;
    },
    redo          : function() {
      if (Context.img_curr_index < Context.img_phases.length)
        Context.img_curr_index += 1;
      return Context.current_image = Context.img_phases[Context.img_curr_index - 1];
    }
  };

  /**
   * @doc directive
   * @id PhotoshopModule:editor
   * 
   * @description Editor directive with canvas preview and file input
   * @author Alexandre Strzelewicz <as@unitech.io>
   */
  PhotoshopModule.directive('photoshop', ['PhotoshopService', function(PhotoshopService) {
    var editor = {
      restrict : 'E',
      replace : true,
      transclude : true,
      scope : { 
        title : '@',
        save : '&',
        delimg: '&'
      },
      template : '<div class="ps">' +
        '<h3>{{title}}</h3>' +
        '<canvas ng-show="Context.current_image" id="originalImage"></canvas>' +
        '<marquee direction="right" id="ps-processing" ng-show="processing">Processing, wait</marquee>' +
        '<div id="ps-actions">' +
        '<div ng-show="Context.resizing">' +
        '<form ng-submit="resizeImage()">' +
        '<input placeholder="Enter desired width" type="text" ng-model="resizeWidth">' +
        '</form>' +
        '</div>' +
        '<br/><div id="ps-toolbar" ng-show="Context.current_image">' +
        '<input type="text" placeholder="Image Name" ng-model="imgName" ng-show="Context.current_image" ng-hide="Context.cropping || Context.resizing"><br/>' +
        '<a class="btn" ng-hide="Context.resizing" ng-click="cropImage()">Crop</a>' + 
        '<a class="btn" ng-hide="Context.cropping" ng-click="resizeImage()">Resize</a>' +
        // '<a class="btn" ng-hide="Context.cropping || Context.resizing" ng-click="undo()">Undo</a>' +
        // '<a class="btn" ng-hide="Context.cropping || Context.resizing" ng-click="redo()">Redo</a>' +
        '<a class="btn" ng-hide="Context.cropping || Context.resizing" ng-click="psSaveImg()">Save</a>' +
        '<a class="btn" ng-hide="Context.cropping || Context.resizing" ng-click="psRemoveImg()">Delete</a>' +
        '</div>' +
        '</div>' +
        '<br/>' + 
        '<input type="file" id="imageLoader" name="imageLoader"/>' +
        '<img id="crop_result">' + 
        '</div>'
    };
    
    editor.controller = ['$scope', function($scope, el, attrs) {
      $scope.Context = Context;
      
      $scope.cropImage = function() {
        if (!Context.cropping)
          PhotoshopService.initCrop(Context.canvas_el, Context.current_image);
        else {
          var image = new Image();
          var dt = PhotoshopService.getCroppedPart(Context.current_image);
          
          Crop.disableCrop(Context.canvas_el);
          image.src = dt;
          image.onload = function() {            
            PhotoshopService.redrawImg(Context.canvas_el,
                                       Context.ctx,
                                       image);            
            Context.push_image(image);
            $scope.$apply();
          };
        }
        Context.cropping = !Context.cropping;
      };

      $scope.undo = function() {
        Context.undo();
        PhotoshopService.redrawImg(Context.canvas_el,
                                   Context.ctx,
                                   Context.current_image);
      };

      $scope.redo = function() {
        Context.redo();
        PhotoshopService.redrawImg(Context.canvas_el,
                                   Context.ctx,
                                   Context.current_image);
      };

      $scope.psSaveImg = function() {
        PhotoshopService.b64ToRaw(Context.canvas_el.toDataURL(), function(data) {
          var img_dt = data;
          $scope.save({
            meta : $scope.imgName, // or uploaded file's name
            data : img_dt
          });
        });
      };

      $scope.psRemoveImg = function() {
        $scope.delimg();
      };

      $scope.resizeImage = function() {
        if (Context.resizing) {
          $scope.processing = true;

          PhotoshopService.resize({
            canvas : Context.canvas_el,
            img    : Context.current_image,
            width  : $scope.resizeWidth,
            format : 'jpg'
          }, function(err, data) {
            if (err) alert(err);
            $scope.processing = false;
            $scope.$apply();
            var image = PhotoshopService.dataUrlToImage(data);
            image.onload = function() {            
              PhotoshopService.redrawImg(Context.canvas_el,
                                         Context.ctx,
                                         image);              
              console.log('ctx', Context);
              Context.push_image(image);
            };
            
          });                  
        }
        Context.resizing = !Context.resizing;

      };
    }];

    
    editor.link = function(scope, el, attrs) {
      // Set Context's canvas element & CTX context
      Context.canvas_el = el.find('#originalImage')[0];
      Context.ctx = Context.canvas_el.getContext("2d");

      PhotoshopService.loadImgFromFs('imageLoader', function(err, img) {
        Context.push_image(img);

        var canvas = Context.canvas_el = el.find('#originalImage')[0];
        var ctx = Context.ctx = canvas.getContext("2d");        
       
        canvas.width = img.width;
        canvas.height = img.height;
                
        ctx.drawImage(img, 0, 0);
        
        scope.$apply();  
      });      
    };    
    return editor;
  }]);




  
  /**
   * @doc module
   * @id PhotoshopModule:PhotoResize
   
   * @description Resize your pics and give you raw binary data
   */
  PhotoshopModule.service('PhotoshopService', ['$http', function($http) {
    var PS = this;


    /**
     * @method getImageData
     * @description get current canvas data
     */
    this.getCanvasDataUrl = function() {
      return Context.canvas_el.toDataURL();
    };

    /**
     * @method clearContext
     * @description clear Photoshop Context
     */
    this.clearContext = function() {
      Context.current_image = null;
      Context.ctx = null;
      Context.cropping = false;
      Context.resizing = false;
      Context.img_phases = [];
      Context.img_curr_index = 0;
    };

    /**
     * @method clearCanvas
     * @description clear the canvas
     */
    this.clearCanvas = function() {
      var canvas = Context.canvas_el;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Reset Context too!
      Context.current_image = null;
      Context.ctx = null;
      Context.cropping = false;
      Context.resizing = false;
      Context.img_phases = [];
      Context.img_curr_index = 0;
    }

    /**
     * @method loadImgFromFs
     * @description Load image from Filesystem   
     */
    this.loadImgFromFs = function(file_input_id, cb) {
      var imageLoader = document.getElementById(file_input_id);
      var reader = new FileReader();
      
      imageLoader.addEventListener('change', function(e) {
        reader.onload = function(event){
          var img = new Image();
          img.onload = function() {
            return cb(null, img);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }, false);
    };

    this.initCrop = Crop.initCrop;

    this.getCroppedPart = Crop.getCroppedPart;

    /**
     * @method drawImg
     * @description draw image in the spicified canvas
     */
    this.redrawImg = function(canvas, ctx, img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = img.width;
      canvas.height = img.height;      
      ctx.drawImage(img, 0, 0);      
    };

    /**
     * @method loadSavedImg
     * @description place uploaded image onto canvas
     */
    this.loadSavedImg = function(content) {
      var img = content.image;
      Context.current_image = img;

      var canvas = document.getElementById('originalImage');
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (canvas.style.display != "block") { canvas.style.display = "block" }
    };

    /**
     * @method copyImageFromCanvasId
     * @description copy image from a canvas
     */
    this.copyImageFromCanvasId = function(canvas_id) {
      var canvas = document.getElementById(canvas_id);
      var image = new Image();
      
      image.src = canvas.toDataURL();
    };

    this.loadingCanvas = function(canvas, ctx, img) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas
      // draw source image
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      // and make it darker
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    
    /**
     * @method dataUrlToImage
     * @description data url to image object
     */
    this.dataUrlToImage = function(data_url) {
      var image = new Image();
      
      image.src = data_url;
      return image;
    };

    /**
     * @method b64ToRaw
     * @description base64 image to raw binary data
     */
    this.b64ToRaw = this.dataUrlToRaw = function(dt, cb) {
      // Saves Viewable image
      // var binaryImg = atob(dt.split(',')[1]);
      // var length = binaryImg.length;
      // var ab = new ArrayBuffer(length);
      // var ua = new Uint8Array(ab);
      // for (var i = 0; i < length; i++) {
      //     ua[i] = binaryImg.charCodeAt(i);
      // }
      // console.log(ua);
      
      // Saves image I can convert back to base64
      var ua = Base64Encoder.convertBase64StringToBytes(dt.split(',')[1]);
      cb(ua);
    };

    /**
     * @method rawToB64
     * @description raw binary data to base64 image
     */
    this.rawToB64 = function(dt, cb) {
      // Attempts to convert viewable image to base64
      // var ab = new ArrayBuffer(dt.length);
      // var ua = new Uint8Array(ab);
      // for(i=0; i < dt.length; i++) {
        // ua[i] = dt.charCodeAt(i);
      // }
      // var b64data = btoa(ua);
      // console.log(ua, b64data);

      // Converts non-viewable image to base64
      var dt = JSON.parse("["+ dt +"]");
      var encoded = Base64Encoder.convertBytesToBase64String(dt);
      cb(encoded);
    };

    // opts : canvas, img, width
    this.resize = function(opts, cb) {
      var lobes = opts.lobes || 3;
      var format = opts.format || 'png';
      
      if (!(isDef(opts.canvas) && isDef(opts.img) && isDef(opts.width))) {
        return cb(new Error('canvas, img or width not defined'));
      }

      new thumbnailer(opts.canvas, opts.img, opts.width, lobes, function(imageData, canvas) {
        var canvas_dt = canvas.toDataURL("image/" + format);
        return cb(null, canvas_dt);
      });
      return false;
    };

  }]);

  
  /////////////////////////
  // Image resizing part //
  /////////////////////////
  
  //returns a function that calculates lanczos weight
  function lanczosCreate(lobes){
    return function(x){
      if (x > lobes)
        return 0;
      x *= Math.PI;
      if (Math.abs(x) < 1e-16)
        return 1
      var xx = x / lobes;
      return Math.sin(x) * Math.sin(xx) / x / xx;
    };
  }

  //elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
  function thumbnailer(elem, img, sx, lobes, cb){
    this.cb = cb;
    this.canvas = elem;
    elem.width = img.width;
    elem.height = img.height;
    //elem.style.display = "none";
    this.ctx = elem.getContext("2d");
    this.ctx.drawImage(img, 0, 0);
    this.img = img;
    this.src = this.ctx.getImageData(0, 0, img.width, img.height);
    this.dest = {
      width: sx,
      height: Math.round(img.height * sx / img.width)
    };
    this.dest.data = new Array(this.dest.width * this.dest.height * 3);
    this.lanczos = lanczosCreate(lobes);
    this.ratio = img.width / sx;
    this.rcp_ratio = 2 / this.ratio;
    this.range2 = Math.ceil(this.ratio * lobes / 2);
    this.cacheLanc = {};
    this.center = {};
    this.icenter = {};
    setTimeout(this.process1, 0, this, 0);
  }
  
  thumbnailer.prototype.process1 = function(self, u){
    self.center.x = (u + 0.5) * self.ratio;
    self.icenter.x = Math.floor(self.center.x);
    for (var v = 0; v < self.dest.height; v++) {
      self.center.y = (v + 0.5) * self.ratio;
      self.icenter.y = Math.floor(self.center.y);
      var a, r, g, b;
      a = r = g = b = 0;
      for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
        if (i < 0 || i >= self.src.width)
          continue;
        var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
        if (!self.cacheLanc[f_x])
          self.cacheLanc[f_x] = {};
        for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
          if (j < 0 || j >= self.src.height)
            continue;
          var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
          if (self.cacheLanc[f_x][f_y] == undefined)
            self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
          weight = self.cacheLanc[f_x][f_y];
          if (weight > 0) {
            var idx = (j * self.src.width + i) * 4;
            a += weight;
            r += weight * self.src.data[idx];
            g += weight * self.src.data[idx + 1];
            b += weight * self.src.data[idx + 2];
          }
        }
      }
      var idx = (v * self.dest.width + u) * 3;
      self.dest.data[idx] = r / a;
      self.dest.data[idx + 1] = g / a;
      self.dest.data[idx + 2] = b / a;
    }

    if (++u < self.dest.width)
      setTimeout(self.process1, 0, self, u);
    else
      setTimeout(self.process2, 0, self);
  };
  thumbnailer.prototype.process2 = function(self){
    self.canvas.width = self.dest.width;
    self.canvas.height = self.dest.height;
    self.ctx.drawImage(self.img, 0, 0);
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
    var idx, idx2;
    for (var i = 0; i < self.dest.width; i++) {
      for (var j = 0; j < self.dest.height; j++) {
        idx = (j * self.dest.width + i) * 3;
        idx2 = (j * self.dest.width + i) * 4;
        self.src.data[idx2] = self.dest.data[idx];
        self.src.data[idx2 + 1] = self.dest.data[idx + 1];
        self.src.data[idx2 + 2] = self.dest.data[idx + 2];        
      }
    }
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
    self.cb(self.src, self.canvas);
  };

  function isDef(v) {
    if (typeof v === 'undefined')
      return false;
    return true;
  }





  //////////////////
  // CROPING PART //
  //////////////////
  // From http://www.script-tutorials.com/html5-image-crop-tool/
  
  // variables
  var iMouseX, iMouseY = 1;
  var theSelection;
  var GLcurrentImage;
  
  // define Selection constructor
  function Selection(x, y, w, h){
    this.x = x; // initial positions
    this.y = y;
    this.w = w; // and size
    this.h = h;

    this.px = x; // extra variables to dragging calculations
    this.py = y;

    this.csize = 6; // resize cubes size
    this.csizeh = 10; // resize cubes size (on hover)

    this.bHow = [false, false, false, false]; // hover statuses
    this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
    this.bDrag = [false, false, false, false]; // drag statuses
    this.bDragAll = false; // drag whole selection
  }

  // define Selection draw method
  Selection.prototype.draw = function(canvas, ctx, image){

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    // draw part of original image
    if (this.w > 0 && this.h > 0) {
      ctx.drawImage(image, this.x, this.y, this.w, this.h, this.x, this.y, this.w, this.h);
    }

    // draw resize cubes
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - this.iCSize[0], this.y - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
    ctx.fillRect(this.x + this.w - this.iCSize[1], this.y - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
    ctx.fillRect(this.x + this.w - this.iCSize[2], this.y + this.h - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
    ctx.fillRect(this.x - this.iCSize[3], this.y + this.h - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
  };

  var Crop = {};
  
  Crop.getCroppedPart = function(image) {
    var temp_ctx, temp_canvas;

    temp_canvas        = document.createElement('canvas');
    temp_ctx           = temp_canvas.getContext('2d');
    temp_canvas.width  = theSelection.w;
    temp_canvas.height = theSelection.h;
    temp_ctx.drawImage(image,
                       theSelection.x,
                       theSelection.y,
                       theSelection.w,
                       theSelection.h, 0, 0, theSelection.w, theSelection.h);
    
    return temp_canvas.toDataURL();

  };

  
  Crop.drawScene = function(canvas, ctx, image) { // main drawScene function
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas
    // draw source image
    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
    // and make it darker
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // draw selection
    theSelection.draw(canvas, ctx, image);
  };

  Crop.disableCrop = function(canvas_el) {
    $(canvas_el).unbind();
  };
  
  Crop.initCrop = function(canvas, imageRef) {
    var ctx = canvas.getContext("2d");

    GLcurrentImage = imageRef;
    
    // create initial selection
    theSelection = new Selection(100, 100, 100, 100);

    $(canvas).mousemove(function(e) { // binding mouse move event
      var canvasOffset = $(canvas).offset();
      iMouseX = Math.floor(e.pageX - canvasOffset.left);
      iMouseY = Math.floor(e.pageY - canvasOffset.top);

      // in case of drag of whole selector
      if (theSelection.bDragAll) {
        theSelection.x = iMouseX - theSelection.px;
        theSelection.y = iMouseY - theSelection.py;
      }

      for (var i = 0; i < 4; i++) {
        theSelection.bHow[i] = false;
        theSelection.iCSize[i] = theSelection.csize;
      }

      // hovering over resize cubes
      if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
          iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

        theSelection.bHow[0] = true;
        theSelection.iCSize[0] = theSelection.csizeh;
      }
      if (iMouseX > theSelection.x + theSelection.w-theSelection.csizeh &&
          iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
          iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

        theSelection.bHow[1] = true;
        theSelection.iCSize[1] = theSelection.csizeh;
      }
      if (iMouseX > theSelection.x + theSelection.w-theSelection.csizeh &&
          iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
          iMouseY > theSelection.y + theSelection.h-theSelection.csizeh &&
          iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

        theSelection.bHow[2] = true;
        theSelection.iCSize[2] = theSelection.csizeh;
      }
      if (iMouseX > theSelection.x - theSelection.csizeh &&
          iMouseX < theSelection.x + theSelection.csizeh &&
          iMouseY > theSelection.y + theSelection.h-theSelection.csizeh &&
          iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

        theSelection.bHow[3] = true;
        theSelection.iCSize[3] = theSelection.csizeh;
      }

      // in case of dragging of resize cubes
      var iFW, iFH;
      if (theSelection.bDrag[0]) {
        var iFX = iMouseX - theSelection.px;
        var iFY = iMouseY - theSelection.py;
        iFW = theSelection.w + theSelection.x - iFX;
        iFH = theSelection.h + theSelection.y - iFY;
      }
      if (theSelection.bDrag[1]) {
        var iFX = theSelection.x;
        var iFY = iMouseY - theSelection.py;
        iFW = iMouseX - theSelection.px - iFX;
        iFH = theSelection.h + theSelection.y - iFY;
      }
      if (theSelection.bDrag[2]) {
        var iFX = theSelection.x;
        var iFY = theSelection.y;
        iFW = iMouseX - theSelection.px - iFX;
        iFH = iMouseY - theSelection.py - iFY;
      }
      if (theSelection.bDrag[3]) {
        var iFX = iMouseX - theSelection.px;
        var iFY = theSelection.y;
        iFW = theSelection.w + theSelection.x - iFX;
        iFH = iMouseY - theSelection.py - iFY;
      }

      if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
        theSelection.w = iFW;
        theSelection.h = iFH;

        theSelection.x = iFX;
        theSelection.y = iFY;
      }

      Crop.drawScene(canvas, ctx, imageRef);
    });

    $(canvas).mousedown(function(e) { // binding mousedown event
      var canvasOffset = $(canvas).offset();
      iMouseX = Math.floor(e.pageX - canvasOffset.left);
      iMouseY = Math.floor(e.pageY - canvasOffset.top);

      theSelection.px = iMouseX - theSelection.x;
      theSelection.py = iMouseY - theSelection.y;

      if (theSelection.bHow[0]) {
        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y;
      }
      if (theSelection.bHow[1]) {
        theSelection.px = iMouseX - theSelection.x - theSelection.w;
        theSelection.py = iMouseY - theSelection.y;
      }
      if (theSelection.bHow[2]) {
        theSelection.px = iMouseX - theSelection.x - theSelection.w;
        theSelection.py = iMouseY - theSelection.y - theSelection.h;
      }
      if (theSelection.bHow[3]) {
        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y - theSelection.h;
      }

      if (iMouseX > theSelection.x + theSelection.csizeh &&
          iMouseX < theSelection.x+theSelection.w - theSelection.csizeh &&
          iMouseY > theSelection.y + theSelection.csizeh &&
          iMouseY < theSelection.y+theSelection.h - theSelection.csizeh) {

        theSelection.bDragAll = true;
      }

      for (var i = 0; i < 4; i++) {
        if (theSelection.bHow[i]) {
          theSelection.bDrag[i] = true;
        }
      }
    });

    $(canvas).mouseup(function(e) { // binding mouseup event
      theSelection.bDragAll = false;

      for (var i = 0; i < 4; i++) {
        theSelection.bDrag[i] = false;
      }
      theSelection.px = 0;
      theSelection.py = 0;
    });

    Crop.drawScene(canvas, ctx, imageRef);
  };


})(jQuery, angular, typeof window === "undefined" ? this : window);

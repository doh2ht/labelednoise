var count = 1;
var path = "image/1_1/";
var img_width = 0;
var currScrollX = 0;

const bt_label = document.getElementById("bt_label");
const bt_print = document.getElementById("bt_print");
const bt_info = document.getElementById("bt_info");

var noise_boxes = [document.getElementById("noise_1"), document.getElementById("noise_2"), document.getElementById("noise_3"), document.getElementById("noise_4"), document.getElementById("noise_5"), document.getElementById("noise_6")];
const extensions = [".jpg", ".png", "jpeg"];
var exIdx = 0;

const wrap_info = document.getElementById('info_wrap');
const wrap_noise = document.getElementById("noise_wrap");
const info_text = document.getElementById("info_text");
const info_view = document.getElementById("info_view");

const img_process = document.getElementById("img_process");

var isLabelExists = false;

bt_label.addEventListener('click', createNoiseOnce);
// bt_print.addEventListener('click', print);
// bt_print.onclick = "print()";
bt_info.addEventListener('mouseover', showInfo);
bt_info.addEventListener('mouseleave', hideInfo);

function showInfo() {
    info_view.style.width = window.innerWidth + "px";

    wrap_info.style.visibility = "visible";

    // scroll
    movetoward(info_text, 0);
}

function hideInfo() {
    wrap_info.style.visibility = "hidden";
    info_text.style.top = 0;
}

function movetoward(target, posY)
{
    var newY = posY - 1;
    target.style.top = newY + 'px';

    window.requestAnimationFrame(()=> {
        if (posY < -500) return;
        movetoward(target, newY);
    })
}

// window.addEventListener('error', function(e)
// {
//     if(e.target.tagName == "IMG" || e.target.tagName == "img") {
//         var tmpPath = path.split('/');
//         path = "";
//         for (var i = 0; i < count; i++)
//         {
//             path += tmpPath[i] + '/';
//         }

//         exIdx++;
//     }
    

// }, true);

// function imageLoad(input, i) {
//     var img = new Image();
//     img.src = input + extensions[i];
//     img.onerror = function() {
//         img.src = input + ".png";
//     }

//     return img;
// }

function createNoiseOnce() {
    // for (var i = 1; i < noise_boxes.length; i++)
    // {
    //     setTimeout(createNoise, 1000);
    //     // createNoise();
    // }
    
    setInterval(createNoise, 500);

}

function createNoise() {
    isLabelExists = true;

    if (count >= 6) return;

    let randN = Math.floor(Math.random() * 5) + 1;
    count ++;
    path = path + count + "_" + randN + "/";

    var img = new Image();
    img.src = path + count + "_" + randN + ".jpg";
    img.onerror = function() {
        this.onerror = null;
        this.src = path + count + "_" + randN + ".png";
        this.onerror = function() {
            this.onerror = null;
            this.src = path + count + "_" + randN + ".jpeg";
            this.onerror = function() {
                this.onerror = null;
                this.src = path + count + "_" + randN + ".gif";
            }
        }
    }

    img.onload = function() {
        if(this.width / this.height > 1) this.style.height = "100%";
        else this.style.width = "100%";
        $(this).css({
            transform: "translate(-" + ($(this).width() -$(this).parent().width() ) / 2 + "px, -" + ($(this).height() -$(this).parent().height() ) / 2  +"px)"
            
        });
        img_width = $(this).parent().width();
    };
    
    noise_boxes[count-1].innerHTML = "";
    noise_boxes[count-1].appendChild(img);

    if (count > 3)
    {
        currScrollX += img_width + 30; 
        wrap_noise.scrollTo(currScrollX, 0);
    }
}
var win = null;
var bmpData_1 = null;
var bmpData_2 = null;
function printMe() 
{
    if(!isLabelExists) return;

    img_process.style.visibility = 'visible';

    wrap_noise.scrollTo(0, 0);
     // 처음 세개의 이미지에 대한 캔버스 생성
    html2canvas(wrap_noise, {
        allowTaint : true, 
        useCORS : true,
        logging : true,
    }).then(canvas => {
        // document.body.appendChild(canvas);
        bmpData_1 = CanvasToBMP.toDataURL(canvas);

        // 마지막 세개의 이미지에 대한 캔버스 생성
        wrap_noise.scrollTo(currScrollX, 0);
        html2canvas(wrap_noise, {
            allowTaint : true, 
            useCORS : true,
            logging : true
        }).then(canvas => {
            // document.body.appendChild(canvas);
            bmpData_2 = CanvasToBMP.toDataURL(canvas);
            img_process.style.visibility = 'hidden';

        }).then(() => {
            
            win = window.open();
            win.document.write('<' + 'html' + '><' + 'head' + '><' + 'style' + '>');
            win.document.write('</style> </head><body style="overflow: scroll"> <div style="width: 4000px; transform-origin: 0% 100%; transform: rotate(90deg); margin-top: -100px;"><img style="height:100px;display:inline-block" src="');
            win.document.write(bmpData_1 + '"><img style="height:100px; display:inline-block" src="' );
            win.document.write(bmpData_2);
            win.document.write('"></div></body></html>');

        }).then(()=> {
            
            win.print();
            win.close();
            window.location.reload();
        });
    });
}

/*! canvas-to-bmp version 1.0 ALPHA
    (c) 2015 Ken "Epistemex" Fyrstenberg
    MIT License (this header required)
*/
// source from https://stackoverflow.com/questions/29652307/canvas-unable-to-generate-bmp-image-dataurl-in-chrome


var CanvasToBMP = {

    /**
     * Convert a canvas element to ArrayBuffer containing a BMP file
     * with support for 32-bit (alpha).
     *
     * Note that CORS requirement must be fulfilled.
     *
     * @param {HTMLCanvasElement} canvas - the canvas element to convert
     * @return {ArrayBuffer}
     */
    toArrayBuffer: function(canvas) {
  
      var w = canvas.width,
          h = canvas.height,
          w4 = w * 4,
          idata = canvas.getContext("2d").getImageData(0, 0, w, h),
          data32 = new Uint32Array(idata.data.buffer), // 32-bit representation of canvas
  
          stride = Math.floor((32 * w + 31) / 32) * 4, // row length incl. padding
          pixelArraySize = stride * h,                 // total bitmap size
          fileLength = 122 + pixelArraySize,           // header size is known + bitmap
  
          file = new ArrayBuffer(fileLength),          // raw byte buffer (returned)
          view = new DataView(file),                   // handle endian, reg. width etc.
          pos = 0, x, y = 0, p, s = 0, a, v;
  
      // write file header
      setU16(0x4d42);          // BM
      setU32(fileLength);      // total length
      pos += 4;                // skip unused fields
      setU32(0x7a);            // offset to pixels
  
      // DIB header
      setU32(108);             // header size
      setU32(w);
      setU32(-h >>> 0);        // negative = top-to-bottom
      setU16(1);               // 1 plane
      setU16(32);              // 32-bits (RGBA)
      setU32(3);               // no compression (BI_BITFIELDS, 3)
      setU32(pixelArraySize);  // bitmap size incl. padding (stride x height)
      setU32(2835);            // pixels/meter h (~72 DPI x 39.3701 inch/m)
      setU32(2835);            // pixels/meter v
      pos += 8;                // skip color/important colors
      setU32(0xff0000);        // red channel mask
      setU32(0xff00);          // green channel mask
      setU32(0xff);            // blue channel mask
      setU32(0xff000000);      // alpha channel mask
      setU32(0x57696e20);      // " win" color space
  
      // bitmap data, change order of ABGR to BGRA
      while (y < h) {
        p = 0x7a + y * stride; // offset + stride x height
        x = 0;
        while (x < w4) {
          v = data32[s++];                     // get ABGR
          a = v >>> 24;                        // alpha channel
          view.setUint32(p + x, (v << 8) | a); // set BGRA
          x += 4;
        }
        y++
      }
  
      return file;
  
      // helper method to move current buffer position
      function setU16(data) {view.setUint16(pos, data, true); pos += 2}
      function setU32(data) {view.setUint32(pos, data, true); pos += 4}
    },
  
    /**
     * Converts a canvas to BMP file, returns a Blob representing the
     * file. This can be used with URL.createObjectURL().
     * Note that CORS requirement must be fulfilled.
     *
     * @param {HTMLCanvasElement} canvas - the canvas element to convert
     * @return {Blob}
     */
    toBlob: function(canvas) {
      return new Blob([this.toArrayBuffer(canvas)], {
        type: "image/bmp"
      });
    },
  
    /**
     * Converts the canvas to a data-URI representing a BMP file.
     * Note that CORS requirement must be fulfilled.
     *
     * @param canvas
     * @return {string}
     */
    toDataURL: function(canvas) {
      var buffer = new Uint8Array(this.toArrayBuffer(canvas)),
          bs = "", i = 0, l = buffer.length;
      while (i < l) bs += String.fromCharCode(buffer[i++]);
      return "data:image/bmp;base64," + btoa(bs);
    }
  };
  
  
  
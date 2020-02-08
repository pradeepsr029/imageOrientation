import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageOrientationService {
  /**
   * @Author by Rawat @2019
   * call @getImageOrientation and send parameters upload file
   * return @returnObject
   * we let default upload image orientation 2{top,bottom}
   */


  orientation: number = 2;
  returnObject: {
    base64: string,
    file: File,
  }

  /**
   * @param file {required upload file}
   * @param type {optional like=png,jpg,jpeg} if you change upload image extension
   */
  async getImageOrientation(file: File, type?: string) {
    let changeImageType = `image/${type ? type : 'jpeg'}`;/*--for change image formate---*/
    /*************
     * SET DEFAULT VALUE
     */
    this.orientation = 2;
    this.returnObject = {
      base64: "",
      file: file
    }

    /*******************************************************************************************************************
     * promiss inside @fileReadAsArrayBufferWithGetOrientation function current image get Orientation {2,3,4,5,6,7,8,}
     * promiss inside @setImageOrientationByCanvas function internal drow canvas image and return base64 
     */

    return new Promise(async (resolve, reject) => {
      await this.fileReadAsArrayBufferWithGetOrientation(file).then((orientation: any) => {
        this.orientation = orientation;
      });

      await this.setImageOrientationByCanvas(file, this.orientation).then((base64: any) => {
        /*************************************************************
         * @base64 convert to file 
         */
        fetch(base64).then(res => res.blob()).then(blob => {
          const file = new File([blob], `${+new Date()}.${type ? type : 'jpg'}`, { type: changeImageType });
          this.returnObject = {
            base64: base64,
            file: file
          }
          resolve(this.returnObject);/*--hero object return-*/
        })
      })
    })
  };


  /***********************************
   * upload file 
   */
  async fileReadAsArrayBufferWithGetOrientation(file: File) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (event: any) => {
        let view = new DataView(event.target.result);
        if (view.getUint16(0, false) != 0xFFD8) {
          resolve(-2)
          return;
        }

        let length = view.byteLength,
          offset = 2;
        while (offset < length) {
          let marker = view.getUint16(offset, false);
          offset += 2;

          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) {
              resolve(-1)
              return;
            }
            let little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            let tags = view.getUint16(offset, little);
            offset += 2;

            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                resolve(view.getUint16(offset + (i * 12) + 8, little));
                return
              }
            }
          }
          else if ((marker & 0xFF00) != 0xFF00) {

          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(-1);
        return
      };
      reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    })
  }


  /**
   * @param file  {upload file}
   * @param srcOrientation {2,3,4,5,6,7,8}
   */
  async setImageOrientationByCanvas(file: File, srcOrientation: number) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = (e: any) => {
        var img = new Image();
        img.onload = (e: any) => {
          var width = img.width,
            height = img.height,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext("2d");

          // set width by Orientation
          if (4 < srcOrientation && srcOrientation < 9) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          // transform context before drawing image
          switch (srcOrientation) {
            case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
            case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
            case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
            case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
            case 7: ctx.transform(0, -1, -1, 0, height, width); break;
            case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
            default: break;
          }

          // draw image
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL());/*--hero base64 return*/
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };


}

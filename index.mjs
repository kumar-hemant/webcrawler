// Make a readme
// Check for different sources of images
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';

let [nodeV, file, url, depth] = process.argv;

depth = Number(depth);

console.log(process.argv);

// Handling of parameters
if (typeof url !== "string" || !url) {
  console.error("Please add valid URL");
  process.exit();
}

if (isNaN(depth)) {
  console.error("Please enter valid depth");
  process.exit();
}

if (!depth) {
  depth = 0
}

const jsonData = []

// // Web Crawling
// function getData(url, currentDepth = 0) {
//   if (currentDepth > depth) {
//     return
//   }
//   console.log('fetching url: ', url);
//   fetch(url).then(res => {
//     console.log('res.ok:' , res.ok);
//     if (!res.ok) {
//       console.log(`an error occurred while fetching url: ${url} and the response is: `, res);
//       return
//     }

//     res.text().then(htmlString => {
//       console.log('inside then');
//       const $ = cheerio.load(htmlString);
//       const images = $("img");
//       for (let image of images) {
//         if (image?.attribs?.src) {
//           jsonData.push({
//             imageUrl: image?.attribs?.src,
//             sourceUrl: url,
//             depth: currentDepth
//           })
//         }
//       }

//       // This is taking all the piutures
//       const pictures = $("picture source");
//       for (let picture of pictures) {
//         if (picture?.attribs?.srcset) {
//           jsonData.push({
//             pictureUrl: picture?.attribs?.srcset,
//             sourceUrl: url,
//             depth: currentDepth
//           })
//         }
//       }

//       const anchors = $("a");

//       for (let anchor of anchors) {
//         const href = anchor?.attribs?.href;
//         if (href && href !== "/" && href[0] !== "#") {
//           if (href[0] == "/") {
//             const baseURL = new URL(url).href;
//             getData(baseURL + href.substring(1, href.length), ++currentDepth)
//           }
//           getData(href, ++currentDepth)
//         }
//       }
//     })
//   })
// }

// Web Crawling
function getData(url, currentDepth = 0) {
  return new Promise(function(resolve, reject) {
    if (currentDepth > depth) {
      resolve()
      return;
    }
    console.log('fetching for: ', url);
    return fetch(url).then(res => {
      console.log('res.ok:' , res.ok);
      if (!res.ok) {
        console.log(`an error occurred while fetching url: ${url} and the response is: `, res);
        return
      }
  
      res.text().then(htmlString => {
        console.log('inside then');
        const $ = cheerio.load(htmlString);
        const images = $("img");
        for (let image of images) {
          if (image?.attribs?.src) {
            jsonData.push({
              imageUrl: image?.attribs?.src,
              sourceUrl: url,
              depth: currentDepth
            })
          }
        }
  
        // This is taking all the piutures
        const pictures = $("picture source");
        for (let picture of pictures) {
          if (picture?.attribs?.srcset) {
            jsonData.push({
              pictureUrl: picture?.attribs?.srcset,
              sourceUrl: url,
              depth: currentDepth
            })
          }
        }
  
        const anchors = $("a");

        if (anchors.length === 0) {
          resolve();
        } else {
          const promises = [];
          for (let anchor of anchors) {
            const href = anchor?.attribs?.href;
            if (href && (href[0] === "/" || href.substring(0, 4) === "http") && href.substring(0, 2) !== '/#') {
              if (href[0] == "/") {
                const base = new URL(url);
                const baseURL = new URL(url).origin;
                promises.push(getData(baseURL + href, ++currentDepth))
              } else {
                promises.push(getData(href, ++currentDepth))
              }
            }
          }
          Promise.allSettled(promises).then(() => {
            resolve()
          })
        }
      })
    })
  });
}


// Save to file
function appendToFile() {
  console.log("inside reading module");
  var writeStream = fs.createWriteStream("output.json");
  console.log('final output: ', jsonData)
  writeStream.write(JSON.stringify({"results": jsonData}));
  console.log("Program executed successfully");
}

getData(url, 0).then(() => {
  appendToFile();
})

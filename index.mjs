import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';

let [nodeV, file, url, depth] = process.argv;

depth = Number(depth);

// Handling of parameters
if (typeof url !== "string" || !url) {
  console.error("Please add valid URL");
  process.exit();
}

try {
  new URL(url);
} catch (err) {
  console.error("Please enter a valid URL");
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

// Web Crawling
function getData(url, currentDepth = 0) {
  return new Promise(function(resolve, reject) {
    if (currentDepth > depth) {
      resolve()
      return;
    }

    return fetch(url).then(res => {
      console.log('res.ok:' , res.ok);
      if (!res.ok) {
        console.log(`an error occurred while fetching url: ${url} and the response is: `, res);
        return
      }
  
      res.text().then(htmlString => {
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
  var writeStream = fs.createWriteStream("output.json");
  writeStream.write(JSON.stringify({"results": jsonData}));
  console.log("Program executed successfully");
}

getData(url, 0).then(() => {
  appendToFile();
})

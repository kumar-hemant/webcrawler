## Generic Web Crawler

This is a CLI based generic web crawler application. The CLI accepts two parameters for crawling and save the URL of the images present in the HTML in the output.json file. 

#### The CLI params are:

1. url: string representing the URL to be crawled.
2. depth: depth upto which the webcrawling is to be performed.

## How to run the program?

1. Clone the repo. `git clone https://github.com/kumar-hemant/webcrawler <foldername>`
2. Go to the cloned folder. `cd <foldername>`
3. Install the dependencies. `npm i`
4. Run the program using  `node index.mjs <url> <depth>`. Eg: node index.mjs https://www.xataka.com/lomejor 2
5. Once the program is complete, your data will be saved in the output.json file.

## Limitation

- This program only checks for images from img and picture tag and not in the CSS.
- This program works for server rendered HTML only and not client rendered HTML.

### Happy Crawling
